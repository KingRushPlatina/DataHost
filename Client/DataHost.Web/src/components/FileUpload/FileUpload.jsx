import React, { useState, useRef } from 'react'
import { Upload, X, FileImage, File } from 'lucide-react'
import api from '../../services/api'
import './FileUpload.css'

const FileUpload = ({ onClose, onUploadSuccess }) => {
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
      alert('Errore durante il caricamento dei file')
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <FileImage size={20} />
    }
    return <File size={20} />
  }

  return (
    <div className="upload-modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-header">
          <h2>Carica file</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div 
          className="upload-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={64} className="upload-icon" />
          <p className="upload-text">Trascina i file qui</p>
          <p className="upload-subtext">oppure</p>
          <button className="browse-button">Sfoglia dal computer</button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {files.length > 0 && (
          <div className="selected-files">
            <h3>File selezionati</h3>
            {files.map((file, index) => (
              <div key={index} className="file-item">
                {getFileIcon(file)}
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                {uploadProgress[index] !== undefined && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress[index]}%` }}
                    />
                  </div>
                )}
                {!uploading && (
                  <button 
                    className="remove-file" 
                    onClick={() => removeFile(index)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="upload-actions">
          <button className="cancel-button" onClick={onClose} disabled={uploading}>
            Annulla
          </button>
          <button 
            className="upload-button" 
            onClick={uploadFiles} 
            disabled={files.length === 0 || uploading}
          >
            {uploading ? 'Caricamento...' : 'Carica'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FileUpload