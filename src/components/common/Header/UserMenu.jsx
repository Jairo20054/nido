import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaUserCircle, FaBell, FaEnvelope, FaUser, FaHome, FaCog, FaSignOutAlt } from 'react-icons/fa';
import './UserMenu.css';

const UserMenu = ({ 
  user = null,
  notificationCount = 0,
  messageCount = 0,
  onProfileClick = () => {},
  onReservationsClick = () => {},
  onPropertiesClick = () => {},
  onSettingsClick = () => {},
  onLogoutClick = () => {}
}) => {
  // Crear un usuario seguro con valores predeterminados
  const safeUser = user || {
    name: 'Usuario',
    email: 'usuario@example.com'
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
    setIsOpen(false);
    if (action) action();
  }, []);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        userButtonRef.current?.focus();
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
      icon: FaHome,
      onClick: onReservationsClick
    },
    {
      id: 'properties',
      label: 'Mis propiedades',
      icon: FaHome,
      onClick: onPropertiesClick
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: FaCog,
      onClick: onSettingsClick
    }
  ];

  return (
    <div className="user-menu" ref={dropdownRef}>
      <div className="icons">
        <button 
          className="icon-button" 
          aria-label={`Notificaciones (${notificationCount})`}
          title="Notificaciones"
        >
          <FaBell />
          {notificationCount > 0 && (
            <span className="badge" aria-label={`${notificationCount} notificaciones`}>
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        <button 
          className="icon-button" 
          aria-label={`Mensajes (${messageCount})`}
          title="Mensajes"
        >
          <FaEnvelope />
          {messageCount > 0 && (
            <span className="badge" aria-label={`${messageCount} mensajes`}>
              {messageCount > 99 ? '99+' : messageCount}
            </span>
          )}
        </button>

        <button 
          ref={userButtonRef}
          className="user-button" 
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label="Menú de usuario"
          title={`Menú de ${safeUser.name}`}
        >
          <FaUserCircle size={28} />
        </button>
      </div>

      {(isOpen || isAnimating) && (
        <div 
          className={`dropdown-menu ${isOpen && !isAnimating ? 'open' : 'closing'}`}
          role="menu"
          aria-label="Menú de usuario"
        >
          <div className="dropdown-header">
            <div className="user-info">
              <div className="user-name">{safeUser.name}</div>
              <div className="user-email">{safeUser.email}</div>
            </div>
          </div>

          <div className="dropdown-section">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  className="dropdown-item"
                  onClick={() => handleMenuItemClick(item.onClick)}
                  role="menuitem"
                  tabIndex={isOpen ? 0 : -1}
                >
                  <IconComponent className="dropdown-icon" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="divider" role="separator"></div>

          <div className="dropdown-section">
            <button
              className="dropdown-item logout"
              onClick={() => handleMenuItemClick(onLogoutClick)}
              role="menuitem"
              tabIndex={isOpen ? 0 : -1}
            >
              <FaSignOutAlt className="dropdown-icon" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;