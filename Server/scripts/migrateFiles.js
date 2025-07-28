const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const File = require('../models/File');
const User = require('../models/User');
const { loadSettings } = require('../controllers/settingsController');
require('dotenv').config();

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

const migrateFiles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connesso a MongoDB');

        // Trova l'admin
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('Nessun admin trovato. Crea prima un admin con il script createAdmin.js');
            process.exit(1);
        }

        const settings = loadSettings();
        const uploadsDir = settings.uploadsPath;
        
        if (!fs.existsSync(uploadsDir)) {
            console.log('Directory uploads non trovata:', uploadsDir);
            process.exit(1);
        }

        const files = fs.readdirSync(uploadsDir);
        
        for (const filename of files) {
            // Controlla se il file è già nel database
            const existingFile = await File.findOne({ filename });
            if (existingFile) {
                console.log(`File già migrato: ${filename}`);
                continue;
            }

            const filePath = path.join(uploadsDir, filename);
            const stats = fs.statSync(filePath);
            
            const fileRecord = new File({
                filename: filename,
                originalName: filename, // Non abbiamo l'original name per i file esistenti
                path: filePath,
                size: stats.size,
                type: getFileType(filename),
                userId: admin._id,
                uploadDate: stats.birthtime || new Date()
            });

            await fileRecord.save();
            console.log(`File migrato: ${filename}`);
        }

        console.log('Migrazione completata!');
        
    } catch (error) {
        console.error('Errore durante la migrazione:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

migrateFiles();
