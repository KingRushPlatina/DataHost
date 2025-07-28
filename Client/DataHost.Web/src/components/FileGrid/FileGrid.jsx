import React, { useState, useEffect } from 'react'
import { 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Pagination, 
  CircularProgress,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { Image, MoreVertical, Download, Trash2, Star } from 'lucide-react'
import api from '../../services/api'
import ImageDetail from '../ImageDetail/ImageDetail'
import AuthenticatedVideo from '../AuthenticatedVideo/AuthenticatedVideo'
import { useAuth } from '../../contexts/AuthContext'

const FileGrid = () => {
  const theme = useTheme()
  const { isAdmin } = useAuth()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isPhone = useMediaQuery(theme.breakpoints.down('xs')) || useMediaQuery('(max-width:480px)')
  const [files, setFiles] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [imageUrls, setImageUrls] = useState({}) // Cache per le immagini caricate
  const [showDetail, setShowDetail] = useState(false) // Mostra il dettaglio dell'immagine

  useEffect(() => {
    fetchFiles()
  }, [currentPage])

  // Cleanup dei blob URLs quando il componente si smonta
  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [imageUrls])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/file?page=${currentPage}`)
      console.log('Risposta dal backend:', response.data)
      console.log('Files ricevuti:', response.data.files)
      setFiles(response.data.files)
      setCurrentPage(response.data.currentPage)
      setTotalPages(response.data.totalPages)
      
      // Carica tutte le immagini e video con autenticazione
      await loadMedia(response.data.files)
    } catch (error) {
      console.error('Errore nel caricamento dei file:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMedia = async (fileObjects) => {
    const newImageUrls = {}
    
    for (const fileObj of fileObjects) {
      try {
        // Ora fileObj è sempre un oggetto con {url, type, filename}
        const fileUrl = fileObj.url;
        const fileType = fileObj.type;
        
        console.log('Caricamento media:', fileUrl, 'tipo:', fileType);
        
        if (fileType === 'image') {
          // Per le immagini, carica come blob
          const response = await api.get(fileUrl.replace('http://localhost:4300/api', ''), {
            responseType: 'blob'
          })
          
          const blobUrl = URL.createObjectURL(response.data)
          newImageUrls[fileUrl] = blobUrl
          console.log('Immagine caricata con JWT:', fileUrl)
        } else if (fileType === 'video') {
          // Per i video, crea un URL autenticato che può essere usato direttamente
          newImageUrls[fileUrl] = await createAuthenticatedVideoUrl(fileUrl)
          console.log('Video preparato per streaming:', fileUrl)
        }
      } catch (error) {
        console.error('Errore caricamento media:', fileObj, error)
        const fileUrl = fileObj.url || fileObj;
        newImageUrls[fileUrl] = null
      }
    }
    
    setImageUrls(prev => ({ ...prev, ...newImageUrls }))
  }

  // Funzione per creare URL video autenticati
  const createAuthenticatedVideoUrl = async (videoUrl) => {
    try {
      // Per i video usiamo una strategia diversa: 
      // Facciamo una richiesta HEAD per verificare l'accesso e poi usiamo l'URL diretto
      await api.head(videoUrl.replace('http://localhost:4300/api', ''))
      
      // Se la richiesta HEAD ha successo, significa che abbiamo accesso
      // Restituiamo l'URL originale che useremo con fetch custom
      return videoUrl
    } catch (error) {
      console.error('Errore autenticazione video:', error)
      return null
    }
  }

  const handleFileClick = (file) => {
    // file è sempre un oggetto {url, type, filename}
    setSelectedFile(file)
    setShowDetail(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedFile(null)
  }

  const handleDownload = async (mediaUrl, fileName) => {
    try {
      const response = await api.get(mediaUrl.replace('http://localhost:4300/api', ''), {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (error) {
      console.error('Errore durante il download:', error)
      alert('Errore durante il download del file')
    }
  }

  const handleDelete = async (fileUrl) => {
    try {
      await api.delete(fileUrl.replace('http://localhost:4300/api', ''))
      
      // Rimuovi il file dalla lista
      setFiles(prev => prev.filter(f => f.url !== fileUrl))
      
      // Rimuovi dall'cache
      setImageUrls(prev => {
        const newUrls = { ...prev }
        if (newUrls[fileUrl] && newUrls[fileUrl].startsWith('blob:')) {
          URL.revokeObjectURL(newUrls[fileUrl])
        }
        delete newUrls[fileUrl]
        return newUrls
      })
      
      setShowDetail(false)
      setSelectedFile(null)
      
      alert('File eliminato con successo!')
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error)
      alert('Errore durante l\'eliminazione del file')
    }
  }

  const getFileName = (fileObj) => {
    // fileObj è sempre un oggetto {url, type, filename}
    return fileObj.filename || fileObj.url.split('/').pop()
  }

  const handleContextMenu = (e, file) => {
    e.preventDefault()
    // Implementa menu contestuale
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      {!isPhone && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 400, color: '#202124' }}>
            {isAdmin() ? 'Tutti i file' : 'I miei file'}
          </Typography>
          <IconButton>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f6368">
              <path d="M3 3h6v6H3zm0 8h6v6H3zm8-8h6v6h-6zm0 8h6v6h-6z"/>
            </svg>
          </IconButton>
        </Box>
      )}

      {/* File Grid */}
      <Grid container spacing={isMobile ? 1 : 2}>
        {files.map((file, index) => {
          const fileUrl = file.url;
          const fileType = file.type;
          
          return (
            <Grid item xs={isPhone ? 12 : 6} sm={4} md={3} lg={2} key={index}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: selectedFile?.url === fileUrl ? '2px solid #4285f4' : '1px solid #e0e0e0',
                  display: isPhone ? 'block' : 'block',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-2px)',
                  }
                }}
                onClick={() => handleFileClick(file)}
                onContextMenu={(e) => handleContextMenu(e, file)}
              >
                <CardMedia
                  sx={{ 
                    height: isPhone ? 200 : (isMobile ? 120 : 140),
                    width: '100%',
                    position: 'relative',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {fileType === 'video' ? (
                    <AuthenticatedVideo 
                      src={imageUrls[fileUrl]}
                      alt={getFileName(file)}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }}
                      onLoadedMetadata={(e) => {
                        e.target.currentTime = 1;
                      }}
                    />
                  ) : (
                    <img 
                      src={imageUrls[fileUrl] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcmljYW1lbnRvLi4uPC90ZXh0Pjwvc3ZnPg=='} 
                      alt={getFileName(file)}
                      loading="lazy"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  
                  {/* Video overlay */}
                  {fileType === 'video' && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      left: 8, 
                      backgroundColor: 'rgba(0,0,0,0.7)', 
                      borderRadius: 1, 
                      p: 0.5 
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </Box>
                  )}
                </CardMedia>
                
                {!isPhone && (
                  <CardContent sx={{ p: 1, pb: '8px !important' }}>
                    <Typography 
                      variant="body2" 
                      noWrap 
                      sx={{ 
                        fontSize: 12, 
                        color: '#202124',
                        fontWeight: 400
                      }}
                    >
                      {getFileName(file)}
                    </Typography>
                    {isAdmin() && file.owner && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: 10, 
                          color: '#5f6368',
                          display: 'block'
                        }}
                      >
                        di {file.owner}
                      </Typography>
                    )}
                  </CardContent>
                )}
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Modal dettaglio immagine/video */}
      {showDetail && selectedFile && (
        <ImageDetail
          imageUrl={imageUrls[selectedFile.url]}
          fileName={getFileName(selectedFile)}
          fileType={selectedFile.type}
          onClose={handleCloseDetail}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      )}
    </Box>
  )
}

export default FileGrid