import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaUserCircle, FaBell, FaEnvelope, FaUser, FaHome, FaCog, FaSignOutAlt, FaChevronDown, FaHeart, FaKey, FaQuestionCircle } from 'react-icons/fa';
import './UserMenu.css';

const UserMenu = ({ 
  user = null,
  notificationCount = 0,
  messageCount = 0,
  onProfileClick = () => {},
  onReservationsClick = () => {},
  onPropertiesClick = () => {},
  onSettingsClick = () => {},
  onLogoutClick = () => {},
  onHelpClick = () => {}
}) => {
  const safeUser = user || {
    name: 'Usuario',
    email: 'usuario@example.com',
    avatar: null
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef(null);
  const userButtonRef = useRef(null);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
      }, 200);
    } else {
      setIsOpen(true);
    }
  }, [isOpen]);

  const handleMenuItemClick = useCallback((action) => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
      if (action) action();
    }, 150);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAnimating(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsAnimating(false);
        }, 150);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsAnimating(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsAnimating(false);
          userButtonRef.current?.focus();
        }, 150);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const menuItems = [
    {
      id: 'profile',
      label: 'Mi perfil',
      icon: FaUser,
      onClick: onProfileClick
    },
    {
      id: 'reservations',
      label: 'Mis reservas',
      icon: FaKey,
      onClick: onReservationsClick
    },
    {
      id: 'properties',
      label: 'Mis propiedades',
      icon: FaHome,
      onClick: onPropertiesClick
    },
    {
      id: 'wishlist',
      label: 'Favoritos',
      icon: FaHeart,
      onClick: () => {}
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: FaCog,
      onClick: onSettingsClick
    },
    
  ];

  return (
    <div className="user-menu-container" ref={dropdownRef}>
      <div className="user-menu-icons">
        <button 
          className="user-menu-icon-btn" 
          aria-label={`Notificaciones (${notificationCount})`}
          title="Notificaciones"
        >
          <FaBell size={18} />
          {notificationCount > 0 && (
            <span className="user-menu-badge" aria-label={`${notificationCount} notificaciones`}>
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        <button 
          className="user-menu-icon-btn" 
          aria-label={`Mensajes (${messageCount})`}
          title="Mensajes"
        >
          <FaEnvelope size={18} />
          {messageCount > 0 && (
            <span className="user-menu-badge" aria-label={`${messageCount} mensajes`}>
              {messageCount > 99 ? '99+' : messageCount}
            </span>
          )}
        </button>

        <button 
          ref={userButtonRef}
          className="user-menu-trigger" 
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label="Menú de usuario"
          title={`Menú de ${safeUser.name}`}
        >
          <div className="user-avatar">
            {safeUser.avatar ? (
              <img src={safeUser.avatar} alt={safeUser.name} />
            ) : (
              <FaUserCircle size={32} />
            )}
          </div>
          <span className="user-name-short">{safeUser.name.split(' ')[0]}</span>
          <FaChevronDown size={12} className={`dropdown-chevron ${isOpen ? 'open' : ''}`} />
        </button>
      </div>

      {(isOpen || isAnimating) && (
        <div 
          className={`user-menu-dropdown ${isOpen && !isAnimating ? 'open' : 'closing'}`}
          role="menu"
          aria-label="Menú de usuario"
        >
          <div className="user-menu-header">
            <div className="user-avatar-large">
              {safeUser.avatar ? (
                <img src={safeUser.avatar} alt={safeUser.name} />
              ) : (
                <FaUserCircle size={56} />
              )}
            </div>
            <div className="user-details">
              <h3 className="user-name-large">{safeUser.name}</h3>
              <p className="user-email-large">{safeUser.email}</p>
            </div>
          </div>

          <div className="user-menu-section">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  className="user-menu-item"
                  onClick={() => handleMenuItemClick(item.onClick)}
                  role="menuitem"
                  tabIndex={isOpen ? 0 : -1}
                >
                  <IconComponent className="user-menu-item-icon" size={16} />
                  <span className="user-menu-item-text">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="user-menu-divider"></div>

          <div className="user-menu-section">
            <button
              className="user-menu-item logout"
              onClick={() => handleMenuItemClick(onLogoutClick)}
              role="menuitem"
              tabIndex={isOpen ? 0 : -1}
            >
              <FaSignOutAlt className="user-menu-item-icon" size={16} />
              <span className="user-menu-item-text">Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;