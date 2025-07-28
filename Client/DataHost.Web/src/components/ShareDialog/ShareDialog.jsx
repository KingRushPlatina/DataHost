import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { X, Share, UserPlus } from 'lucide-react';
import api from '../../services/api';

const ShareDialog = ({ open, onClose, file }) => {
  const [users, setUsers] = useState([]);
  const [existingShares, setExistingShares] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && file) {
      fetchUsers();
      fetchExistingShares();
    }
  }, [open, file]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/share/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Errore nel caricamento degli utenti:', error);
      setError('Errore nel caricamento degli utenti');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingShares = async () => {
    try {
      const response = await api.get(`/share/file/${file._id}/shares`);
      setExistingShares(response.data.shares);
    } catch (error) {
      console.error('Errore nel caricamento delle condivisioni:', error);
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      setError('Seleziona almeno un utente');
      return;
    }

    try {
      setSharingLoading(true);
      setError('');

      // Condividi con tutti gli utenti selezionati
      const sharePromises = selectedUsers.map(userId =>
        api.post('/share/share', {
          fileId: file._id,
          sharedWithId: userId
        })
      );

      await Promise.all(sharePromises);

      // Ricarica le condivisioni esistenti
      await fetchExistingShares();
      setSelectedUsers([]);
      
      alert('File condiviso con successo!');
    } catch (error) {
      console.error('Errore nella condivisione:', error);
      setError(error.response?.data?.message || 'Errore nella condivisione');
    } finally {
      setSharingLoading(false);
    }
  };

  const handleRemoveShare = async (shareId) => {
    try {
      await api.delete(`/share/share/${shareId}`);
      await fetchExistingShares();
      alert('Condivisione rimossa con successo!');
    } catch (error) {
      console.error('Errore nella rimozione della condivisione:', error);
      alert('Errore nella rimozione della condivisione');
    }
  };

  const getAvailableUsers = () => {
    const sharedUserIds = existingShares.map(share => share.sharedWithId._id);
    return users.filter(user => !sharedUserIds.includes(user._id));
  };

  if (!file) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Share size={20} />
        Condividi "{file.filename || file.originalName}"
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Condivisioni esistenti */}
        {existingShares.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
              Condiviso con:
            </Typography>
            <List dense>
              {existingShares.map((share) => (
                <ListItem key={share._id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={share.sharedWithId.username}
                    secondary={`Condiviso il ${new Date(share.sharedAt).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveShare(share._id)}
                      size="small"
                    >
                      <X size={16} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Utenti disponibili per la condivisione */}
        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
          Condividi con:
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
            {getAvailableUsers().map((user) => (
              <ListItem key={user._id} sx={{ px: 0 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleUserToggle(user._id)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">{user.username}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </ListItem>
            ))}
            {getAvailableUsers().length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Nessun utente disponibile per la condivisione
              </Typography>
            )}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Annulla
        </Button>
        <Button
          onClick={handleShare}
          variant="contained"
          disabled={selectedUsers.length === 0 || sharingLoading}
          startIcon={sharingLoading ? <CircularProgress size={16} /> : <UserPlus size={16} />}
        >
          {sharingLoading ? 'Condivisione...' : `Condividi${selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog;
