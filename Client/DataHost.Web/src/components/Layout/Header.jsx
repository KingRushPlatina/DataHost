import React, { useState } from 'react'
import { Search, Settings, HelpCircle, User, LogOut, Grid3X3 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Layout.css'

const Header = ({ onMenuClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button" onClick={onMenuClick}>
          <svg className="menu-icon" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        
        <div className="logo-section">
          <img 
            src="https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png" 
            alt="Drive" 
            className="drive-logo"
          />
          <span className="drive-text">Drive</span>
        </div>
      </div>
      
      <div className="header-center">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Cerca in Drive" 
            className="search-input"
          />
        </div>
      </div>
      
      <div className="header-right">
        <button className="icon-button">
          <HelpCircle size={20} />
        </button>
        <button className="icon-button">
          <Settings size={20} />
        </button>
        <button className="icon-button">
          <Grid3X3 size={20} />
        </button>
        <div className="user-menu-container">
          <button 
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <User size={20} />
          </button>
          
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-avatar">
                  <User size={32} />
                </div>
                <div className="user-details">
                  <p className="user-name">{user?.username || 'Utente'}</p>
                  <p className="user-email">{user?.email || ''}</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Esci</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header