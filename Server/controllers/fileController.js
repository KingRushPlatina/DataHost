const fs = require('fs');
const path = require('path');

// Carica un file
const uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Nessun file caricato.' });
    }

    res.status(201).json({
        message: 'File caricato con successo.',
        file: req.file.filename,
    });
};

// Ottieni l'elenco dei file (paginato)
const getFiles = (req, res) => {
    const page = parseInt(req.query.page) || 1; // Pagina corrente
    const limit = parseInt(req.query.limit) || 10; // Numero di file per pagina
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const uploadsDir = path.join(__dirname, '../uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Errore durante la lettura dei file.' });
        }

        const paginatedFiles = files.slice(startIndex, endIndex);
        res.status(200).json({
            files: paginatedFiles,
            currentPage: page,
            totalPages: Math.ceil(files.length / limit),
        });
    });
};

module.exports = { uploadFile, getFiles };