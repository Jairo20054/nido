import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaTimes, FaFilter, FaStar, FaBolt,
  FaBroom, FaWrench, FaShieldAlt, FaPaintRoller,
  FaTruck, FaWarehouse, FaToolbox, FaTree, FaSwimmingPool,
  FaDog, FaUserNurse, FaBaby, FaCouch, FaHome,
  FaLock, FaShoppingCart, FaExclamationTriangle, FaSolarPanel,
  FaMoneyBillAlt, FaShieldVirus, FaCamera, FaClipboardList,
  FaChargingStation, FaVideo, FaWind, FaPlug,
  FaTint, FaWifi, FaHeart
} from 'react-icons/fa';
import './ServiciosPage.css';

const ServiciosPage = () => {
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [precioFiltro, setPrecioFiltro] = useState([0, 500]);
  const [ratingFiltro, setRatingFiltro] = useState(0);
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false);
  const [serviciosFavoritos, setServiciosFavoritos] = useState(new Set());

  const categorias = [
    { id: 'todos', nombre: 'Todos los servicios', icono: '🏠', color: '#6c5ce7' },
    { id: 'limpieza', nombre: 'Limpieza', icono: '🧹', color: '#00cec9' },
    { id: 'reparaciones', nombre: 'Reparaciones', icono: '🔧', color: '#ff7675' },
    { id: 'hogar', nombre: 'Hogar y Mejoras', icono: '🛋️', color: '#74b9ff' },
    { id: 'cuidados', nombre: 'Cuidados', icono: '👵', color: '#a29bfe' },
    { id: 'especializados', nombre: 'Especializados', icono: '⭐', color: '#fdcb6e' }
  ];

  const servicios = [
    // Limpieza
    { id: 1, nombre: 'Limpieza doméstica regular', imagen: '🧹', categoria: 'limpieza', precio: 50, rating: 4.5, descripcion: 'Servicio de limpieza regular para mantener tu hogar impecable. Incluye barrer, trapear, limpiar superficies y organizar espacios comunes.' },
    { id: 2, nombre: 'Limpieza profunda', imagen: '🧽', categoria: 'limpieza', precio: 120, rating: 4.8, descripcion: 'Limpieza exhaustiva de toda la casa, incluyendo áreas de difícil acceso. Perfecta para mudanzas o después de renovaciones.' },
    { id: 3, nombre: 'Limpieza post-obra', imagen: '🏗️', categoria: 'limpieza', precio: 200, rating: 4.7, descripcion: 'Eliminación de residuos de construcción y limpieza profunda después de obras. Dejamos tu espacio listo para habitar.' },
    { id: 4, nombre: 'Limpieza de alfombras y tapicería', imagen: '🧼', categoria: 'limpieza', precio: 80, rating: 4.6, descripcion: 'Limpieza profesional de alfombras, sofás y otros tejidos. Usamos técnicas especializadas para eliminar manchas y ácaros.' },
    { id: 5, nombre: 'Limpieza de cristales en altura', imagen: '🧽', categoria: 'limpieza', precio: 150, rating: 4.9, descripcion: 'Limpieza segura de ventanales y superficies de vidrio en altura. Personal capacitado y equipos de seguridad.' },
    
    // Electricidad
    { id: 6, nombre: 'Electricista - instalaciones', imagen: '⚡', categoria: 'reparaciones', precio: 70, rating: 4.7, descripcion: 'Instalación de sistemas eléctricos y puntos de luz. Cumplimos con todas las normas de seguridad.' },
    { id: 7, nombre: 'Electricista - reparaciones', imagen: '🔌', categoria: 'reparaciones', precio: 60, rating: 4.6, descripcion: 'Reparación de fallos eléctricos y averías. Soluciones rápidas y efectivas para problemas comunes.' },
    { id: 8, nombre: 'Electricista - emergencias', imagen: '⚠️', categoria: 'reparaciones', precio: 90, rating: 4.8, descripcion: 'Servicio urgente para resolver problemas eléctricos críticos. Disponibles 24/7 para garantizar tu seguridad.' },
    { id: 9, nombre: 'Instalación domótica / IoT', imagen: '🏠', categoria: 'reparaciones', precio: 150, rating: 4.5, descripcion: 'Instalación de sistemas de hogar inteligente y dispositivos conectados. Automatiza tu casa para mayor comodidad.' },
    
    // Fontanería
    { id: 10, nombre: 'Plomería - fugas y desagües', imagen: '🚰', categoria: 'reparaciones', precio: 65, rating: 4.4, descripcion: 'Reparación de fugas y obstrucciones en tuberías y desagües. Solucionamos problemas de agua rápidamente.' },
    { id: 11, nombre: 'Plomería - sanitarios', imagen: '🚽', categoria: 'reparaciones', precio: 55, rating: 4.3, descripcion: 'Reparación e instalación de inodoros, lavabos y grifería. Mejoramos el funcionamiento de tu baño.' },
    
    // Climatización
    { id: 12, nombre: 'HVAC - mantenimiento', imagen: '❄️', categoria: 'reparaciones', precio: 80, rating: 4.6, descripcion: 'Mantenimiento preventivo de sistemas de calefacción y aire acondicionado. Alarga la vida útil de tus equipos.' },
    { id: 13, nombre: 'HVAC - recargas', imagen: '🌡️', categoria: 'reparaciones', precio: 100, rating: 4.5, descripcion: 'Recarga de gas para sistemas de aire acondicionado. Optimiza el rendimiento de tu equipo.' },
    
    // Reparaciones
    { id: 14, nombre: 'Manitas / Reparaciones pequeñas', imagen: '🔧', categoria: 'reparaciones', precio: 45, rating: 4.7, descripcion: 'Soluciones para pequeñas reparaciones y montajes en el hogar. Desde colgar cuadros hasta arreglar muebles.' },
    { id: 15, nombre: 'Carpintería ligera', imagen: '🪚', categoria: 'reparaciones', precio: 75, rating: 4.4, descripcion: 'Trabajos de carpintería para muebles y estructuras ligeras. Reparamos y fabricamos según tus necesidades.' },
    { id: 16, nombre: 'Reparación de electrodomésticos', imagen: '🔌', categoria: 'reparaciones', precio: 60, rating: 4.3, descripcion: 'Reparación de electrodomésticos como neveras, lavadoras, etc. Diagnóstico preciso y repuestos originales.' },
    
    // Pintura
    { id: 17, nombre: 'Pintura interior', imagen: '🎨', categoria: 'hogar', precio: 200, rating: 4.7, descripcion: 'Servicio de pintura para interiores con materiales de calidad. Transformamos tus espacios con colores modernos.' },
    { id: 18, nombre: 'Pintura exterior', imagen: '🖌️', categoria: 'hogar', precio: 300, rating: 4.6, descripcion: 'Pintura de fachadas y exteriores con protección contra la intemperie. Mejora la apariencia y durabilidad de tu hogar.' },
    
    // Mudanzas y almacenamiento
    { id: 19, nombre: 'Mudanzas locales', imagen: '🚚', categoria: 'hogar', precio: 250, rating: 4.8, descripcion: 'Servicio completo de mudanza dentro de la localidad. Embalaje, transporte y desembalaje profesional.' },
    { id: 20, nombre: 'Embalaje', imagen: '📦', categoria: 'hogar', precio: 120, rating: 4.5, descripcion: 'Servicio profesional de embalaje para tus pertenencias. Materiales de calidad y técnicas seguras.' },
    { id: 21, nombre: 'Almacenamiento / mini-bodega', imagen: '📦', categoria: 'hogar', precio: 80, rating: 4.4, descripcion: 'Espacios de almacenamiento seguro con transporte incluido. Solución temporal o permanente para tus objetos.' },
    
    // Jardinería
    { id: 22, nombre: 'Jardinería y poda', imagen: '🌿', categoria: 'hogar', precio: 70, rating: 4.6, descripcion: 'Mantenimiento de jardines, poda de árboles y cuidado de plantas. Expertos en diseño y mantenimiento paisajístico.' },
    { id: 23, nombre: 'Instalación de riego', imagen: '💧', categoria: 'hogar', precio: 150, rating: 4.7, descripcion: 'Diseño e instalación de sistemas de riego automatizado. Ahorra agua y mantén tu jardín siempre verde.' },
    
    // Piscinas
    { id: 24, nombre: 'Mantenimiento de piscinas', imagen: '🏊', categoria: 'hogar', precio: 100, rating: 4.5, descripcion: 'Mantenimiento regular de piscinas para un agua cristalina. Control de pH, limpieza y reparaciones menores.' },
    
    // Control de plagas
    { id: 25, nombre: 'Control de plagas y fumigación', imagen: '🐜', categoria: 'hogar', precio: 120, rating: 4.8, descripcion: 'Eliminación de plagas con productos seguros y efectivos. Soluciones para insectos, roedores y más.' },
    
    // Mascotas
    { id: 26, nombre: 'Paseo de mascotas', imagen: '🐕', categoria: 'cuidados', precio: 20, rating: 4.9, descripcion: 'Paseos diarios para que tu mascota se ejercite. Personal confiable y amante de los animales.' },
    { id: 27, nombre: 'Guardería para mascotas', imagen: '🏠', categoria: 'cuidados', precio: 30, rating: 4.7, descripcion: 'Cuidado diurno para mascotas en un ambiente seguro. Espacios amplios y atención personalizada.' },
    { id: 28, nombre: 'Grooming a domicilio', imagen: '✂️', categoria: 'cuidados', precio: 40, rating: 4.8, descripcion: 'Servicio de peluquería canina en la comodidad de tu hogar. Baño, corte de pelo y cuidado de uñas.' },
    
    // Cuidados personales
    { id: 29, nombre: 'Cuidado de mayores', imagen: '👵', categoria: 'cuidados', precio: 25, rating: 4.9, descripcion: 'Acompañamiento y cuidado para personas mayores. Asistencia con medicación, alimentación y compañía.' },
    { id: 30, nombre: 'Cuidado de bebés / nanny', imagen: '👶', categoria: 'cuidados', precio: 20, rating: 4.8, descripcion: 'Cuidado profesional de bebés y niños por horas. Personal capacitado en primeros auxilios y desarrollo infantil.' },
    
    // Diseño y remodelación
    { id: 31, nombre: 'Diseño interior', imagen: '🛋️', categoria: 'hogar', precio: 150, rating: 4.6, descripcion: 'Asesoría en diseño interior para optimizar tus espacios. Creamos ambientes funcionales y estéticos.' },
    { id: 32, nombre: 'Remodelaciones pequeñas', imagen: '🏠', categoria: 'hogar', precio: 500, rating: 4.7, descripcion: 'Renovación de espacios como baños, cocinas o habitaciones. Transformamos tu hogar con ideas innovadoras.' },
    
    // Cerrajería
    { id: 33, nombre: 'Cerrajería - urgencias', imagen: '🔒', categoria: 'reparaciones', precio: 80, rating: 4.5, descripcion: 'Servicio de emergencia para apertura de puertas y cambio de cerraduras. Respuesta rápida las 24 horas.' },
    { id: 34, nombre: 'Cambios de cerradura', imagen: '🔑', categoria: 'reparaciones', precio: 60, rating: 4.6, descripcion: 'Instalación de nuevas cerraduras por seguridad. Sistemas de alta calidad para tu tranquilidad.' },
    
    // Recados
    { id: 35, nombre: 'Compras y recados personales', imagen: '🛒', categoria: 'cuidados', precio: 25, rating: 4.4, descripcion: 'Realización de compras y gestiones personales por ti. Ahorra tiempo y energía en tus quehaceres.' },
    
    // Emergencias
    { id: 36, nombre: 'Asistencia 24/7 para emergencias', imagen: '🚨', categoria: 'reparaciones', precio: 100, rating: 4.9, descripcion: 'Servicio de emergencia disponible las 24 horas. Solucionamos problemas críticos en tu hogar.' },
    
    // Energías renovables
    { id: 37, nombre: 'Auditoría energética', imagen: '📊', categoria: 'especializados', precio: 200, rating: 4.7, descripcion: 'Análisis del consumo energético y recomendaciones de ahorro. Reduce tu factura y tu huella ambiental.' },
    { id: 38, nombre: 'Instalación de paneles solares', imagen: '☀️', categoria: 'especializados', precio: 1500, rating: 4.8, descripcion: 'Instalación de sistemas de energía solar para tu hogar. Energía limpia y ahorro a largo plazo.' },
    
    // Financiamiento
    { id: 39, nombre: 'Micro-financiamiento para reformas', imagen: '💰', categoria: 'especializados', precio: 0, rating: 4.5, descripcion: 'Opciones de financiamiento para proyectos de mejora del hogar. Facilidades de pago adaptadas a tu presupuesto.' },
    
    // Seguros
    { id: 40, nombre: 'Seguros para el hogar', imagen: '🛡️', categoria: 'especializados', precio: 0, rating: 4.4, descripcion: 'Asesoría en seguros para proteger tu vivienda y pertenencias. Encuentra la cobertura perfecta para tus necesidades.' },
    
    // Fotografía inmobiliaria
    { id: 41, nombre: 'Fotografía inmobiliaria', imagen: '📸', categoria: 'especializados', precio: 150, rating: 4.8, descripcion: 'Fotografía profesional para mostrar tu propiedad en su mejor luz. Imágenes que destacan los espacios y atraen compradores.' },
    
    // Gestión de propiedades
    { id: 42, nombre: 'Gestión de propiedades', imagen: '📋', categoria: 'especializados', precio: 200, rating: 4.6, descripcion: 'Administración integral de propiedades para propietarios. Cobro de arriendos, mantenimiento y relación con inquilinos.' },
    
    // Vehículos eléctricos
    { id: 43, nombre: 'Instalación de cargadores para EV', imagen: '🔋', categoria: 'especializados', precio: 300, rating: 4.7, descripcion: 'Instalación de estaciones de carga para vehículos eléctricos. Preparación adecuada para tu coche eléctrico o híbrido.' },
    
    // Diagnósticos
    { id: 44, nombre: 'Diagnósticos remotos', imagen: '📱', categoria: 'especializados', precio: 35, rating: 4.3, descripcion: 'Evaluación remota de problemas mediante videollamada. Soluciones rápidas sin necesidad de desplazamiento.' }
  ];

  const serviciosFiltrados = servicios.filter(servicio => {
    const coincideCategoria = categoriaFiltro === 'todos' || servicio.categoria === categoriaFiltro;
    const coincideBusqueda = servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const coincidePrecio = servicio.precio >= precioFiltro[0] && servicio.precio <= precioFiltro[1];
    const coincideRating = servicio.rating >= ratingFiltro;
    
    return coincideCategoria && coincideBusqueda && coincidePrecio && coincideRating;
  });

  const categoriesToShow = categoriaFiltro === 'todos' 
    ? categorias.filter(c => c.id !== 'todos')
    : categorias.filter(c => c.id === categoriaFiltro);

  const seleccionarServicio = (servicio) => {
    setServicioSeleccionado(servicio);
  };

  const cerrarDetalle = () => {
    setServicioSeleccionado(null);
  };

  const toggleFavorito = (servicioId) => {
    const nuevosFavoritos = new Set(serviciosFavoritos);
    if (nuevosFavoritos.has(servicioId)) {
      nuevosFavoritos.delete(servicioId);
    } else {
      nuevosFavoritos.add(servicioId);
    }
    setServiciosFavoritos(nuevosFavoritos);
  };

  const toggleFiltrosAvanzados = () => {
    setShowFiltrosAvanzados(!showFiltrosAvanzados);
  };

  const resetFiltros = () => {
    setCategoriaFiltro('todos');
    setSearchTerm('');
    setPrecioFiltro([0, 500]);
    setRatingFiltro(0);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar key={index} className={index < Math.floor(rating) ? 'star-filled' : 'star-empty'} />
    ));
  };

  return (
    <div className="servicios-page">
      <div className="servicios-header">
        <h1>Servicios Nido</h1>
        <p>Encuentra el servicio perfecto para tu hogar entre más de 40 opciones</p>
      </div>

      <div className="filtros-section">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <FaTimes />
            </button>
          )}
        </div>

        <div className="filtros-principales">
          <div className="categorias-filtro">
            {categorias.map(categoria => (
              <button
                key={categoria.id}
                className={`filtro-btn ${categoriaFiltro === categoria.id ? 'active' : ''}`}
                onClick={() => setCategoriaFiltro(categoria.id)}
                style={{ '--category-color': categoria.color }}
              >
                <span className="filtro-icon">{categoria.icono}</span>
                {categoria.nombre}
              </button>
            ))}
          </div>

          <button className="toggle-filtros-btn" onClick={toggleFiltrosAvanzados}>
            <FaFilter /> {showFiltrosAvanzados ? 'Ocultar filtros' : 'Más filtros'}
          </button>
        </div>

        {showFiltrosAvanzados && (
          <div className="filtros-avanzados">
            <div className="filtro-grupo">
              <label>Rango de precios: ${precioFiltro[0]} - ${precioFiltro[1]}</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={precioFiltro[0]}
                  onChange={(e) => setPrecioFiltro([parseInt(e.target.value), precioFiltro[1]])}
                  className="slider"
                />
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={precioFiltro[1]}
                  onChange={(e) => setPrecioFiltro([precioFiltro[0], parseInt(e.target.value)])}
                  className="slider"
                />
              </div>
            </div>

            <div className="filtro-grupo">
              <label>Rating mínimo: {ratingFiltro > 0 ? `${ratingFiltro}+` : 'Cualquiera'}</label>
              <div className="rating-filtro">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= ratingFiltro ? 'selected' : ''}`}
                    onClick={() => setRatingFiltro(star === ratingFiltro ? 0 : star)}
                  >
                    <FaStar />
                  </span>
                ))}
              </div>
            </div>

            <button className="reset-filtros-btn" onClick={resetFiltros}>
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      <div className="servicios-info">
        <p>{serviciosFiltrados.length} servicios encontrados</p>
      </div>

      {categoriesToShow.map(cat => (
        <div key={cat.id} className="category-section">
          <h2>{cat.nombre}</h2>
          <div className="servicios-row">
            {serviciosFiltrados.filter(s => s.categoria === cat.id).map(servicio => (
              <div 
                key={servicio.id} 
                className="servicio-card"
                onClick={() => seleccionarServicio(servicio)}
              >
                <div className="card-image-container">
                  <div className="servicio-imagen">{servicio.imagen}</div>
                  <button 
                    className={`favorito-btn ${serviciosFavoritos.has(servicio.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorito(servicio.id);
                    }}
                  >
                    <FaHeart />
                  </button>
                </div>
                <h3>{servicio.nombre}</h3>
                <p className="servicio-descripcion">{servicio.descripcion.split('. ')[0]}</p>
                <div className="servicio-footer">
                  Desde ${servicio.precio} USD * {servicio.rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {serviciosFiltrados.length === 0 && (
        <div className="no-resultados">
          <p>No se encontraron servicios con los filtros seleccionados.</p>
          <button onClick={resetFiltros}>Restablecer filtros</button>
        </div>
      )}

      {servicioSeleccionado && (
        <div className="servicio-detalle-overlay" onClick={cerrarDetalle}>
          <div className="servicio-detalle" onClick={e => e.stopPropagation()}>
            <button className="cerrar-detalle" onClick={cerrarDetalle}>×</button>
            <div className="detalle-header">
              <div className="detalle-imagen">{servicioSeleccionado.imagen}</div>
              <div>
                <h2>{servicioSeleccionado.nombre}</h2>
                <div className="detalle-rating">
                  {renderStars(servicioSeleccionado.rating)}
                  <span className="rating-value">{servicioSeleccionado.rating}</span>
                </div>
              </div>
            </div>
            <div className="detalle-info">
              <div className="info-item">
                <span className="info-label">Categoría:</span>
                <span className="info-value">{categorias.find(cat => cat.id === servicioSeleccionado.categoria)?.nombre}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Precio estimado:</span>
                <span className="info-value">${servicioSeleccionado.precio}</span>
              </div>
            </div>
            <div className="detalle-descripcion">
              <h3>Descripción</h3>
              <p>{servicioSeleccionado.descripcion}</p>
            </div>
            <div className="detalle-acciones">
              <button className="btn-solicitar">Solicitar este servicio</button>
              <button className="btn-contactar">Contactar para más información</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiciosPage;