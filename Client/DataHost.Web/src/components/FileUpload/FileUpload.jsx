import React, { useState, useRef } from 'react'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  LinearProgress,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { Upload, X, FileImage, File, Video } from 'lucide-react'
import api from '../../services/api'

const FileUpload = ({ onClose, onUploadSuccess }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(selectedFiles)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(droppedFiles)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    setUploading(true)
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)

        await api.post('/file/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 300000, // 5 minuti di timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(prev => ({
              ...prev,
              [i]: percentCompleted
            }))
          }
        })
      }
      
      onUploadSuccess()
      onClose()
    } catch (error) {
      console.error('Errore upload:', error)
      if (error.code === 'ECONNABORTED') {
        alert('Timeout durante il caricamento. Il file potrebbe essere troppo grande.')
      } else {
        alert('Errore durante il caricamento dei file: ' + (error.response?.data?.message || error.message))
      }
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <FileImage size={20} />
    } else if (file.type.startsWith('video/')) {
      return <Video size={20} />
    }
    return <File size={20} />
  }

  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Carica file</Typography>
        <IconButton onClick={onClose}>
          <X size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Paper
          sx={{
            p: 4,
            border: '2px dashed #e0e0e0',
            borderRadius: 2,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: '#4285f4',
              backgroundColor: '#f8f9ff'
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={64} style={{ color: '#4285f4', marginBottom: 16 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Trascina i file qui
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            oppure
          </Typography>
          <Button variant="outlined" component="span">
            Sfoglia dal computer
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            accept="image/*,video/*"
            style={{ display: 'none' }}
          />
        </Paper>

        {files.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              File selezionati
            </Typography>
            <List>
              {files.map((file, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    {getFileIcon(file)}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={
                      file.size >= 1024 * 1024 * 1024 
                        ? (file.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
                        : (file.size / (1024 * 1024)).toFixed(2) + ' MB'
                    }
                  />
                  {uploadProgress[index] !== undefined && (
                    <Box sx={{ width: '100px', mr: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={uploadProgress[index]} 
                        sx={{ mb: 0.5 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {uploadProgress[index]}%
                      </Typography>
                    </Box>
                  )}
                  {!uploading && (
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => removeFile(index)}>
                        <X size={16} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={uploading}>
          Annulla
        </Button>
        <Button 
          onClick={uploadFiles} 
          variant="contained" 
          disabled={files.length === 0 || uploading}
        >
          {uploading ? 'Caricamento...' : 'Carica'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FileUpload