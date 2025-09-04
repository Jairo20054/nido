import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Tag, Store, ConciergeBell, Menu, X } from 'lucide-react';
import './Navigation.css';

const Navigation = ({
  className = '',
  variant = 'horizontal',
  showIcons = true,
  onItemClick,
  items
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);

  const navigationItems = [
  {
    id: 'alojamientos',
    path: '/alojamientos',
    label: 'Alojamientos',
    shortLabel: 'Alojamientos',
    icon: ({ className, ...props }) => <span className={className} style={{ fontSize: "1.5rem" }} {...props}>🏡</span>,
    description: 'Encuentra alojamientos únicos'
  },
  {
    id: 'experiencias',
    path: '/experiencias',
    label: 'Experiencias',
    shortLabel: 'Experiencias',
    icon: ({ className, ...props }) => <span className={className} style={{ fontSize: "1.5rem" }} {...props}>🎈</span>,
    description: 'Vive experiencias únicas'
  },
  {
    id: 'servicios',
    path: '/servicios',
    label: 'Servicios',
    shortLabel: 'Servicios',
    icon: ({ className, ...props }) => <span className={className} style={{ fontSize: "1.5rem" }} {...props}>🛎️</span>,
    description: 'Servicios adicionales'
  }
];

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
      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <nav 
        ref={navRef}
        className={`navigation ${variant} ${className} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Navegación principal"
      >
        {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />}
        
        <ul className="nav-list" role="menubar">
          {(items || navigationItems).map((item, index) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path || 
                           location.pathname.startsWith(item.path + '/');
            
            return (
              <li key={item.id} className="nav-item" role="none">
                <NavLink
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
                    <div className="nav-icon-container">
                      <IconComponent className="nav-icon" size={22} aria-hidden="true" />
                    </div>
                  )}
                  <span className="nav-text">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-short-label">{item.shortLabel}</span>
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>

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