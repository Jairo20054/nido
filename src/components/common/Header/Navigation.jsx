import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaClock, FaServicestack, FaBars, FaTimes } from 'react-icons/fa';
import './Navigation.css';

const Navigation = ({ 
  className = '',
  variant = 'horizontal', // 'horizontal' | 'vertical' | 'mobile'
  showIcons = false,
  onItemClick
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({});
  const location = useLocation();
  const navRef = useRef(null);
  const activeItemRef = useRef(null);

  const navigationItems = [
    {
      id: 'short-stays',
      path: '/short-stays',
      label: 'Estadías Cortas',
      shortLabel: 'Cortos',
      icon: FaHome,
      description: 'Reservas de corta duración'
    },
    {
      id: 'long-stays',
      path: '/long-stays',
      label: 'Estadías Largas',
      shortLabel: 'Largos',
      icon: FaClock,
      description: 'Reservas de larga duración'
    },
    {
      id: 'services',
      path: '/services',
      label: 'Servicios Adicionales',
      shortLabel: 'Servicios',
      icon: FaServicestack,
      description: 'Servicios complementarios'
    }
  ];

  // Actualizar posición del indicador activo
  useEffect(() => {
    if (activeItemRef.current && variant === 'horizontal') {
      const activeElement = activeItemRef.current;
      const rect = activeElement.getBoundingClientRect();
      const navRect = navRef.current?.getBoundingClientRect();
      
      if (navRect) {
        setActiveIndicatorStyle({
          width: rect.width,
          left: rect.left - navRect.left,
          opacity: 1
        });
      }
    }
  }, [location.pathname, variant]);

  // Cerrar menú móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleItemClick = (item) => {
    setIsMobileMenuOpen(false);
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Botón menú móvil */}
      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Navegación principal */}
      <nav 
        ref={navRef}
        className={`navigation ${variant} ${className} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Navegación principal"
      >
        {/* Overlay para móvil */}
        {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />}
        
        {/* Lista de navegación */}
        <ul className="nav-list" role="menubar">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path || 
                           location.pathname.startsWith(item.path + '/');
            
            return (
              <li key={item.id} className="nav-item" role="none">
                <NavLink
                  ref={isActive ? activeItemRef : null}
                  to={item.path}
                  className={({ isActive: linkIsActive }) => 
                    `nav-link ${linkIsActive ? 'active' : ''}`
                  }
                  onClick={() => handleItemClick(item)}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                  title={item.description}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  {showIcons && (
                    <IconComponent className="nav-icon" aria-hidden="true" />
                  )}
                  <span className="nav-text">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-short-label">{item.shortLabel}</span>
                  </span>
                  {variant === 'horizontal' && (
                    <span className="nav-underline" aria-hidden="true" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Indicador activo para navegación horizontal */}
        {variant === 'horizontal' && (
          <div 
            className="active-indicator"
            style={activeIndicatorStyle}
            aria-hidden="true"
          />
        )}

        {/* Información adicional en menú móvil */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-footer">
            <div className="menu-info">
              <p>Encuentra el alojamiento perfecto para tu estadía</p>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;