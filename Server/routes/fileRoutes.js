const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const { uploadFile, getFiles, getFile, getFileInfo } = require('../controllers/fileController');

router.post('/upload', authMiddleware, uploadMiddleware.single('file'), uploadFile);
router.get('/', authMiddleware, getFiles);
router.get('/info/:filename', authMiddleware, getFileInfo); // Nuova route per info file
router.get('/image/:filename', authMiddleware, getFile);
router.get('/video/:filename', authMiddleware, getFile); // Nuova route per i video

module.exports = router;