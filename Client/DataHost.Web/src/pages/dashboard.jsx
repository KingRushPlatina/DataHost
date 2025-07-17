import React, { useState } from 'react'
import { Box, useTheme, useMediaQuery } from '@mui/material'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import FileGrid from '../components/FileGrid/FileGrid'
import FileUpload from '../components/FileUpload/FileUpload'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const [showUpload, setShowUpload] = useState(false)
  const { logout } = useAuth()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const handleUploadSuccess = () => {
    // Ricarica la lista dei file
    window.location.reload()
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onMenuClick={toggleSidebar} onLogout={logout} />
      <Sidebar 
        isOpen={sidebarOpen} 
        onUploadClick={() => setShowUpload(true)} 
        onClose={handleSidebarClose}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: 8, // AppBar height
          ml: { 
            xs: 0, 
            md: sidebarOpen ? '256px' : 0 
          },
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <FileGrid />
      </Box>

      {showUpload && (
        <FileUpload 
          onClose={() => setShowUpload(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </Box>
  )
}

export default Dashboard