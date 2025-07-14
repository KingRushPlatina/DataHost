const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const fileroutes = require('./routes/fileRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4300;

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/file', fileroutes);


app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});