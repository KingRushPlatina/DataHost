import React, { useRef, useEffect, useState } from 'react'
import api from '../../services/api'

const AuthenticatedVideo = ({ src, className, muted = true, preload = "metadata", onLoadedMetadata, ...props }) => {
  const videoRef = useRef(null)
  const [videoSrc, setVideoSrc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!src) return

    const setupVideo = async () => {
      try {
        setLoading(true)
        
        // Ottieni il token dal localStorage o dal tuo auth context
        const token = localStorage.getItem('token')
        
        if (!token) {
          console.error('Nessun token trovato per l\'autenticazione video')
          return
        }

        // Crea un URL con il token come parametro di query
        const authenticatedUrl = `${src}?token=${encodeURIComponent(token)}`
        setVideoSrc(authenticatedUrl)
        
      } catch (error) {
        console.error('Errore nel setup del video autenticato:', error)
      } finally {
        setLoading(false)
      }
    }

    setupVideo()
  }, [src])

  const handleLoadedMetadata = (e) => {
    if (onLoadedMetadata) {
      onLoadedMetadata(e)
    }
  }

  if (loading) {
    return (
      <div className={className} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        color: '#999'
      }}>
        Caricamento video...
      </div>
    )
  }

  if (!videoSrc) {
    return (
      <div className={className} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        color: '#999'
      }}>
        Errore caricamento video
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      className={className}
      muted={muted}
      preload={preload}
      onLoadedMetadata={handleLoadedMetadata}
      {...props}
    />
  )
}

export default AuthenticatedVideo
