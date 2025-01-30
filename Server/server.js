const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const fileroutes = require('./routes/fileRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4300;

app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/files', fileroutes);


app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});