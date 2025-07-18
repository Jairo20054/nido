import React, { useState } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-top">
        <Link to="/" className="logo">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">NidoAccesible</span>
        </Link>

        <div className="header-nav">
          <nav className="main-nav">
            <Link to="/short-stays">Cortos</Link>
            <Link to="/long-stays">Largos</Link>
            <Link to="/services">Servicios</Link>
          </nav>

          <div className="header-actions">
            <button 
              className="search-toggle" 
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              aria-expanded={isSearchExpanded}
              aria-label="Buscar propiedades"
            >
              🔍
            </button>
            
            <div className="user-menu">
              <button 
                className="user-toggle"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-expanded={isUserMenuOpen}
                aria-label="Menú de usuario"
              >
                👤
              </button>
              
              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/login">Iniciar sesión</Link>
                  <Link to="/signup">Registrarse</Link>
                  <Link to="/host">Publicar propiedad</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSearchExpanded && (
        <div className="search-expanded">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="¿Dónde quieres hospedarte?" 
              className="search-input"
            />
            <button className="search-button">Buscar</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;