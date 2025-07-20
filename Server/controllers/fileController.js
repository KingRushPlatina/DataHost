const fs = require('fs');
const path = require('path');
const { loadSettings } = require('./settingsController');

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

const uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Nessun file caricato.' });
    }

    const fileType = getFileType(req.file.filename);
    const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
    
    console.log(`File caricato: ${req.file.filename}, Tipo: ${fileType}, Dimensione: ${fileSizeMB}MB`);
    
    res.status(201).json({
        message: 'File caricato con successo.',
        file: req.file.filename,
        type: fileType,
        size: fileSizeMB + 'MB'
    });
};

const getFiles = (req, res) => {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const settings = loadSettings();
    const uploadsDir = settings.uploadsPath;
    
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Errore durante la lettura dei file.' });
        }

        const fileList = files.slice(startIndex, endIndex).map(filename => {
            const fileType = getFileType(filename);
            const endpoint = fileType === 'video' ? 'video' : 'image';
            return {
                url: `${req.protocol}://${req.get('host')}/api/file/${endpoint}/${filename}`,
                type: fileType,
                filename: filename
            };
        });

        res.status(200).json({
            files: fileList,
            currentPage: page,
            totalPages: Math.ceil(files.length / limit),
        });
    });
};

const getFile = (req, res) => {
    const filename = req.params.filename;
    const settings = loadSettings();
    const filePath = path.join(settings.uploadsPath, filename);
    
    // Controlla se il file esiste
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File non trovato.' });
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

const getFileInfo = (req, res) => {
    const filename = req.params.filename;
    const settings = loadSettings();
    const filePath = path.join(settings.uploadsPath, filename);
    
    // Controlla se il file esiste
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File non trovato.' });
    }

    const stat = fs.statSync(filePath);
    const fileType = getFileType(filename);
    const fileSize = stat.size;
    
    res.status(200).json({
        filename: filename,
        type: fileType,
        size: fileSize,
        sizeFormatted: fileSize >= 1024 * 1024 * 1024 
            ? (fileSize / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
            : (fileSize / (1024 * 1024)).toFixed(2) + ' MB',
        url: `${req.protocol}://${req.get('host')}/api/file/${fileType}/${filename}`,
        createdAt: stat.birthtime,
        modifiedAt: stat.mtime
    });
};

module.exports = { uploadFile, getFiles, getFile, getFileInfo };