import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiList, FiCalendar, FiDollarSign, FiBarChart2, FiMessageSquare, FiSettings, FiLogOut } from 'react-icons/fi';
import './HostRoute.css';

const HostRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [reservations, setReservations] = useState([]);
  
  // Simular carga de datos del host
  useEffect(() => {
    const fetchHostData = async () => {
      try {
        // Simular llamada a API
        setTimeout(() => {
          setUserData({
            id: 'host123',
            name: 'María Rodríguez',
            email: 'maria@example.com',
            verified: true,
            avatar: '/placeholder-avatar.jpg',
            propertiesCount: 4,
            rating: 4.8,
            earnings: 12500000,
          });
          
          // Datos de propiedades de ejemplo
          setProperties([
            {
              id: 'prop1',
              name: 'Apartamento Centro',
              type: 'Apartamento',
              status: 'Activo',
              occupancy: 85,
              price: 120000,
              rating: 4.7,
              image: '/property1.jpg'
            },
            {
              id: 'prop2',
              name: 'Casa Campestre',
              type: 'Casa',
              status: 'Activo',
              occupancy: 65,
              price: 250000,
              rating: 4.9,
              image: '/property2.jpg'
            },
            {
              id: 'prop3',
              name: 'Habitación Económica',
              type: 'Habitación',
              status: 'Inactivo',
              occupancy: 0,
              price: 35000,
              rating: 4.3,
              image: '/property3.jpg'
            }
          ]);
          
          // Datos de reservas de ejemplo
          setReservations([
            {
              id: 'res1',
              property: 'Apartamento Centro',
              guest: 'Carlos Pérez',
              dates: '15 Oct - 20 Oct 2023',
              status: 'Confirmada',
              amount: 600000,
              payment: 'Tarjeta'
            },
            {
              id: 'res2',
              property: 'Casa Campestre',
              guest: 'Laura Gómez',
              dates: '22 Oct - 27 Oct 2023',
              status: 'Pendiente',
              amount: 1250000,
              payment: 'Efectivo'
            },
            {
              id: 'res3',
              property: 'Apartamento Centro',
              guest: 'Andrés Ramírez',
              dates: '5 Nov - 10 Nov 2023',
              status: 'Completada',
              amount: 600000,
              payment: 'Transferencia'
            }
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching host data:', error);
        setLoading(false);
      }
    };
    
    fetchHostData();
  }, []);
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome />, path: '/host/dashboard' },
    { id: 'properties', label: 'Propiedades', icon: <FiList />, path: '/host/properties' },
    { id: 'calendar', label: 'Calendario', icon: <FiCalendar />, path: '/host/calendar' },
    { id: 'finances', label: 'Finanzas', icon: <FiDollarSign />, path: '/host/finances' },
    { id: 'stats', label: 'Estadísticas', icon: <FiBarChart2 />, path: '/host/stats' },
    { id: 'messages', label: 'Mensajes', icon: <FiMessageSquare />, path: '/host/messages' },
    { id: 'settings', label: 'Configuración', icon: <FiSettings />, path: '/host/settings' },
  ];
  
  const handleLogout = () => {
    // Lógica para cerrar sesión
    navigate('/');
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  if (loading) {
    return (
      <div className="host-loading">
        <div className="loading-spinner"></div>
        <p>Cargando tu panel de host...</p>
      </div>
    );
  }
  
  return (
    <div className={`host-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <motion.div 
        className="host-sidebar"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="sidebar-header">
          <div className="host-info">
            <div className="host-avatar">
              <img src={userData.avatar} alt={userData.name} />
              {userData.verified && <span className="verified-badge">✓</span>}
            </div>
            <div className="host-details">
              <h3>{userData.name}</h3>
              <p>Host Verificado</p>
            </div>
          </div>
          <button 
            className="sidebar-toggle" 
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Contraer menú" : "Expandir menú"}
          >
            {sidebarOpen ? '«' : '»'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {sidebarOpen && <span className="nav-label">{item.label}</span>}
                  {item.id === 'messages' && notifications > 0 && sidebarOpen && (
                    <span className="notification-badge">{notifications}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <FiLogOut />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </motion.div>
      
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-button" 
        onClick={toggleMobileMenu}
        aria-expanded={mobileMenuOpen}
        aria-label="Menú de host"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mobile-header">
              <div className="host-info">
                <div className="host-avatar">
                  <img src={userData.avatar} alt={userData.name} />
                  {userData.verified && <span className="verified-badge">✓</span>}
                </div>
                <div className="host-details">
                  <h3>{userData.name}</h3>
                  <p>Host Verificado</p>
                </div>
              </div>
              <button 
                className="close-menu" 
                onClick={toggleMobileMenu}
                aria-label="Cerrar menú"
              >
                &times;
              </button>
            </div>
            
            <nav className="mobile-nav">
              <ul>
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                      onClick={() => {
                        navigate(item.path);
                        toggleMobileMenu();
                      }}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      {item.id === 'messages' && notifications > 0 && (
                        <span className="notification-badge">{notifications}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="mobile-footer">
              <button className="logout-button" onClick={handleLogout}>
                <FiLogOut />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className="host-main">
        {/* Pasar datos al contenido de las rutas */}
        <Outlet context={{ userData, properties, reservations }} />
      </main>
    </div>
  );
};

export default HostRoute;