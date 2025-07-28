const FileShare = require('../models/FileShare');
const File = require('../models/File');
const User = require('../models/User');

// Condividi un file con un utente
const shareFile = async (req, res) => {
    try {
        const { fileId, sharedWithId } = req.body;
        const ownerId = req.userId;

        // Verifica che il file esista e appartenga all'utente
        const file = await File.findOne({ _id: fileId, userId: ownerId });
        if (!file) {
            return res.status(404).json({ message: 'File non trovato o non hai i permessi per condividerlo.' });
        }

        // Verifica che l'utente con cui condividere esista e non sia admin
        const targetUser = await User.findById(sharedWithId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Utente non trovato.' });
        }

        if (targetUser.role === 'admin') {
            return res.status(400).json({ message: 'Non puoi condividere file con gli admin.' });
        }

        // Verifica che non si stia condividendo con se stesso
        if (ownerId === sharedWithId) {
            return res.status(400).json({ message: 'Non puoi condividere un file con te stesso.' });
        }

        // Crea la condivisione (il duplicato viene gestito dall'indice unico)
        const share = new FileShare({
            fileId,
            ownerId,
            sharedWithId
        });

        await share.save();

        // Aggiungi l'utente alla lista sharedUserIds del file
        await File.findByIdAndUpdate(fileId, {
            $addToSet: { sharedUserIds: sharedWithId }
        });

        res.status(201).json({ 
            message: 'File condiviso con successo.',
            share: await FileShare.findById(share._id)
                .populate('sharedWithId', 'username')
                .populate('fileId', 'filename originalName')
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'File già condiviso con questo utente.' });
        }
        console.error('Errore nella condivisione del file:', error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
};

// Ottieni tutti i file condivisi con l'utente corrente
const getSharedFiles = async (req, res) => {
    try {
        const userId = req.userId;

        const shares = await FileShare.find({ sharedWithId: userId })
            .populate({
                path: 'fileId',
                select: 'filename originalName path size type uploadDate',
            })
            .populate('ownerId', 'username')
            .sort({ sharedAt: -1 });

        const sharedFiles = shares.map(share => ({
            ...share.fileId.toObject(),
            owner: share.ownerId.username,
            sharedAt: share.sharedAt,
            shareId: share._id,
            url: `${req.protocol}://${req.get('host')}/api/file/${share.fileId.type}/${share.fileId.filename}`
        }));

        res.status(200).json({ files: sharedFiles });

    } catch (error) {
        console.error('Errore nel recupero dei file condivisi:', error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
};

// Rimuovi una condivisione
const removeFileShare = async (req, res) => {
    try {
        const { shareId } = req.params;
        const userId = req.userId;

        // Trova la condivisione e verifica i permessi
        const share = await FileShare.findById(shareId);
        if (!share) {
            return res.status(404).json({ message: 'Condivisione non trovata.' });
        }

        // Solo il proprietario del file può rimuovere la condivisione
        if (share.ownerId.toString() !== userId) {
            return res.status(403).json({ message: 'Non hai i permessi per rimuovere questa condivisione.' });
        }

        await FileShare.findByIdAndDelete(shareId);

        // Rimuovi l'utente dalla lista sharedUserIds del file
        await File.findByIdAndUpdate(share.fileId, {
            $pull: { sharedUserIds: share.sharedWithId }
        });

        res.status(200).json({ message: 'Condivisione rimossa con successo.' });

    } catch (error) {
        console.error('Errore nella rimozione della condivisione:', error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
};

// Ottieni tutti gli utenti disponibili per la condivisione
const getAvailableUsers = async (req, res) => {
    try {
        const currentUserId = req.userId;

        // Ottieni tutti gli utenti tranne admin e l'utente corrente
        const users = await User.find({ 
            _id: { $ne: currentUserId },
            role: { $ne: 'admin' }
        }).select('_id username email');

        res.status(200).json({ users });

    } catch (error) {
        console.error('Errore nel recupero degli utenti:', error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
};

// Ottieni le condivisioni di un file specifico
const getFileShares = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.userId;

        // Verifica che il file appartenga all'utente
        const file = await File.findOne({ _id: fileId, userId });
        if (!file) {
            return res.status(404).json({ message: 'File non trovato o non hai i permessi.' });
        }

        const shares = await FileShare.find({ fileId })
            .populate('sharedWithId', 'username email')
            .sort({ sharedAt: -1 });

        res.status(200).json({ shares });

    } catch (error) {
        console.error('Errore nel recupero delle condivisioni:', error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
};

module.exports = {
    shareFile,
    getSharedFiles,
    removeFileShare,
    getAvailableUsers,
    getFileShares
};
