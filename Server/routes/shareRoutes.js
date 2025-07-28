const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
    shareFile, 
    getSharedFiles, 
    removeFileShare, 
    getAvailableUsers,
    getFileShares 
} = require('../controllers/shareController');

// Condividi un file con un utente
router.post('/share', authMiddleware, shareFile);

// Ottieni tutti i file condivisi con l'utente corrente
router.get('/shared-with-me', authMiddleware, getSharedFiles);

// Rimuovi una condivisione
router.delete('/share/:shareId', authMiddleware, removeFileShare);

// Ottieni tutti gli utenti disponibili per la condivisione (escluso admin e l'utente stesso)
router.get('/users', authMiddleware, getAvailableUsers);

// Ottieni le condivisioni di un file specifico
router.get('/file/:fileId/shares', authMiddleware, getFileShares);

module.exports = router;
