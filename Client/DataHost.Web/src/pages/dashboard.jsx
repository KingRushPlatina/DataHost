import React, { useState } from 'react'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import FileGrid from '../components/FileGrid/FileGrid'
import FileUpload from '../components/FileUpload/FileUpload'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const { logout } = useAuth()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleUploadSuccess = () => {
    // Ricarica la lista dei file
    window.location.reload()
  }

  return (
    <div className="dashboard">
        <Header onMenuClick={toggleSidebar} onLogout={logout} />
      <Sidebar isOpen={sidebarOpen} onUploadClick={() => setShowUpload(true)} />
      
      <main className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <FileGrid />
      </main>

      {showUpload && (
        <FileUpload 
          onClose={() => setShowUpload(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  )
}

export default Dashboard