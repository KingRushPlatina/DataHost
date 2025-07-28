const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createCustomAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connesso a MongoDB');

        // Chiedi le credenziali (o imposta qui direttamente)
        const username = process.argv[2] || 'admin2';
        const password = process.argv[3] || 'password123';
        const email = process.argv[4] || 'admin2@datahost.com';

        // Controlla se l'utente esiste già
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log('Utente già esistente con username o email specificati');
            process.exit(1);
        }

        // Crea il nuovo admin
        const admin = new User({
            username,
            password, // Verrà hashata automaticamente
            email,
            role: 'admin'
        });

        await admin.save();
        console.log('Nuovo utente admin creato con successo!');
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);
        console.log(`Email: ${email}`);
        console.log(`Ruolo: admin`);
        
    } catch (error) {
        console.error('Errore durante la creazione dell\'admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

console.log('Uso: node createCustomAdmin.js [username] [password] [email]');
createCustomAdmin();
