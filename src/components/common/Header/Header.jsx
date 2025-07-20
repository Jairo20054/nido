import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import SearchBar from './SearchBar';
import Navigation from './Navigation'; // Importar el componente Navigation
import UserMenu from './UserMenu';
import { 
  HomeIcon, 
  CalendarDaysIcon, 
  WrenchScrewdriverIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items adaptados para el nuevo componente Navigation
  const navigationItems = useMemo(() => [
    {
      id: 'short-stays',
      label: 'Estadías Cortas',
      shortLabel: 'Cortas',
      path: '/search?type=short',
      icon: HomeIcon,
      description: 'Hasta 30 días',
      color: 'blue'
    },
    {
      id: 'long-stays',
      label: 'Estadías Largas',
      shortLabel: 'Largas',
      path: '/search?type=long',
      icon: CalendarDaysIcon,
      description: 'Más de 30 días',
      color: 'green'
    },
    {
      id: 'services',
      label: 'Servicios',
      shortLabel: 'Servicios',
      path: '/services',
      icon: WrenchScrewdriverIcon,
      description: 'Limpieza, tours, más',
      color: 'purple'
    }
  ], []);

  // Optimized scroll handler con throttling
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 10;
    if (scrolled !== isScrolled) {
      setIsScrolled(scrolled);
    }
  }, [isScrolled]);

  // Throttled scroll handler
  const throttledScrollHandler = useMemo(() => {
    let timeoutId;
    return () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        handleScroll();
        timeoutId = null;
      }, 16); // ~60fps
    };
  }, [handleScroll]);

  // Handle scroll effect con throttling
  useEffect(() => {
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    return () => window.removeEventListener('scroll', throttledScrollHandler);
  }, [throttledScrollHandler]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchExpanded(false);
  }, [location.pathname]);

  // Escape key handler for mobile menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsSearchExpanded(false);
      }
    };

    if (isMobileMenuOpen || isSearchExpanded) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isSearchExpanded]);

  // Simulación de notificaciones (conectar con tu API)
  useEffect(() => {
    if (isAuthenticated) {
      // Simular carga de notificaciones
      const mockNotifications = [
        { id: 1, message: 'Nueva reserva confirmada', unread: true },
        { id: 2, message: 'Mensaje del anfitrión', unread: true }
      ];
      setNotifications(mockNotifications);
      setHasNewNotifications(mockNotifications.some(n => n.unread));
    }
  }, [isAuthenticated]);

  const handleAuthAction = useCallback(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsSearchExpanded(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleNotificationClick = useCallback(() => {
    // Manejar click en notificaciones
    navigate('/notifications');
    setHasNewNotifications(false);
  }, [navigate]);

  // Check if current path matches navigation item
  const isActiveNavItem = useCallback((itemPath) => {
    if (itemPath.includes('?')) {
      const [path, query] = itemPath.split('?');
      return location.pathname === path && location.search.includes(query.split('=')[1]);
    }
    return location.pathname === itemPath;
  }, [location.pathname, location.search]);

  return (
    <header 
      className={`header ${isScrolled ? 'header--scrolled' : ''}`}
      role="banner"
    >
      <div className="header__container">
        {/* Logo mejorado */}
        <Link 
          to="/" 
          className="header__logo"
          aria-label="Nido - Inicio"
        >
          <div className="header__logo-icon">
            <svg 
              viewBox="0 0 32 32" 
              className="header__logo-svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
              </defs>
              <path
                d="M16 2L3 9v14c0 5.55 3.84 11 13 11s13-5.45 13-11V9L16 2z"
                fill="url(#logoGradient)"
              />
              <path
                d="M16 8L8 12v8c0 3.31 2.69 6 8 6s8-2.69 8-6v-8L16 8z"
                fill="#FFFFFF"
                opacity="0.9"
              />
              <circle cx="16" cy="16" r="3" fill="url(#logoGradient)" />
            </svg>
          </div>
          <span className="header__logo-text">Nido</span>
        </Link>

        {/* Reemplazo de navegación desktop con componente Navigation */}
        <div className="header__nav-container hide-mobile">
          <Navigation 
            variant="horizontal"
            showIcons={true}
            items={navigationItems}
            activePathMatcher={(item) => isActiveNavItem(item.path)}
            className="header__navigation"
          />
        </div>

        {/* Search Bar mejorada */}
        <div className="header__search">
          <SearchBar 
            isExpanded={isSearchExpanded}
            onToggle={toggleSearch}
            onClose={() => setIsSearchExpanded(false)}
          />
        </div>

        {/* User Actions mejoradas */}
        <div className="header__actions">
          {/* Favorites - solo si está autenticado */}
          {isAuthenticated && (
            <Link 
              to="/favorites" 
              className="header__action-btn hide-mobile"
              aria-label="Mis favoritos"
              title="Mis favoritos"
            >
              <HeartIcon className="header__action-icon" />
            </Link>
          )}

          {/* Notifications - solo si está autenticado */}
          {isAuthenticated && (
            <button
              onClick={handleNotificationClick}
              className="header__action-btn header__notifications hide-mobile"
              aria-label={`Notificaciones${hasNewNotifications ? ' (nuevas)' : ''}`}
              title="Notificaciones"
            >
              <BellIcon className="header__action-icon" />
              {hasNewNotifications && (
                <span className="header__notification-badge" aria-hidden="true">
                  {notifications.filter(n => n.unread).length}
                </span>
              )}
            </button>
          )}

          {/* Become Host Link */}
          <Link 
            to="/become-host" 
            className="header__host-link hide-mobile"
            aria-label="Ofrece tu espacio como anfitrión"
          >
            <span>Ofrece tu espacio</span>
            <svg className="header__host-icon" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 0L10.5 5L16 5.5L11.5 9L13 16L8 13L3 16L4.5 9L0 5.5L5.5 5L8 0Z" />
            </svg>
          </Link>

          {/* User Menu */}
          <UserMenu 
            user={user}
            isAuthenticated={isAuthenticated}
            onAuthAction={handleAuthAction}
            notifications={notifications}
            hasNewNotifications={hasNewNotifications}
          />

          {/* Mobile Menu Toggle */}
          <button
            className="header__mobile-toggle hide-desktop"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="header__mobile-icon" aria-hidden="true" />
            ) : (
              <Bars3Icon className="header__mobile-icon" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu mejorado */}
      <div 
        id="mobile-menu"
        className={`header__mobile-menu ${isMobileMenuOpen ? 'header__mobile-menu--open' : ''}`}
        role="navigation"
        aria-label="Menú móvil"
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="header__mobile-nav">
          {/* Main navigation items */}
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveNavItem(item.path);
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`header__mobile-nav-item ${isActive ? 'header__mobile-nav-item--active' : ''}`}
                onClick={closeMobileMenu}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="header__mobile-nav-icon" aria-hidden="true" />
                <div>
                  <div className="header__mobile-nav-label">{item.label}</div>
                  <div className="header__mobile-nav-description">{item.description}</div>
                </div>
              </Link>
            );
          })}

          {/* Authenticated user options */}
          {isAuthenticated && (
            <>
              <div className="header__mobile-divider" />
              <Link
                to="/favorites"
                className="header__mobile-nav-item"
                onClick={closeMobileMenu}
              >
                <HeartIcon className="header__mobile-nav-icon" aria-hidden="true" />
                <div>
                  <div className="header__mobile-nav-label">Mis Favoritos</div>
                  <div className="header__mobile-nav-description">Lugares guardados</div>
                </div>
              </Link>

              <Link
                to="/notifications"
                className="header__mobile-nav-item"
                onClick={closeMobileMenu}
              >
                <BellIcon className="header__mobile-nav-icon" aria-hidden="true" />
                <div>
                  <div className="header__mobile-nav-label">
                    Notificaciones
                    {hasNewNotifications && (
                      <span className="header__mobile-badge">
                        {notifications.filter(n => n.unread).length}
                      </span>
                    )}
                  </div>
                  <div className="header__mobile-nav-description">
                    {hasNewNotifications ? 'Tienes notificaciones nuevas' : 'Sin notificaciones nuevas'}
                  </div>
                </div>
              </Link>
            </>
          )}

          {/* Host option */}
          <div className="header__mobile-divider" />
          <Link
            to="/become-host"
            className="header__mobile-nav-item header__mobile-nav-item--highlight"
            onClick={closeMobileMenu}
          >
            <svg className="header__mobile-nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.5 8.5L22 9L17 14L18.5 22L12 18.5L5.5 22L7 14L2 9L8.5 8.5L12 2Z" />
            </svg>
            <div>
              <div className="header__mobile-nav-label">Ofrece tu espacio</div>
              <div className="header__mobile-nav-description">Gana dinero extra siendo anfitrión</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Backdrop mejorado */}
      {isMobileMenuOpen && (
        <div 
          className="header__mobile-backdrop"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Header;