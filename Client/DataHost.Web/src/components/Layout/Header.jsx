
import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Box, InputBase, Menu, MenuItem, Avatar, Typography, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import { Search, Settings, HelpCircle, User, LogOut, Grid3X3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


const Header = ({ onMenuClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  return (
    <AppBar position="fixed" color="default" elevation={1} sx={{ zIndex: 100 }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', minHeight: 64, px: { xs: 1, sm: 2 } }}>
        {/* Left: Menu + Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: { xs: '0 0 auto', md: '0 0 238px' } }}>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={onMenuClick} sx={{ mr: 1 }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="#5f6368"/></svg>
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <img src="https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png" alt="Drive" style={{ width: 40, height: 40 }} />
            <Typography variant="h6" sx={{ color: '#5f6368', ml: 1, fontWeight: 400, fontSize: 22 }}>Drive</Typography>
          </Box>
        </Box>

        {/* Center: Search */}
        <Box sx={{ flex: 1, maxWidth: 720, mx: { xs: 1, sm: 4 }, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f3f4', borderRadius: 2, px: 2, height: 48, width: '100%' }}>
            <Search size={20} style={{ color: '#5f6368', marginRight: 12 }} />
            <InputBase
              placeholder="Cerca in Drive"
              sx={{ flex: 1, fontSize: 16, color: '#202124' }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </Box>
        </Box>

        {/* Right: Icons + User */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          {!isMobile && (
            <IconButton color="inherit">
              <HelpCircle size={20} />
            </IconButton>
          )}
          <IconButton color="inherit">
            <Settings size={20} />
          </IconButton>
          {!isMobile && (
            <IconButton color="inherit">
              <Grid3X3 size={20} />
            </IconButton>
          )}
          <Box>
            <Tooltip title={user?.username || 'Utente'}>
              <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 1 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: '#4285f4', color: 'white' }}>
                  <User size={20} />
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: { mt: 1.5, minWidth: 260, borderRadius: 2 }
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, pb: 1 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: '#4285f4', color: 'white', mr: 2 }}>
                  <User size={24} />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 500, fontSize: 16, color: '#202124' }}>{user?.username || 'Utente'}</Typography>
                  <Typography noWrap sx={{ fontSize: 14, color: '#5f6368', mt: 0.5 }}>{user?.email || ''}</Typography>
                </Box>
              </Box>
              <MenuItem onClick={handleLogout} sx={{ mt: 1, gap: 1 }}>
                <LogOut size={16} style={{ color: '#5f6368' }} />
                <span>Esci</span>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header