import React, { useState, useEffect } from 'react'
import { X, Download, Trash2, Share } from 'lucide-react'
import api from '../../services/api'
import AuthenticatedVideo from '../AuthenticatedVideo/AuthenticatedVideo'
import VideoPlayer from '../VideoPlayer/VideoPlayer'
import './ImageDetail.css'

const ImageDetail = ({ imageUrl, fileName, fileType = 'image', onClose, onDownload, onDelete }) => {
  const [fileInfo, setFileInfo] = useState(null)
  const [mediaUrl, setMediaUrl] = useState(imageUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Carica informazioni dettagliate del file
  useEffect(() => {
    if (fileName) {
      loadFileInfo()
    }
  }, [fileName])

  const loadFileInfo = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Chiamata per ottenere le informazioni dettagliate del file
      const infoResponse = await api.get(`/file/info/${fileName}`)
      setFileInfo(infoResponse.data)
      
      // Per immagini e video, se non abbiamo già l'URL, caricalo come blob
      if (!imageUrl) {
        const fileEndpoint = infoResponse.data.type === 'video' ? 'video' : 'image'
        const response = await api.get(`/file/${fileEndpoint}/${fileName}`, {
          responseType: 'blob'
        })
        const url = URL.createObjectURL(response.data)
        setMediaUrl(url)
      }
    } catch (error) {
      console.error('Error loading file info:', error)
      setError('Errore nel caricamento delle informazioni del file')
    } finally {
      setLoading(false)
    }
  }
  // Chiudi con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Previeni scroll del body quando il modal è aperto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload(mediaUrl, fileName)
    }
  }

  const handleDelete = () => {
    if (onDelete && window.confirm(`Sei sicuro di voler eliminare ${fileType === 'video' ? 'questo video' : 'questa immagine'}?`)) {
      onDelete(mediaUrl)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fileName,
          text: `Guarda ${fileType === 'video' ? 'questo video' : 'questa immagine'}: ${fileName}`,
          url: mediaUrl
        })
      } catch (error) {
        console.log('Condivisione annullata')
      }
    } else {
      // Fallback: copia URL negli appunti
      navigator.clipboard.writeText(mediaUrl)
      alert('URL copiato negli appunti!')
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('it-IT')
  }

  return (
    <div className="image-detail-overlay" onClick={handleBackdropClick}>
      <div className="image-detail-container">
        {/* Header con controlli */}
        <div className="image-detail-header">
          <div className="file-info">
            <h3 className="image-title">{fileName}</h3>
            {fileInfo && (
              <div className="file-meta">
                <span className="file-size">{formatFileSize(fileInfo.size)}</span>
                <span className="file-date">Caricato: {formatDate(fileInfo.uploadDate)}</span>
              </div>
            )}
          </div>
          <div className="image-actions">
            <button 
              className="action-button" 
              onClick={handleShare}
              title="Condividi"
            >
              <Share size={20} />
            </button>
            <button 
              className="action-button" 
              onClick={handleDownload}
              title="Scarica"
            >
              <Download size={20} />
            </button>
            <button 
              className="action-button delete" 
              onClick={handleDelete}
              title="Elimina"
            >
              <Trash2 size={20} />
            </button>
            <button 
              className="close-button" 
              onClick={onClose}
              title="Chiudi"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenuto principale - Immagine o Video */}
        <div className="image-detail-content">
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Caricamento informazioni file...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
            </div>
          ) : fileType === 'video' ? (
            <AuthenticatedVideo 
              src={`http://localhost:4300/api/file/video/${fileName}`}
              alt={fileName}
              className="detail-media"
              controls
              autoPlay={false}
              muted={false}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img 
              src={mediaUrl} 
              alt={fileName}
              className="detail-media"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageDetail
