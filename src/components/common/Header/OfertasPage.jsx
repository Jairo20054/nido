import React, { useState, useMemo, useEffect } from 'react';
import { 
  FaTags, 
  FaClock, 
  FaCalendarAlt, 
  FaGift, 
  FaPercent, 
  FaSearch, 
  FaCopy, 
  FaArrowRight,
  FaHotel,
  FaShoppingCart,
  FaTimes,
  FaHeart,
  FaRegHeart,
  FaFilter,
  FaStar,
  FaMapMarkerAlt,
  FaUsers,
  FaBed,
  FaShower,
  FaWifi,
  FaParking,
  FaUtensils,
  FaSwimmingPool,
  FaChevronDown,
  FaChevronUp,
  FaDollarSign
} from 'react-icons/fa';
import './OfertasPage.css';

// Datos iniciales de las ofertas, incluyendo productos para el hogar y alojamientos
const initialOfertas = [
  {
    id: 'o-1',
    title: 'Descuento en Toallas Premium',
    description: '20% off en set de toallas de baño 100% algodón.',
    details: 'Este set incluye 4 toallas grandes, 4 medianas y 4 pequeñas. Fabricadas con algodón egipcio de alta calidad, absorbentes y suaves. Ideal para renovar tu baño. Términos: Válido solo para compras en línea, no acumulable con otras promociones. Envío gratis en pedidos superiores a $50.',
    codigo: 'TOALLAS20',
    descuento: 20,
    categoria: 'baño',
    fechaInicio: '2025-08-01',
    fechaFin: '2025-08-31',
    imagen: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    destacada: true,
    rating: 4.5,
    reseñas: 128
  },
  {
    id: 'o-2',
    title: 'Oferta en Utensilios de Cocina',
    description: '30% de descuento en set completo de acero inoxidable.',
    details: 'Set de 12 piezas incluyendo ollas, sartenes y utensilios. Acero inoxidable 18/10 resistente a la corrosión. Compatible con todas las cocinas, incluyendo inducción. Términos: Limitado a 2 sets por cliente. Garantía de 5 años contra defectos de fabricación.',
    codigo: 'COCINA30',
    descuento: 30,
    categoria: 'cocina',
    fechaInicio: '2025-08-10',
    fechaFin: '2025-09-10',
    imagen: 'https://images.unsplash.com/photo-1583778176476-4a8b8dc563ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    destacada: false,
    rating: 4.2,
    reseñas: 87
  },
  {
    id: 'o-3',
    title: 'Rebaja en Sofá Moderno',
    description: '15% off en sofá de 3 plazas con tapizado resistente.',
    details: 'Sofá con estructura de madera sólida y tapizado en tela impermeable. Dimensiones: 200x90x80 cm. Disponible en gris, azul y beige. Términos: Entrega en 7-10 días hábiles. No incluye montaje. Devoluciones gratuitas en 30 días.',
    codigo: 'SOFA15',
    descuento: 15,
    categoria: 'sala',
    fechaInicio: '2025-08-15',
    fechaFin: '2025-09-15',
    imagen: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    destacada: true,
    rating: 4.7,
    reseñas: 204
  },
  {
    id: 'o-4',
    title: 'Promoción en Sábanas de Algodón',
    description: '25% de descuento en juego de sábanas de 600 hilos.',
    details: 'Juego incluye sábana bajera, encimera y 2 fundas de almohada. Tamaño queen o king. Hipoalergénicas y transpirables. Términos: Válido mientras duren existencias. Lavar a máquina en agua fría.',
    codigo: 'SABANAS25',
    descuento: 25,
    categoria: 'dormitorio',
    fechaInicio: '2025-08-05',
    fechaFin: '2025-08-25',
    imagen: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    destacada: false,
    rating: 4.3,
    reseñas: 156
  },
  {
    id: 'o-5',
    title: 'Oferta en Lámpara de Pie',
    description: '10% off en lámpara con diseño escandinavo.',
    details: 'Lámpara de 150 cm de altura con base de metal y pantalla de tela. Incluye bombilla LED. Ajustable en altura. Términos: Solo para modelos seleccionados. Consumo energético bajo.',
    codigo: 'LAMPARA10',
    descuento: 10,
    categoria: 'iluminación',
    fechaInicio: '2025-08-20',
    fechaFin: '2025-09-20',
    imagen: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    destacada: false,
    rating: 4.0,
    reseñas: 92
  },
  {
    id: 'o-6',
    title: 'Descuento en Hotel en Bogotá',
    description: '15% off en estadía de 3 noches en hotel céntrico.',
    details: 'Hotel 4 estrellas con piscina y desayuno incluido. Habitaciones dobles o suites. Ubicado en el centro histórico. Términos: Reserva con 48 horas de antelación. Cancelación gratuita hasta 24 horas antes.',
    codigo: 'BOGOTA15',
    descuento: 15,
    categoria: 'alojamiento',
    fechaInicio: '2025-08-01',
    fechaFin: '2025-09-01',
    imagen: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=600&q=80',
    destacada: true,
    rating: 4.8,
    reseñas: 312,
    servicios: ['piscina', 'wifi', 'desayuno', 'estacionamiento'],
    ubicacion: 'Bogotá, Colombia',
    capacidad: 2
  },
  {
    id: 'o-7',
    title: 'Oferta en Apartamento en Cartagena',
    description: '25% de descuento en alquiler vacacional frente al mar.',
    details: 'Apartamento de 2 habitaciones con vista al océano, cocina equipada y balcón. Capacidad para 4 personas. Términos: Mínimo 3 noches. Limpieza diaria opcional por costo extra.',
    codigo: 'CARTAGENA25',
    descuento: 25,
    categoria: 'alojamiento',
    fechaInicio: '2025-08-15',
    fechaFin: '2025-09-15',
    imagen: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
    destacada: true,
    rating: 4.9,
    reseñas: 278,
    servicios: ['wifi', 'cocina', 'vista al mar', 'lavadora'],
    ubicacion: 'Cartagena, Colombia',
    capacidad: 4
  },
  {
    id: 'o-8',
    title: 'Rebaja en Cabaña en los Andes',
    description: '20% off en cabaña ecológica para fin de semana.',
    details: 'Cabaña con chimenea, jacuzzi exterior y senderos privados. Energía solar y materiales sostenibles. Términos: Check-in viernes, check-out domingo. No se permiten mascotas.',
    codigo: 'ANDES20',
    descuento: 20,
    categoria: 'alojamiento',
    fechaInicio: '2025-08-10',
    fechaFin: '2025-08-30',
    imagen: 'https://images.unsplash.com/photo-1504280390367-7cc8f70c233c?auto=format&fit=crop&w=600&q=80',
    destacada: false,
    rating: 4.6,
    reseñas: 145,
    servicios: ['jacuzzi', 'chimenea', 'senderos', 'energía solar'],
    ubicacion: 'Andes, Colombia',
    capacidad: 2
  }
];

// Lista de categorías con iconos y colores asociados
const categorias = [
  { id: 'todas', label: 'Todas', icon: <FaTags />, color: '#6c5ce7' },
  { id: 'baño', label: 'Baño', icon: <FaGift />, color: '#00cec9' },
  { id: 'cocina', label: 'Cocina', icon: <FaPercent />, color: '#ff7675' },
  { id: 'sala', label: 'Sala', icon: <FaClock />, color: '#74b9ff' },
  { id: 'dormitorio', label: 'Dormitorio', icon: <FaCalendarAlt />, color: '#a29bfe' },
  { id: 'iluminación', label: 'Iluminación', icon: <FaArrowRight />, color: '#fdcb6e' },
  { id: 'alojamiento', label: 'Alojamiento', icon: <FaHotel />, color: '#e17055' },
];

// Componente principal de la página de ofertas
const OfertasPage = () => {
  // Estado para la categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState('todas');
  // Estado para el término de búsqueda
  const [busqueda, setBusqueda] = useState('');
  // Estado para mostrar ofertas expiradas
  const [showExpired, setShowExpired] = useState(false);
  // Estado para el criterio de ordenamiento
  const [sortBy, setSortBy] = useState('descuento_desc');
  // Estado para el descuento mínimo
  const [minDescuento, setMinDescuento] = useState(0);
  // Estado para el rating mínimo
  const [minRating, setMinRating] = useState(0);
  // Estado para el filtro de fecha de inicio
  const [fechaInicioFiltro, setFechaInicioFiltro] = useState('');
  // Estado para el filtro de fecha de fin
  const [fechaFinFiltro, setFechaFinFiltro] = useState('');
  // Estado para la lista de ofertas
  const [ofertas, setOfertas] = useState([]);
  // Estado para las ofertas favoritas
  const [favorites, setFavorites] = useState([]);
  // Estado para el carrito de ofertas
  const [carrito, setCarrito] = useState([]);
  // Estado para abrir/cerrar el carrito
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Estado para mostrar/ocultar el panel de filtros
  const [showFilters, setShowFilters] = useState(false);
  // Estado para la oferta seleccionada en el modal
  const [selectedOferta, setSelectedOferta] = useState(null);
  // Estado para indicar si se está cargando data
  const [loading, setLoading] = useState(true);

  // Efecto para cargar datos iniciales, favoritos y carrito desde localStorage
  useEffect(() => {
    const loadData = () => {
      setTimeout(() => {
        setOfertas(initialOfertas);
        setLoading(false);
      }, 1000);
    };
    loadData();

    const savedFavorites = localStorage.getItem('ofertasFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    const savedCarrito = localStorage.getItem('ofertasCarrito');
    if (savedCarrito) {
      setCarrito(JSON.parse(savedCarrito));
    }
  }, []);

  // Efecto para guardar favoritos en localStorage
  useEffect(() => {
    localStorage.setItem('ofertasFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Efecto para guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem('ofertasCarrito', JSON.stringify(carrito));
  }, [carrito]);

  // Función para verificar si una oferta está activa basada en la fecha de fin
  const isActive = (fechaFin) => new Date(fechaFin) >= new Date();

  // Memo para filtrar y ordenar las ofertas basadas en los estados de filtros
  const ofertasFiltradas = useMemo(() => {
    let filtered = ofertas.filter((oferta) => {
      const matchCat = selectedCategory === 'todas' || oferta.categoria === selectedCategory;
      const matchText = busqueda.trim().toLowerCase() === '' ||
        oferta.title.toLowerCase().includes(busqueda.toLowerCase()) ||
        oferta.description.toLowerCase().includes(busqueda.toLowerCase()) ||
        oferta.codigo.toLowerCase().includes(busqueda.toLowerCase());
      const matchExpired = showExpired || isActive(oferta.fechaFin);
      const matchDescuento = oferta.descuento >= minDescuento;
      const matchRating = oferta.rating >= minRating;
      const matchFechaInicio = !fechaInicioFiltro || new Date(oferta.fechaInicio) >= new Date(fechaInicioFiltro);
      const matchFechaFin = !fechaFinFiltro || new Date(oferta.fechaFin) <= new Date(fechaFinFiltro);
      return matchCat && matchText && matchExpired && matchDescuento && matchRating && matchFechaInicio && matchFechaFin;
    });

    if (sortBy === 'descuento_desc') {
      filtered.sort((a, b) => b.descuento - a.descuento);
    } else if (sortBy === 'fechaFin_asc') {
      filtered.sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin));
    } else if (sortBy === 'fechaFin_desc') {
      filtered.sort((a, b) => new Date(b.fechaFin) - new Date(a.fechaFin));
    } else if (sortBy === 'rating_desc') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'destacadas') {
      filtered.sort((a, b) => b.destacada - a.destacada);
    }

    return filtered;
  }, [ofertas, selectedCategory, busqueda, showExpired, sortBy, minDescuento, minRating, fechaInicioFiltro, fechaFinFiltro]);

  // Función para alternar una oferta como favorita
  const toggleFavorite = (id) => {
    setFavorites((prev) => 
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  // Función para añadir una oferta al carrito y mostrar notificación
  const addToCart = (oferta) => {
    if (!carrito.some((item) => item.id === oferta.id)) {
      setCarrito((prev) => [...prev, oferta]);
      showNotification(`¡Oferta "${oferta.title}" añadida al carrito!`);
    }
  };

  // Función para remover una oferta del carrito
  const removeFromCart = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  // Función para copiar el código de la oferta al portapapeles y mostrar notificación
  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo).then(() => {
      showNotification(`¡Código ${codigo} copiado al portapapeles!`);
    }).catch((err) => {
      console.error('Error al copiar:', err);
      alert('Error al copiar el código.');
    });
  };

  // Función para mostrar una notificación temporal
  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'oferta-notification';
    notification.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 2000);
  };

  // Función para alternar la visibilidad del carrito
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // Efecto para cerrar el carrito al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isCartOpen && !e.target.closest('.ofertas-cart-drawer') && !e.target.closest('.ofertas-cart-btn')) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCartOpen]);

  // Función para abrir el modal de detalles de una oferta
  const openDetails = (e, oferta) => {
    if (!e.target.closest('button')) {
      setSelectedOferta(oferta);
    }
  };

  // Función para cerrar el modal de detalles
  const closeDetails = () => {
    setSelectedOferta(null);
  };

  // Efecto para cerrar el modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutsideModal = (e) => {
      if (selectedOferta && !e.target.closest('.ofertas-modal-content')) {
        closeDetails();
      }
    };
    document.addEventListener('mousedown', handleClickOutsideModal);
    return () => document.removeEventListener('mousedown', handleClickOutsideModal);
  }, [selectedOferta]);

  // Función para formatear una fecha en español
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Función para renderizar estrellas de rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar key={index} className={index < Math.floor(rating) ? 'star-filled' : 'star-empty'} />
    ));
  };

  // Función para resetear todos los filtros a valores predeterminados
  const resetFilters = () => {
    setShowExpired(false);
    setSortBy('descuento_desc');
    setMinDescuento(0);
    setMinRating(0);
    setFechaInicioFiltro('');
    setFechaFinFiltro('');
  };

  return (
    <div className="ofertas-page">
      {/* Header de la página con título, descripción y controles de búsqueda y filtros */}
      <header className="ofertas-header">
        <div className="ofertas-header-content">
          <h1>Ofertas Exclusivas</h1>
          <p>Promociones para hogar y viajes</p>
        </div>
        <div className="ofertas-controls">
          <div className="ofertas-search">
            <FaSearch className="ofertas-icon" />
            <input
              type="search"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar ofertas"
            />
          </div>
          <button className="ofertas-filter-btn" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter />
          </button>
          <button className="ofertas-cart-btn" onClick={toggleCart}>
            <FaShoppingCart />
            {carrito.length > 0 && <span className="ofertas-badge">{carrito.length}</span>}
          </button>
        </div>
      </header>

      {/* Panel de filtros mejorado con botones de aplicar y resetear */}
      {showFilters && (
        <div className="ofertas-filters-panel">
          <div className="filter-group checkbox-group">
            <input
              type="checkbox"
              id="active-only"
              checked={!showExpired}
              onChange={() => setShowExpired(!showExpired)}
            />
            <label htmlFor="active-only">Solo activas</label>
          </div>
          <div className="filter-group">
            <label>Ordenar por</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="descuento_desc">Mayor descuento</option>
              <option value="fechaFin_asc">Expiración pronto</option>
              <option value="fechaFin_desc">Expiración lejana</option>
              <option value="rating_desc">Mejor valoración</option>
              <option value="destacadas">Destacadas primero</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Descuento mín. (%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={minDescuento}
              onChange={(e) => setMinDescuento(Number(e.target.value))}
            />
            <span>{minDescuento}%</span>
          </div>
          <div className="filter-group">
            <label>Rating mín.</label>
            <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
              <option value={0}>Cualquiera</option>
              <option value={3}>3+</option>
              <option value={4}>4+</option>
              <option value={4.5}>4.5+</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Inicio desde</label>
            <input
              type="date"
              value={fechaInicioFiltro}
              onChange={(e) => setFechaInicioFiltro(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Fin hasta</label>
            <input
              type="date"
              value={fechaFinFiltro}
              onChange={(e) => setFechaFinFiltro(e.target.value)}
            />
          </div>
          {/* Acciones de filtros: aplicar y resetear */}
          <div className="filter-actions">
            <button className="apply-filters-btn" onClick={() => setShowFilters(false)}>Aplicar</button>
            <button className="reset-filters-btn" onClick={resetFilters}>Resetear</button>
          </div>
        </div>
      )}

      {/* Sección de categorías con scroll horizontal */}
      <div className="ofertas-categories-scroll">
        <div className="ofertas-categories">
          {categorias.map((c) => (
            <button
              key={c.id}
              className={`ofertas-cat-btn ${selectedCategory === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c.id)}
              aria-pressed={selectedCategory === c.id}
              style={{ '--category-color': c.color }}
            >
              {c.icon}
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido principal con título de sección y grid de ofertas */}
      <main className="ofertas-main-content">
        <h2 className="ofertas-section-title">
          {selectedCategory === 'todas' ? 'Todas' : categorias.find(c => c.id === selectedCategory)?.label}
          <span className="ofertas-count">({ofertasFiltradas.length})</span>
        </h2>

        {loading ? (
          <div className="ofertas-loading">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="ofertas-card-skeleton" />
            ))}
          </div>
        ) : ofertasFiltradas.length === 0 ? (
          <div className="ofertas-empty">
            <h3>No hay ofertas</h3>
            <p>Ajusta los filtros</p>
          </div>
        ) : (
          <div className="ofertas-grid" role="list">
            {ofertasFiltradas.map((oferta) => (
              <article 
                key={oferta.id} 
                className={`ofertas-card ${!isActive(oferta.fechaFin) ? 'expired' : ''} ${oferta.destacada ? 'featured' : ''}`} 
                role="listitem"
                onClick={(e) => openDetails(e, oferta)}
              >
                <div className="ofertas-image">
                  <img src={oferta.imagen} alt={oferta.title} loading="lazy" />
                  <div className="ofertas-discount-badge">
                    {oferta.descuento}%
                  </div>
                  <button 
                    className="ofertas-fav-btn"
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(oferta.id); }}
                    aria-label={favorites.includes(oferta.id) ? 'Quitar favorito' : 'Agregar favorito'}
                  >
                    {favorites.includes(oferta.id) ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>
                <div className="ofertas-body">
                  <h3 className="ofertas-title">{oferta.title}</h3>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Overlay para el carrito */}
      <div className={`ofertas-cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={toggleCart}></div>
      {/* Drawer del carrito */}
      <aside className={`ofertas-cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="ofertas-cart-header">
          <h4>Carrito</h4>
          <button className="ofertas-cart-close" onClick={toggleCart}>
            <FaTimes />
          </button>
        </div>
        <div className="ofertas-cart-content">
          {carrito.length === 0 ? (
            <div className="ofertas-empty-cart">
              <p>Vacío</p>
            </div>
          ) : (
            <ul className="ofertas-cart-list">
              {carrito.map((item) => (
                <li key={item.id} className="ofertas-cart-item">
                  <img src={item.imagen} alt={item.title} className="cart-item-image" />
                  <div className="cart-item-info">
                    <h5>{item.title}</h5>
                    <p>{item.codigo}</p>
                    <div className="cart-item-actions">
                      <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>
                        Eliminar
                      </button>
                      <button className="cart-copy-btn" onClick={() => copiarCodigo(item.codigo)}>
                        <FaCopy />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Modal para detalles de la oferta seleccionada */}
      {selectedOferta && (
        <div className="ofertas-modal-overlay" onClick={closeDetails}>
          <div className="ofertas-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ofertas-modal-close" onClick={closeDetails}>
              <FaTimes />
            </button>
            <img src={selectedOferta.imagen} alt={selectedOferta.title} className="ofertas-modal-image" />
            <h2>{selectedOferta.title}</h2>
            <div className="ofertas-modal-rating">
              {renderStars(selectedOferta.rating)}
              <span>({selectedOferta.reseñas})</span>
            </div>
            <p>{selectedOferta.description}</p>
            <p>{selectedOferta.details}</p>
            
            {selectedOferta.categoria === 'alojamiento' && (
              <div className="ofertas-modal-alojamiento">
                <span><FaMapMarkerAlt /> {selectedOferta.ubicacion}</span>
                <span><FaUsers /> {selectedOferta.capacidad} personas</span>
                <h4>Servicios:</h4>
                <div className="servicios-grid">
                  {selectedOferta.servicios.map((service, idx) => (
                    <span key={idx}>
                      {service === 'wifi' && <FaWifi />}
                      {service === 'piscina' && <FaSwimmingPool />}
                      {service === 'estacionamiento' && <FaParking />}
                      {service === 'desayuno' && <FaUtensils />}
                      {service === 'cocina' && <FaUtensils />}
                      {service === 'jacuzzi' && <FaShower />}
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="ofertas-modal-meta">
              <span><FaCalendarAlt /> Desde: {formatDate(selectedOferta.fechaInicio)}</span>
              <span><FaClock /> Hasta: {formatDate(selectedOferta.fechaFin)}</span>
              <span>Código: {selectedOferta.codigo}</span>
            </div>
            <div className="ofertas-modal-actions">
              <button onClick={() => copiarCodigo(selectedOferta.codigo)}>
                <FaCopy /> Copiar
              </button>
              <button onClick={() => addToCart(selectedOferta)}>
                Carrito <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfertasPage;