import React, { useState, useEffect } from 'react';
import Header from '../Header/Header';
import './Layout.css';

const Layout = ({ children, withFooter = true, withSidebar = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detectar scroll para cambiar estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquear scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="layout">
      <Header 
        isScrolled={isScrolled} 
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />
      
      <div className="layout-body">
        {withSidebar && (
          <aside className="layout-sidebar">
            {/* Sidebar content would go here */}
            <div className="sidebar-content">
              <h3>Filtros</h3>
              <div className="filter-section">
                <label>Rango de precios</label>
                <input type="range" />
              </div>
              <div className="filter-section">
                <label>Número de habitaciones</label>
                <select>
                  <option>Cualquiera</option>
                  <option>1+</option>
                  <option>2+</option>
                  <option>3+</option>
                </select>
              </div>
            </div>
          </aside>
        )}
        
        <main 
          className={`main-content ${withSidebar ? 'with-sidebar' : ''} ${isMobileMenuOpen ? 'menu-open' : ''}`}
          id="main-content"
          aria-label="Contenido principal"
        >
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
      
      {withFooter && (
        <footer className="layout-footer" role="contentinfo">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Acerca de nosotros</h4>
              <ul>
                <li><a href="/about">Cómo funciona</a></li>
                <li><a href="/careers">Carreras</a></li>
                <li><a href="/press">Prensa</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Comunidad</h4>
              <ul>
                <li><a href="/diversity">Diversidad e inclusión</a></li>
                <li><a href="/accessibility">Accesibilidad</a></li>
                <li><a href="/referrals">Referidos</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Anfitrión</h4>
              <ul>
                <li><a href="/host">Ofrece tu espacio</a></li>
                <li><a href="/insurance">Protección para anfitriones</a></li>
                <li><a href="/resources">Recursos</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Soporte</h4>
              <ul>
                <li><a href="/help">Centro de ayuda</a></li>
                <li><a href="/covid">COVID-19</a></li>
                <li><a href="/support">Atención al cliente</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p>© {new Date().getFullYear()} Empresa, Inc. Todos los derechos reservados</p>
              <div className="footer-links">
                <a href="/privacy">Privacidad</a>
                <a href="/terms">Términos</a>
                <a href="/sitemap">Mapa del sitio</a>
              </div>
              <div className="social-links">
                <a href="#" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.033 10.033 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
      
      {/* Overlay para menú móvil */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Layout;