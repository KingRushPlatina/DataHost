const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const { uploadFile, getFiles, getFile } = require('../controllers/fileController');

router.post('/upload', authMiddleware, uploadMiddleware.single('file'), uploadFile);
router.get('/', authMiddleware, getFiles);
router.get('/image/:filename', authMiddleware, getFile);

module.exports = router;