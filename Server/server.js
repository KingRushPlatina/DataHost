const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const fileroutes = require('./routes/fileRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4300;

// Configurazione per file grandi
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ 
    limit: '1gb', 
    extended: true, 
    parameterLimit: 100000 
}));

// Aumenta il timeout per upload lunghi
app.use((req, res, next) => {
    req.setTimeout(300000) // 5 minuti
    res.setTimeout(300000) // 5 minuti
    next()
});

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/file', fileroutes);


app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});