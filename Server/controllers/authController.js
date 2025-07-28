const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const register = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Utente già esistente' });
        }

        const user = new User({ username, password, email });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        res.status(201).json({ 
            token, 
            email: user.email,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Errore durante la registrazione' });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Credenziali non valide' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenziali non valide' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        res.status(200).json({ 
            token, 
            email: user.email,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Errore durante il login' });
    }
};

module.exports = { register, login };