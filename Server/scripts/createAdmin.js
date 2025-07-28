const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connesso a MongoDB');

        // Controlla se esiste già un admin
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Admin già esistente:', adminExists.username);
            process.exit(0);
        }

        // Crea un utente admin di default
        const admin = new User({
            username: 'admin',
            password: 'admin123', // Cambierà hash automaticamente
            email: 'admin@datahost.com',
            role: 'admin'
        });

        await admin.save();
        console.log('Utente admin creato con successo!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Email: admin@datahost.com');
        
    } catch (error) {
        console.error('Errore durante la creazione dell\'admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createAdmin();
