const fs = require('fs');
const path = require('path');
const { loadSettings } = require('./settingsController');
const File = require('../models/File');
const User = require('../models/User');

// Funzione per rilevare il tipo di file
const getFileType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    
    if (imageExtensions.includes(ext)) {
        return 'image';
    } else if (videoExtensions.includes(ext)) {
        return 'video';
    }
    return 'other';
};

const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Nessun file caricato.' });
    }

    try {
        const fileType = getFileType(req.file.filename);
        const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
        
        // Salva il file nel database associandolo all'utente
        const newFile = new File({
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            type: fileType,
            userId: req.userId, // Viene dal middleware di autenticazione
        });

        await newFile.save();
        
        console.log(`File caricato: ${req.file.filename}, Tipo: ${fileType}, Dimensione: ${fileSizeMB}MB, Utente: ${req.userId}`);
        
        res.status(201).json({
            message: 'File caricato con successo.',
            file: req.file.filename,
            type: fileType,
            size: fileSizeMB + 'MB'
        });
    } catch (error) {
        console.error('Errore durante il salvataggio del file:', error);
        res.status(500).json({ message: 'Errore durante il salvataggio del file.' });
    }
};

const getFiles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        const skip = (page - 1) * limit;

        // Ottieni l'utente corrente per verificare se è admin
        const currentUser = await User.findById(req.userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'Utente non trovato.' });
        }

        // Se l'utente è admin, vede tutti i file, altrimenti solo i suoi
        let query = {};
        if (currentUser.role !== 'admin') {
            query.userId = req.userId;
        }

        const files = await File.find(query)
            .populate('userId', 'username')
            .sort({ uploadDate: -1 })
            .skip(skip)
            .limit(limit);

        const totalFiles = await File.countDocuments(query);

        const fileList = files.map(file => {
            const endpoint = file.type === 'video' ? 'video' : 'image';
            return {
                url: `${req.protocol}://${req.get('host')}/api/file/${endpoint}/${file.filename}`,
                type: file.type,
                filename: file.filename,
                originalName: file.originalName,
                size: file.size,
                uploadDate: file.uploadDate,
                owner: file.userId.username
            };
        });

        res.status(200).json({
            files: fileList,
            currentPage: page,
            totalPages: Math.ceil(totalFiles / limit),
            totalFiles: totalFiles
        });
    } catch (error) {
        console.error('Errore durante il recupero dei file:', error);
        res.status(500).json({ message: 'Errore durante il recupero dei file.' });
    }
};

const getFile = async (req, res) => {
    const filename = req.params.filename;
    
    try {
        // Verifica che il file esista nel database
        const fileRecord = await File.findOne({ filename });
        if (!fileRecord) {
            return res.status(404).json({ message: 'File non trovato.' });
        }

        // Verifica i permessi: l'utente può vedere solo i suoi file, tranne se è admin
        const currentUser = await User.findById(req.userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'Utente non trovato.' });
        }

        if (currentUser.role !== 'admin' && fileRecord.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Non hai i permessi per accedere a questo file.' });
        }

        const settings = loadSettings();
        const filePath = path.join(settings.uploadsPath, filename);
        
        // Controlla se il file esiste fisicamente
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File fisico non trovato.' });
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;
        const fileType = getFileType(filename);

        // Per i video, supporta sempre il range streaming
        if (fileType === 'video' && range) {
            // Parsing del range header per streaming video
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + (1024 * 1024), fileSize - 1); // 1MB chunks
            const chunksize = (end - start) + 1;
            
            const file = fs.createReadStream(filePath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': getContentType(filename),
                'Cache-Control': 'no-cache',
            };
            
            res.writeHead(206, head);
            file.pipe(res);
        } else if (fileType === 'video') {
            // Per video senza range, invia i primi chunks
            const chunkSize = 1024 * 1024; // 1MB
            const head = {
                'Content-Length': fileSize,
                'Content-Type': getContentType(filename),
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'no-cache',
            };
            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res);
        } else {
            // Per le immagini, usa il metodo normale
            const head = {
                'Content-Length': fileSize,
                'Content-Type': getContentType(filename),
                'Cache-Control': 'public, max-age=3600', // Cache per 1 ora
            };
            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (error) {
        console.error('Errore durante il recupero del file:', error);
        res.status(500).json({ message: 'Errore durante il recupero del file.' });
    }
};

// Funzione per determinare il Content-Type
const getContentType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.mp4': 'video/mp4',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
        '.wmv': 'video/x-ms-wmv',
        '.flv': 'video/x-flv',
        '.webm': 'video/webm',
        '.mkv': 'video/x-matroska'
    };
    return mimeTypes[ext] || 'application/octet-stream';
};

const getFileInfo = async (req, res) => {
    const filename = req.params.filename;
    
    try {
        // Verifica che il file esista nel database
        const fileRecord = await File.findOne({ filename }).populate('userId', 'username');
        if (!fileRecord) {
            return res.status(404).json({ message: 'File non trovato.' });
        }

        // Verifica i permessi: l'utente può vedere solo i suoi file, tranne se è admin
        const currentUser = await User.findById(req.userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'Utente non trovato.' });
        }

        if (currentUser.role !== 'admin' && fileRecord.userId._id.toString() !== req.userId) {
            return res.status(403).json({ message: 'Non hai i permessi per accedere a questo file.' });
        }

        const settings = loadSettings();
        const filePath = path.join(settings.uploadsPath, filename);
        
        // Controlla se il file esiste fisicamente
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File fisico non trovato.' });
        }

        const stat = fs.statSync(filePath);
        
        res.status(200).json({
            filename: fileRecord.filename,
            originalName: fileRecord.originalName,
            type: fileRecord.type,
            size: fileRecord.size,
            sizeFormatted: fileRecord.size >= 1024 * 1024 * 1024 
                ? (fileRecord.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
                : (fileRecord.size / (1024 * 1024)).toFixed(2) + ' MB',
            url: `${req.protocol}://${req.get('host')}/api/file/${fileRecord.type}/${filename}`,
            uploadDate: fileRecord.uploadDate,
            owner: fileRecord.userId.username,
            createdAt: stat.birthtime,
            modifiedAt: stat.mtime
        });
    } catch (error) {
        console.error('Errore durante il recupero delle informazioni del file:', error);
        res.status(500).json({ message: 'Errore durante il recupero delle informazioni del file.' });
    }
};

module.exports = { uploadFile, getFiles, getFile, getFileInfo };