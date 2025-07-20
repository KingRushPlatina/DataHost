const express = require('express');
const router = express.Router();
const { getUploadsPath, setUploadsPath, getAllSettings } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

// Proteggi tutte le route delle impostazioni con autenticazione
router.use(authMiddleware);

// GET /api/settings - Ottieni tutte le impostazioni
router.get('/', getAllSettings);

// GET /api/settings/uploads-path - Ottieni il path degli upload
router.get('/uploads-path', getUploadsPath);

// POST /api/settings/uploads-path - Imposta il path degli upload
router.post('/uploads-path', setUploadsPath);

module.exports = router;
