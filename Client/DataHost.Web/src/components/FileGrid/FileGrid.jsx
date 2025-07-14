import React, { useState, useEffect } from 'react'
import { Image, MoreVertical, Download, Trash2, Star } from 'lucide-react'
import api from '../../services/api'
import './FileGrid.css'

const FileGrid = () => {
  const [files, setFiles] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    fetchFiles()
  }, [currentPage])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/file?page=${currentPage}`)
      setFiles(response.data.files)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Errore nel caricamento dei file:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileClick = (file) => {
    setSelectedFile(file)
  }

  const getFileName = (url) => {
    return url.split('/').pop()
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
        {files.map((file, index) => (
          <div
            key={index}
            className={`file-card ${selectedFile === file ? 'selected' : ''}`}
            onClick={() => handleFileClick(file)}
            onContextMenu={(e) => handleContextMenu(e, file)}
          >
            <div className="file-preview">
              <img src={file} alt={getFileName(file)} />
            </div>
            <div className="file-info">
              <Image size={16} className="file-icon" />
              <span className="file-name">{getFileName(file)}</span>
              <button className="more-button" onClick={(e) => e.stopPropagation()}>
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
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
    </div>
  )
}

export default FileGrid