import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
  Divider,
  IconButton
} from '@mui/material';
import { Settings as SettingsIcon, Folder as FolderIcon, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getUploadsPath, setUploadsPath } from '../services/settings';

const Settings = () => {
  const [uploadsPath, setUploadsPathState] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    try {
      setLoading(true);
      const response = await getUploadsPath();
      if (response.success) {
        setUploadsPathState(response.uploadsPath);
      }
    } catch (error) {
      showAlert('Errore nel caricamento delle impostazioni: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!uploadsPath.trim()) {
      showAlert('Inserisci un path valido', 'error');
      return;
    }

    try {
      setSaving(true);
      const response = await setUploadsPath(uploadsPath);
      if (response.success) {
        showAlert('Impostazioni salvate con successo!', 'success');
      }
    } catch (error) {
      showAlert('Errore nel salvataggio: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 5000);
  };

  const handlePathChange = (event) => {
    setUploadsPathState(event.target.value);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton 
            onClick={() => navigate('/')} 
            sx={{ mr: 2 }}
            aria-label="Torna alla dashboard"
          >
            <ArrowBack />
          </IconButton>
          <SettingsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Impostazioni
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {alert.show && (
          <Alert severity={alert.severity} sx={{ mb: 3 }}>
            {alert.message}
          </Alert>
        )}

        <Box mb={4}>
          <Typography variant="h6" component="h2" mb={2} display="flex" alignItems="center">
            <FolderIcon sx={{ mr: 1 }} />
            Percorso File
          </Typography>
          
          <Typography variant="body2" color="text.secondary" mb={2}>
            Configura il percorso dove salvare e leggere i file caricati (immagini e video).
          </Typography>

          <TextField
            fullWidth
            label="Percorso Upload"
            value={uploadsPath}
            onChange={handlePathChange}
            placeholder="C:\DataHost\Uploads"
            helperText="Inserisci il percorso completo della cartella dove salvare i file"
            variant="outlined"
            sx={{ mb: 3 }}
          />

          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : null}
              sx={{ minWidth: 120 }}
            >
              {saving ? 'Salvando...' : 'Salva'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={loadCurrentSettings}
              disabled={loading || saving}
            >
              Ripristina
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box>
          <Typography variant="h6" component="h2" mb={2}>
            Informazioni
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            • Il path deve essere accessibile in scrittura dall'applicazione<br />
            • Se il percorso non esiste, verrà creato automaticamente<br />
            • Dopo aver cambiato il percorso, i file esistenti non saranno spostati automaticamente<br />
            • Usa sempre percorsi assoluti (es: C:\DataHost\Uploads)
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;
