import React, { useState, useEffect } from 'react'
import { Image, MoreVertical, Download, Trash2, Star } from 'lucide-react'
import api from '../../services/api'
import ImageDetail from '../ImageDetail/ImageDetail'
import AuthenticatedVideo from '../AuthenticatedVideo/AuthenticatedVideo'
import './FileGrid.css'

const FileGrid = () => {
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
    return <div className="loading">Caricamento file...</div>
  }

  return (
    <div className="file-grid-container">
      <div className="grid-header">
        <h2>I miei file</h2>
        <div className="view-options">
          <button className="view-button">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M3 3h6v6H3zm0 8h6v6H3zm8-8h6v6h-6zm0 8h6v6h-6z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="file-grid">
        {files.map((file, index) => {
          // file è sempre un oggetto {url, type, filename}
          const fileUrl = file.url;
          const fileType = file.type;
          
          return (
            <div
              key={index}
              className={`file-card ${selectedFile?.url === fileUrl ? 'selected' : ''}`}
              onClick={() => handleFileClick(file)}
              onContextMenu={(e) => handleContextMenu(e, file)}
            >
              <div className="file-preview">
                {fileType === 'video' ? (
                  <AuthenticatedVideo 
                    src={imageUrls[fileUrl]}
                    alt={getFileName(file)}
                    className="video-thumbnail"
                    onLoadedMetadata={(e) => {
                      // Mostra il primo frame del video
                      e.target.currentTime = 1;
                    }}
                  />
                ) : (
                  <img 
                    src={imageUrls[fileUrl] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcmljYW1lbnRvLi4uPC90ZXh0Pjwvc3ZnPg=='} 
                    alt={getFileName(file)} 
                    loading="lazy"
                  />
                )}
                
                {/* Overlay per indicare il tipo di file */}
                {fileType === 'video' && (
                  <div className="file-type-overlay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Precedente
          </button>
          <span className="page-info">
            Pagina {currentPage} di {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Successiva
          </button>
        </div>
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
    </div>
  )
}

export default FileGrid