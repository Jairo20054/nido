import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHome, 
  FiCalendar, 
  FiDollarSign, 
  FiStar, 
  FiTrendingUp, 
  FiEye,
  FiPlus,
  FiMessageSquare,
  FiAlertCircle
} from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Datos de ejemplo (en una app real estos vendrían de una API)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simular carga de datos
        setTimeout(() => {
          setStats({
            totalProperties: 4,
            activeBookings: 3,
            occupancyRate: '78%',
            totalEarnings: 12500000,
            monthlyEarnings: 3200000,
            averageRating: 4.8
          });

          setProperties([
            {
              id: 1,
              name: 'Apartamento en El Poblado',
              location: 'Medellín, Antioquia',
              price: 120000,
              status: 'Activo',
              rating: 4.7,
              image: '/api/placeholder/300/200',
              bookings: 12
            },
            {
              id: 2,
              name: 'Casa en Envigado',
              location: 'Medellín, Antioquia',
              price: 180000,
              status: 'Activo',
              rating: 4.9,
              image: '/api/placeholder/300/200',
              bookings: 8
            },
            {
              id: 3,
              name: 'Loft en Laureles',
              location: 'Medellín, Antioquia',
              price: 90000,
              status: 'Inactivo',
              rating: 4.5,
              image: '/api/placeholder/300/200',
              bookings: 5
            }
          ]);

          setBookings([
            {
              id: 1,
              property: 'Apartamento en El Poblado',
              guest: 'Carlos Pérez',
              dates: '15 Oct - 20 Oct 2023',
              status: 'Confirmada',
              amount: 600000,
              image: '/api/placeholder/80/80'
            },
            {
              id: 2,
              property: 'Casa en Envigado',
              guest: 'María González',
              dates: '22 Oct - 27 Oct 2023',
              status: 'Pendiente',
              amount: 900000,
              image: '/api/placeholder/80/80'
            },
            {
              id: 3,
              property: 'Apartamento en El Poblado',
              guest: 'Andrés Ramírez',
              dates: '5 Nov - 10 Nov 2023',
              status: 'Completada',
              amount: 600000,
              image: '/api/placeholder/80/80'
            }
          ]);

          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando tu panel de control...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Panel de Control</h1>
        <p>Bienvenido de vuelta, aquí está el resumen de tus propiedades.</p>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiHome />
          </div>
          <div className="stat-content">
            <h3>{stats.totalProperties}</h3>
            <p>Propiedades</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <h3>{stats.activeBookings}</h3>
            <p>Reservas Activas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>{stats.occupancyRate}</h3>
            <p>Tasa de Ocupación</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <h3>${stats.totalEarnings?.toLocaleString('es-CO')}</h3>
            <p>Ganancias Totales</p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="dashboard-content">
        <div className="content-main">
          {/* Propiedades recientes */}
          <div className="card">
            <div className="card-header">
              <h2>Tus Propiedades</h2>
              <Link to="/host/properties/add" className="btn-primary">
                <FiPlus /> Añadir Propiedad
              </Link>
            </div>
            <div className="properties-list">
              {properties.map(property => (
                <div key={property.id} className="property-item">
                  <div className="property-image">
                    <img src={property.image} alt={property.name} />
                    <span className={`status-badge ${property.status.toLowerCase()}`}>
                      {property.status}
                    </span>
                  </div>
                  <div className="property-details">
                    <h3>{property.name}</h3>
                    <p>{property.location}</p>
                    <div className="property-meta">
                      <span className="price">${property.price.toLocaleString('es-CO')}/noche</span>
                      <span className="rating">
                        <FiStar /> {property.rating}
                      </span>
                      <span className="bookings">
                        {property.bookings} reservas
                      </span>
                    </div>
                  </div>
                  <div className="property-actions">
                    <button className="btn-icon">
                      <FiEye />
                    </button>
                    <Link to={`/host/properties/edit/${property.id}`} className="btn-secondary">
                      Editar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reservas recientes */}
          <div className="card">
            <div className="card-header">
              <h2>Reservas Recientes</h2>
              <Link to="/host/bookings" className="btn-text">
                Ver todas
              </Link>
            </div>
            <div className="bookings-list">
              {bookings.map(booking => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-image">
                    <img src={booking.image} alt={booking.property} />
                  </div>
                  <div className="booking-details">
                    <h3>{booking.property}</h3>
                    <p>Huésped: {booking.guest}</p>
                    <p className="dates">{booking.dates}</p>
                  </div>
                  <div className="booking-meta">
                    <span className={`status ${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                    <span className="amount">${booking.amount.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="content-sidebar">
          {/* Mensajes */}
          <div className="card">
            <div className="card-header">
              <h2>Mensajes Recientes</h2>
              <Link to="/host/messages" className="btn-text">
                Ver todos
              </Link>
            </div>
            <div className="messages-preview">
              <div className="message-item">
                <div className="message-avatar">
                  <img src="/api/placeholder/40/40" alt="Usuario" />
                </div>
                <div className="message-content">
                  <h4>Carlos Pérez</h4>
                  <p>Hola, tengo una pregunta sobre el check-in...</p>
                  <span className="time">Hace 2 horas</span>
                </div>
              </div>
              <div className="message-item">
                <div className="message-avatar">
                  <img src="/api/placeholder/40/40" alt="Usuario" />
                </div>
                <div className="message-content">
                  <h4>María González</h4>
                  <p>¿Está disponible para estas fechas?...</p>
                  <span className="time">Hace 5 horas</span>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <Link to="/host/messages" className="btn-secondary full-width">
                <FiMessageSquare /> Ver todos los mensajes
              </Link>
            </div>
          </div>

          {/* Alertas */}
          <div className="card alert-card">
            <div className="card-header">
              <h2>Alertas</h2>
              <FiAlertCircle />
            </div>
            <div className="alerts-list">
              <div className="alert-item">
                <div className="alert-icon">
                  <FiCalendar />
                </div>
                <div className="alert-content">
                  <p>Check-in mañana para <strong>Apartamento en El Poblado</strong></p>
                  <span className="time">Hace 30 minutos</span>
                </div>
              </div>
              <div className="alert-item">
                <div className="alert-icon">
                  <FiStar />
                </div>
                <div className="alert-content">
                  <p>Nueva reseña de <strong>Andrés Ramírez</strong></p>
                  <span className="time">Hace 2 horas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;