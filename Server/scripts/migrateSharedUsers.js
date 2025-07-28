const mongoose = require('mongoose');
const File = require('../models/File');
const FileShare = require('../models/FileShare');
require('dotenv').config();

const migrateSharedUserIds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connesso a MongoDB');

        // Trova tutte le condivisioni esistenti
        const shares = await FileShare.find({});
        
        console.log(`Trovate ${shares.length} condivisioni da migrare`);

        for (const share of shares) {
            // Aggiungi l'utente condiviso alla lista sharedUserIds del file
            await File.findByIdAndUpdate(share.fileId, {
                $addToSet: { sharedUserIds: share.sharedWithId }
            });
            
            console.log(`Migrato: File ${share.fileId} condiviso con ${share.sharedWithId}`);
        }

        console.log('Migrazione completata!');
        
    } catch (error) {
        console.error('Errore durante la migrazione:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

migrateSharedUserIds();
