const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    },
});

// Filtro per accettare immagini e video
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        // Immagini
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/svg+xml',
        // Video
        'video/mp4',
        'video/avi',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-ms-wmv',
        'video/x-flv',
        'video/webm',
        'video/x-matroska'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo di file non supportato. Sono accettati solo immagini e video.'), false);
    }
};

// Limite di dimensione: 5GB per file grandi
const upload = multer({ 
    storage, 
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 * 1024, // 5GB
        fieldSize: 5 * 1024 * 1024 * 1024, // 5GB per i campi
    }
});

module.exports = upload;