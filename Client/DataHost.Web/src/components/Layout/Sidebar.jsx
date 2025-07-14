import React from 'react'
import { Home, Clock, Star, Trash2, Cloud, Plus } from 'lucide-react'
import './Layout.css'

const Sidebar = ({ isOpen, onUploadClick }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button className="new-button" onClick={onUploadClick}>
        <Plus size={24} />
        <span>Nuovo</span>
      </button>
      
      <nav className="nav-menu">
        <a href="#" className="nav-item active">
          <Home size={20} />
          <span>Il mio Drive</span>
        </a>
        <a href="#" className="nav-item">
          <Clock size={20} />
          <span>Recenti</span>
        </a>
        <a href="#" className="nav-item">
          <Star size={20} />
          <span>Speciali</span>
        </a>
        <a href="#" className="nav-item">
          <Trash2 size={20} />
          <span>Cestino</span>
        </a>
      </nav>
      
      <div className="storage-info">
        <Cloud size={20} />
        <div className="storage-details">
          <span>Spazio di archiviazione</span>
          <div className="storage-bar">
            <div className="storage-used" style={{width: '30%'}}></div>
          </div>
          <small>3 GB di 15 GB utilizzati</small>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar  