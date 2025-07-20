const fs = require('fs');
const path = require('path');

// File per salvare le configurazioni
const CONFIG_FILE = path.join(__dirname, '../config/settings.json');

// Carica le impostazioni dal file
const loadSettings = () => {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Errore nel caricamento delle impostazioni:', error);
    }
    
    // Impostazioni di default
    return {
        uploadsPath: path.join(__dirname, '../uploads')
    };
};

// Salva le impostazioni nel file
const saveSettings = (settings) => {
    try {
        // Crea la directory config se non esiste
        const configDir = path.dirname(CONFIG_FILE);
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error('Errore nel salvataggio delle impostazioni:', error);
        return false;
    }
};

// Ottieni il path degli upload
const getUploadsPath = (req, res) => {
    try {
        const settings = loadSettings();
        res.status(200).json({
            success: true,
            uploadsPath: settings.uploadsPath
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero del path degli upload',
            error: error.message
        });
    }
};

// Imposta il path degli upload
const setUploadsPath = (req, res) => {
    try {
        const { uploadsPath } = req.body;
        
        if (!uploadsPath) {
            return res.status(400).json({
                success: false,
                message: 'Path degli upload richiesto'
            });
        }

        // Verifica che il path esista o sia creabile
        try {
            if (!fs.existsSync(uploadsPath)) {
                fs.mkdirSync(uploadsPath, { recursive: true });
            }
            
            // Verifica i permessi di scrittura
            fs.accessSync(uploadsPath, fs.constants.W_OK);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Path non valido o non accessibile in scrittura',
                error: error.message
            });
        }

        const settings = loadSettings();
        settings.uploadsPath = uploadsPath;
        
        if (saveSettings(settings)) {
            res.status(200).json({
                success: true,
                message: 'Path degli upload aggiornato con successo',
                uploadsPath: uploadsPath
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Errore nel salvataggio delle impostazioni'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Errore nell\'aggiornamento del path degli upload',
            error: error.message
        });
    }
};

// Ottieni tutte le impostazioni
const getAllSettings = (req, res) => {
    try {
        const settings = loadSettings();
        res.status(200).json({
            success: true,
            settings: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero delle impostazioni',
            error: error.message
        });
    }
};

module.exports = {
    loadSettings,
    saveSettings,
    getUploadsPath,
    setUploadsPath,
    getAllSettings
};
