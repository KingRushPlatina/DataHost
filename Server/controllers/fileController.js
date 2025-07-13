const fs = require('fs');
const path = require('path');

const uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Nessun file caricato.' });
    }

    res.status(201).json({
        message: 'File caricato con successo.',
        file: req.file.filename,
    });
};

const getFiles = (req, res) => {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const uploadsDir = path.join(__dirname, '../uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Errore durante la lettura dei file.' });
        }

        const paginatedFiles = files.slice(startIndex, endIndex).map(filename => `${req.protocol}://${req.get('host')}/api/file/image/${filename}`);
        res.status(200).json({
            files: paginatedFiles,
            currentPage: page,
            totalPages: Math.ceil(files.length / limit),
        });
    });
};

const getFile = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    res.sendFile(filePath, err => {
        if (err) {
            return res.status(404).json({ message: 'File non trovato.' });
        }
    });
};

module.exports = { uploadFile, getFiles, getFile };