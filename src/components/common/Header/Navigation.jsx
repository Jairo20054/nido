import React, { useState, useEffect, useRef } from 'react';
import { 
  NavLink, 
  useLocation, 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import {
  FaHome, FaClock, FaServicestack, FaBars, FaTimes, 
  FaShoppingCart, FaTags, FaPercent, FaGift, FaCalendarAlt, 
  FaMapMarkerAlt, FaHeart, FaSearch, FaFilter, FaStar, 
  FaShoppingBag, FaTruck, FaBolt, FaBroom, FaWrench, 
  FaShieldAlt, FaPaintRoller, FaWifi
} from 'react-icons/fa';
import './Navigation.css';

const Navigation = ({ 
  className = '',
  variant = 'horizontal',
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
      id: 'offers',
      path: '/ofertas',
      label: 'Ofertas',
      shortLabel: 'Ofertas',
      icon: FaTags,
      description: 'Descuentos y promociones especiales'
    },
    {
      id: 'marketplace',
      path: '/marketplace',
      label: 'Marketplace',
      shortLabel: 'Market',
      icon: FaShoppingCart,
      description: 'Compra artículos para el hogar'
    },
    {
      id: 'services',
      path: '/servicios',
      label: 'Servicios Adicionales',
      shortLabel: 'Servicios',
      icon: FaServicestack,
      description: 'Servicios complementarios'
    }
  ];

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
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <nav 
        ref={navRef}
        className={`navigation ${variant} ${className} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Navegación principal"
      >
        {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />}
        
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

        {variant === 'horizontal' && (
          <div 
            className="active-indicator"
            style={activeIndicatorStyle}
            aria-hidden="true"
          />
        )}

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

const OfertasPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('todas');

  const ofertas = [
    {
      id: 1,
      titulo: 'Descuento Estancia Larga',
      descripcion: 'Obtén 20% de descuento en estadías de más de 30 días',
      descuento: 20,
      categoria: 'estancia',
      validoHasta: '2025-12-31',
      codigo: 'LARGA20',
      condiciones: 'Mínimo 30 días de estadía',
      imagen: '🏠'
    },
    {
      id: 2,
      titulo: 'Promo Fin de Semana',
      descripcion: 'Descuento especial para reservas de viernes a domingo',
      descuento: 15,
      categoria: 'temporal',
      validoHasta: '2025-09-30',
      codigo: 'FINDE15',
      condiciones: 'Solo fines de semana',
      imagen: '🎉'
    },
    {
      id: 3,
      titulo: 'Descuento Primera Reserva',
      descripcion: 'Descuento especial para nuevos clientes',
      descuento: 25,
      categoria: 'nuevo',
      validoHasta: '2025-10-31',
      codigo: 'NUEVO25',
      condiciones: 'Solo primera reserva',
      imagen: '🌟'
    },
    {
      id: 4,
      titulo: 'Oferta Estudiantes',
      descripcion: 'Descuento especial para estudiantes universitarios',
      descuento: 18,
      categoria: 'estudiante',
      validoHasta: '2025-11-30',
      codigo: 'ESTUD18',
      condiciones: 'Presentar credencial estudiantil',
      imagen: '🎓'
    },
    {
      id: 5,
      titulo: 'Pack Servicios',
      descripcion: 'Descuento al contratar alojamiento + servicios',
      descuento: 10,
      categoria: 'pack',
      validoHasta: '2025-12-15',
      codigo: 'PACK10',
      condiciones: 'Mínimo 2 servicios adicionales',
      imagen: '📦'
    },
    {
      id: 6,
      titulo: 'Referido Amigo',
      descripcion: 'Descuento por cada amigo que refiers',
      descuento: 30,
      categoria: 'referido',
      validoHasta: '2025-12-31',
      codigo: 'AMIGO30',
      condiciones: 'Por cada referido exitoso',
      imagen: '👥'
    }
  ];

  const categorias = [
    { id: 'todas', nombre: 'Todas las Ofertas', icono: FaTags },
    { id: 'estancia', nombre: 'Estadías Largas', icono: FaClock },
    { id: 'temporal', nombre: 'Promociones Temporales', icono: FaCalendarAlt },
    { id: 'nuevo', nombre: 'Nuevos Clientes', icono: FaGift },
    { id: 'estudiante', nombre: 'Estudiantes', icono: '🎓' },
    { id: 'pack', nombre: 'Packs Especiales', icono: '📦' },
    { id: 'referido', nombre: 'Programa Referidos', icono: '👥' }
  ];

  const ofertasFiltradas = selectedCategory === 'todas' 
    ? ofertas 
    : ofertas.filter(oferta => oferta.categoria === selectedCategory);

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    alert(`Código ${codigo} copiado al portapapeles!`);
  };

  return (
    <div className="ofertas-page">
      <div className="ofertas-header">
        <h1><FaTags className="header-icon" />Ofertas Especiales</h1>
        <p>Aprovecha nuestras mejores promociones y descuentos</p>
      </div>

      <div className="categorias-filter">
        {categorias.map(categoria => {
          const IconComponent = categoria.icono;
          return (
            <button
              key={categoria.id}
              className={`categoria-btn ${selectedCategory === categoria.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(categoria.id)}
            >
              {typeof categoria.icono === 'string' ? (
                <span className="emoji-icon">{categoria.icono}</span>
              ) : (
                <IconComponent className="btn-icon" />
              )}
              {categoria.nombre}
            </button>
          );
        })}
      </div>

      <div className="ofertas-grid">
        {ofertasFiltradas.map(oferta => (
          <div key={oferta.id} className="oferta-card">
            <div className="oferta-header">
              <div className="oferta-emoji">{oferta.imagen}</div>
              <div className="descuento-badge">
                <FaPercent />
                {oferta.descuento}%
              </div>
            </div>
            <div className="oferta-content">
              <h3>{oferta.titulo}</h3>
              <p className="oferta-descripcion">{oferta.descripcion}</p>
              <div className="oferta-codigo">
                <span className="codigo-label">Código:</span>
                <span className="codigo-valor">{oferta.codigo}</span>
                <button 
                  className="copiar-btn"
                  onClick={() => copiarCodigo(oferta.codigo)}
                >
                  Copiar
                </button>
              </div>
              <div className="oferta-condiciones">
                <small>{oferta.condiciones}</small>
              </div>
              <div className="oferta-validez">
                <FaClock className="clock-icon" />
                <span>Válido hasta: {new Date(oferta.validoHasta).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
            <button className="usar-oferta-btn">
              Usar Oferta
            </button>
          </div>
        ))}
      </div>

      <div className="ofertas-info">
        <h3>¿Cómo usar las ofertas?</h3>
        <div className="info-steps">
          <div className="step">
            <span className="step-number">1</span>
            <p>Copia el código de la oferta</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <p>Realiza tu reserva</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <p>Ingresa el código al finalizar</p>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <p>¡Disfruta tu descuento!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MarketplacePage = () => {
  const [carrito, setCarrito] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [favoritos, setFavoritos] = useState([]);

  const productos = [
    {
      id: 1,
      nombre: 'Juego de Sábanas Premium',
      precio: 89900,
      categoria: 'dormitorio',
      imagen: '🛏️',
      rating: 4.8,
      descripcion: 'Sábanas 100% algodón egipcio',
      stock: 15,
      vendedor: 'HomeComfort'
    },
    {
      id: 2,
      nombre: 'Toallas de Baño Set x6',
      precio: 65000,
      categoria: 'baño',
      imagen: '🛁',
      rating: 4.6,
      descripcion: 'Set de toallas absorbentes',
      stock: 8,
      vendedor: 'BathEssentials'
    },
    {
      id: 3,
      nombre: 'Cafetera Automática',
      precio: 450000,
      categoria: 'cocina',
      imagen: '☕',
      rating: 4.9,
      descripcion: 'Cafetera con temporizador',
      stock: 5,
      vendedor: 'KitchenPro'
    },
    {
      id: 4,
      nombre: 'Sofá Cama Plegable',
      precio: 890000,
      categoria: 'sala',
      imagen: '🛋️',
      rating: 4.7,
      descripcion: 'Sofá cama cómodo and funcional',
      stock: 3,
      vendedor: 'FurnitureMax'
    },
    {
      id: 5,
      nombre: 'Set Utensilios Cocina',
      precio: 125000,
      categoria: 'cocina',
      imagen: '🍴',
      rating: 4.5,
      descripcion: 'Utensilios de acero inoxidable',
      stock: 12,
      vendedor: 'ChefTools'
    },
    {
      id: 6,
      nombre: 'Lámpara de Mesa LED',
      precio: 75000,
      categoria: 'decoracion',
      imagen: '💡',
      rating: 4.4,
      descripcion: 'Lámpara LED regulable',
      stock: 20,
      vendedor: 'LightHouse'
    },
    {
      id: 7,
      nombre: 'Aspiradora Robot',
      precio: 1200000,
      categoria: 'limpieza',
      imagen: '🤖',
      rating: 4.8,
      descripcion: 'Robot aspiradora inteligente',
      stock: 4,
      vendedor: 'SmartHome'
    },
    {
      id: 8,
      nombre: 'Cortinas Blackout',
      precio: 95000,
      categoria: 'decoracion',
      imagen: '🏠',
      rating: 4.3,
      descripcion: 'Cortinas bloqueadoras de luz',
      stock: 18,
      vendedor: 'WindowStyle'
    }
  ];

  const categorias = [
    { id: 'todos', nombre: 'Todos los Productos' },
    { id: 'dormitorio', nombre: 'Dormitorio' },
    { id: 'baño', nombre: 'Baño' },
    { id: 'cocina', nombre: 'Cocina' },
    { id: 'sala', nombre: 'Sala' },
    { id: 'decoracion', nombre: 'Decoración' },
    { id: 'limpieza', nombre: 'Limpieza' }
  ];

  const productosFiltrados = productos.filter(producto => {
    const coincideCategoria = categoriaSeleccionada === 'todos' || producto.categoria === categoriaSeleccionada;
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const agregarAlCarrito = (producto) => {
    const productoExistente = carrito.find(item => item.id === producto.id);
    if (productoExistente) {
      setCarrito(carrito.map(item => 
        item.id === producto.id 
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const toggleFavorito = (productoId) => {
    if (favoritos.includes(productoId)) {
      setFavoritos(favoritos.filter(id => id !== productoId));
    } else {
      setFavoritos([...favoritos, productoId]);
    }
  };

  const totalCarrito = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  const cantidadCarrito = carrito.reduce((total, item) => total + item.cantidad, 0);

  return (
    <div className="marketplace-page">
      <div className="marketplace-header">
        <h1><FaShoppingCart className="header-icon" />Marketplace</h1>
        <p>Todo lo que necesitas para tu hogar</p>
        <div className="carrito-info">
          <FaShoppingBag className="carrito-icon" />
          <span>{cantidadCarrito} productos - ${totalCarrito.toLocaleString()}</span>
        </div>
      </div>

      <div className="marketplace-controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="categorias-filter">
          {categorias.map(categoria => (
            <button
              key={categoria.id}
              className={`categoria-btn ${categoriaSeleccionada === categoria.id ? 'active' : ''}`}
              onClick={() => setCategoriaSeleccionada(categoria.id)}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="productos-grid">
        {productosFiltrados.map(producto => (
          <div key={producto.id} className="producto-card">
            <div className="producto-header">
              <div className="producto-imagen">{producto.imagen}</div>
              <button 
                className={`favorito-btn ${favoritos.includes(producto.id) ? 'active' : ''}`}
                onClick={() => toggleFavorito(producto.id)}
              >
                <FaHeart />
              </button>
            </div>
            <div className="producto-content">
              <h3>{producto.nombre}</h3>
              <div className="producto-rating">
                <FaStar className="star-icon" />
                <span>{producto.rating}</span>
              </div>
              <p className="producto-descripcion">{producto.descripcion}</p>
              <div className="producto-vendedor">
                <small>Vendido por: {producto.vendedor}</small>
              </div>
              <div className="producto-stock">
                <small>{producto.stock} disponibles</small>
              </div>
              <div className="producto-precio">
                ${producto.precio.toLocaleString()}
              </div>
            </div>
            <button 
              className="agregar-carrito-btn"
              onClick={() => agregarAlCarrito(producto)}
            >
              <FaShoppingCart />
              Agregar al Carrito
            </button>
          </div>
        ))}
      </div>

      {carrito.length > 0 && (
        <div className="carrito-flotante">
          <h4>Carrito de Compras</h4>
          <div className="carrito-items">
            {carrito.map(item => (
              <div key={item.id} className="carrito-item">
                <span>{item.nombre}</span>
                <span>x{item.cantidad}</span>
                <span>${(item.precio * item.cantidad).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="carrito-total">
            <strong>Total: ${totalCarrito.toLocaleString()}</strong>
          </div>
          <button className="checkout-btn">
            Proceder al Pago
          </button>
        </div>
      )}
    </div>
  );
};

const ServiciosPage = () => {
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);

  const servicios = [
    {
      id: 1,
      nombre: 'Trasteos y Mudanzas',
      icono: FaTruck,
      descripcion: 'Servicio completo de mudanzas y transporte',
      precio: 150000,
      tipoPrecio: 'por servicio',
      disponibilidad: '24/7',
      caracteristicas: [
        'Embalaje profesional',
        'Transporte seguro',
        'Carga y descarga',
        'Seguro incluido'
      ],
      proveedores: ['MudanzasExpress', 'TransportePlus', 'MoveEasy']
    },
    {
      id: 2,
      nombre: 'Servicios Eléctricos',
      icono: FaBolt,
      descripcion: 'Instalaciones y reparaciones eléctricas',
      precio: 45000,
      tipoPrecio: 'por hora',
      disponibilidad: 'Lun-Dom 7am-7pm',
      caracteristicas: [
        'Electricistas certificados',
        'Materiales incluidos',
        'Garantía 6 meses',
        'Diagnóstico gratuito'
      ],
      proveedores: ['ElectriMax', 'PowerService', 'VoltPro']
    },
    {
      id: 3,
      nombre: 'Servicio Doméstico',
      icono: FaBroom,
      descripcion: 'Limpieza y mantenimiento del hogar',
      precio: 35000,
      tipoPrecio: 'por hora',
      disponibilidad: 'Lun-Sáb 8am-6pm',
      caracteristicas: [
        'Personal capacitado',
        'Productos de limpieza incluidos',
        'Servicio personalizado',
        'Referencias verificadas'
      ],
      proveedores: ['CleanHome', 'DomesticPro', 'HomeServ']
    },
    {
      id: 4,
      nombre: 'Plomería',
      icono: FaWrench,
      descripcion: 'Reparaciones e instalaciones de plomería',
      precio: 50000,
      tipoPrecio: 'por servicio',
      disponibilidad: 'Emergencias 24/7',
      caracteristicas: [
        'Plomeros profesionales',
        'Herramientas especializadas',
        'Garantía en reparaciones',
        'Servicio de emergencia'
      ],
      proveedores: ['PlomeroExpert', 'AquaFix', 'TuberíasMaster']
    },
    {
      id: 5,
      nombre: 'Seguridad',
      icono: FaShieldAlt,
      descripcion: 'Sistemas de seguridad y vigilancia',
      precio: 80000,
      tipoPrecio: 'por día',
      disponibilidad: '24/7',
      caracteristicas: [
        'Vigilancia personalizada',
        'Sistemas de alarma',
        'Monitoreo remoto',
        'Personal entrenado'
      ],
      proveedores: ['SecureHome', 'GuardianPlus', 'SafetyFirst']
    },
    {
      id: 6,
      nombre: 'Pintura',
      icono: FaPaintRoller,
      descripcion: 'Servicios de pintura interior y exterior',
      precio: 25000,
      tipoPrecio: 'por metro²',
      disponibilidad: 'Lun-Sáb 8am-5pm',
      caracteristicas: [
        'Pintores profesionales',
        'Pintura de calidad',
        'Preparación de superficies',
        'Limpieza incluida'
      ],
      proveedores: ['ColorPro', 'PaintMaster', 'BrochaExperta'
      ]
    },
    {
      id: 7,
      nombre: 'Internet y Tecnología',
      icono: FaWifi,
      descripcion: 'Instalación y soporte técnico',
      precio: 60000,
      tipoPrecio: 'por servicio',
      disponibilidad: 'Lun-Vie 9am-6pm',
      caracteristicas: [
        'Técnicos especializados',
        'Instalación profesional',
        'Soporte técnico',
        'Configuración completa'
      ],
      proveedores: ['TechSupport', 'ConnectPlus', 'NetService']
    }
  ];

  const solicitarServicio = (servicio) => {
    const nuevaSolicitud = {
      id: Date.now(),
      servicio: servicio.nombre,
      precio: servicio.precio,
      tipoPrecio: servicio.tipoPrecio,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente'
    };
    setSolicitudes([...solicitudes, nuevaSolicitud]);
    alert(`Solicitud de ${servicio.nombre} enviada correctamente!`);
  };

  return (
    <div className="servicios-page">
      <div className="servicios-header">
        <h1><FaServicestack className="header-icon" />Servicios Adicionales</h1>
        <p>Servicios profesionales para tu comodidad</p>
      </div>

      <div className="servicios-grid">
        {servicios.map(servicio => {
          const IconComponent = servicio.icono;
          return (
            <div key={servicio.id} className="servicio-card">
              <div className="servicio-header">
                <IconComponent className="servicio-icono" />
                <h3>{servicio.nombre}</h3>
              </div>
              <div className="servicio-content">
                <p className="servicio-descripcion">{servicio.descripcion}</p>
                <div className="servicio-precio">
                  <span className="precio">${servicio.precio.toLocaleString()}</span>
                  <small>{servicio.tipoPrecio}</small>
                </div>
                <div className="servicio-disponibilidad">
                  <strong>Disponibilidad:</strong> {servicio.disponibilidad}
                </div>
                <div className="servicio-caracteristicas">
                  <h4>Incluye:</h4>
                  <ul>
                    {servicio.caracteristicas.map((caracteristica, index) => (
                      <li key={index}>{caracteristica}</li>
                    ))}
                  </ul>
                </div>
                <div className="servicio-proveedores">
                  <h4>Proveedores:</h4>
                  <div className="proveedores-list">
                    {servicio.proveedores.map((proveedor, index) => (
                      <span key={index} className="proveedor-tag">{proveedor}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                className="solicitar-btn"
                onClick={() => solicitarServicio(servicio)}
              >
                Solicitar Servicio
              </button>
            </div>
          );
        })}
      </div>

      {solicitudes.length > 0 && (
        <div className="solicitudes-section">
          <h3>Mis Solicitudes</h3>
          <div className="solicitudes-list">
            {solicitudes.map(solicitud => (
              <div key={solicitud.id} className="solicitud-item">
                <div className="solicitud-info">
                  <h4>{solicitud.servicio}</h4>
                  <p>Fecha: {solicitud.fecha}</p>
                  <p>Precio: ${solicitud.precio.toLocaleString()} {solicitud.tipoPrecio}</p>
                </div>
                <div className="solicitud-estado">
                  <span className={`estado-badge ${solicitud.estado.toLowerCase()}`}>
                    {solicitud.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1>Mi Plataforma</h1>
            <Navigation variant="horizontal" showIcons={true} />
          </div>
        </header>
        
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/ofertas" replace />} />
            <Route path="/ofertas" element={<OfertasPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/servicios" element={<ServiciosPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default Navigation;
export { OfertasPage, MarketplacePage, ServiciosPage, App };