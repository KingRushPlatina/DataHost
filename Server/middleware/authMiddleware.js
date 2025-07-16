const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    // Prova prima l'header Authorization, poi il query parameter
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Accesso negato. Token mancante.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token non valido.' });
    }
};

module.exports = authMiddleware;