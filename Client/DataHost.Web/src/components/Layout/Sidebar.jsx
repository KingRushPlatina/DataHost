import React from 'react'
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Button, 
  Box, 
  Typography, 
  LinearProgress,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { Home, Clock, Star, Trash2, Cloud, Plus, Settings } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const Sidebar = ({ isOpen, onUploadClick, onClose }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  
  const sidebarWidth = 256

  const menuItems = [
    { icon: <Home size={20} />, text: 'Il mio Drive', path: '/' },
    { icon: <Clock size={20} />, text: 'Recenti', path: '/recent' },
    { icon: <Star size={20} />, text: 'Speciali', path: '/starred' },
    { icon: <Trash2 size={20} />, text: 'Cestino', path: '/trash' },
    { icon: <Settings size={20} />, text: 'Impostazioni', path: '/settings' },
  ]

  const drawerContent = (
    <Box sx={{ width: sidebarWidth, pt: 1 }}>
      {/* New Button */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={onUploadClick}
          sx={{
            width: '100%',
            height: 56,
            borderRadius: 4,
            textTransform: 'none',
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
            '&:hover': {
              boxShadow: '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
            }
          }}
        >
          Nuovo
        </Button>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 1 }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={index}
              button
              onClick={() => {
                if (item.path) {
                  navigate(item.path)
                  if (isMobile) onClose()
                }
              }}
              sx={{
                borderRadius: '0 20px 20px 0',
                mr: 2,
                mb: 0.5,
                backgroundColor: isActive ? '#e8f0fe' : 'transparent',
                color: isActive ? '#185abc' : '#202124',
                '&:hover': {
                  backgroundColor: isActive ? '#e8f0fe' : '#f1f3f4',
                }
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 44, 
                color: isActive ? '#185abc' : '#5f6368' 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: 14, 
                  fontWeight: 500 
                }} 
              />
            </ListItem>
          );
        })}
      </List>

      {/* Storage Info */}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, borderTop: 1, borderColor: '#e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Cloud size={20} style={{ color: '#5f6368' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontSize: 13, color: '#202124', mb: 1 }}>
              Spazio di archiviazione
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={20} 
              sx={{ 
                height: 4, 
                borderRadius: 2, 
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4285f4'
                }
              }} 
            />
            <Typography variant="caption" sx={{ fontSize: 11, color: '#5f6368', mt: 0.5, display: 'block' }}>
              3 GB di 15 GB utilizzati
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={isOpen}
      onClose={onClose}
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          top: 64,
          height: 'calc(100vh - 64px)',
          borderRight: '1px solid #e0e0e0',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}

export default Sidebar  