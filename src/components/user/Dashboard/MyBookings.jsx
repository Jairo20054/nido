import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Eye,
  Download,
  MessageSquare,
  Filter,
  Search,
  ChevronDown,
  Star,
  Users
} from 'lucide-react';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);

  // Datos simulados más completos
  const mockBookings = [
    {
      id: 1,
      property: 'Habitación Cómoda Centro',
      location: 'Centro Histórico, Cartagena',
      image: 'https://www.portobellostreet.es/mercurio_imagenes/Ideas-para-elegilr-la-mejor-comoda-para-tu-dormitorio-07.gif',
      dates: '15-20 Jun 2025',
      checkIn: '2025-06-15',
      checkOut: '2025-06-20',
      nights: 5,
      guests: 2,
      price: '$140.000',
      totalPrice: '$700.000',
      status: 'confirmada',
      host: 'María González',
      rating: 4.8,
      reviews: 127,
      bookingCode: 'BK001',
      amenities: ['WiFi', 'AC', 'Parking']
    },
    {
      id: 2,
      property: 'Apartamento con Vista al Mar',
      location: 'Bocagrande, Cartagena',
      image: 'https://www.reservastodo.com//wp-content/uploads/2021/04/Apartamentos-vista-al-mar-Rodadero.jpg',
      dates: '25-30 Jun 2025',
      checkIn: '2025-06-25',
      checkOut: '2025-06-30',
      nights: 5,
      guests: 4,
      price: '$300.000',
      totalPrice: '$1.500.000',
      status: 'pendiente',
      host: 'Carlos Martínez',
      rating: 4.9,
      reviews: 89,
      bookingCode: 'BK002',
      amenities: ['WiFi', 'Pool', 'Ocean View', 'Kitchen']
    },
    {
      id: 3,
      property: 'Casa Colonial Histórica',
      location: 'San Diego, Cartagena',
      image: 'https://img.freepik.com/fotos-premium/calle-antiguas-casas-coloniales-portuguesas-centro-historico-paraty-estado-rio-janeiro_70251-467.jpg',
      dates: '05-08 Jul 2025',
      checkIn: '2025-07-05',
      checkOut: '2025-07-08',
      nights: 3,
      guests: 6,
      price: '$450.000',
      totalPrice: '$1.350.000',
      status: 'cancelada',
      host: 'Ana Rodríguez',
      rating: 4.7,
      reviews: 203,
      bookingCode: 'BK003',
      amenities: ['WiFi', 'Historic', 'Patio', 'Kitchen']
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    const loadBookings = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBookings(mockBookings);
      setFilteredBookings(mockBookings);
      setLoading(false);
    };

    loadBookings();
  }, []);

  useEffect(() => {
    let filtered = bookings.filter(booking => {
      const matchesSearch = booking.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.checkIn) - new Date(b.checkIn);
        case 'price':
          return parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, ''));
        case 'name':
          return a.property.localeCompare(b.property);
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, sortBy]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmada':
        return <CheckCircle size={16} className="status-icon confirmed" />;
      case 'pendiente':
        return <Clock size={16} className="status-icon pending" />;
      case 'cancelada':
        return <XCircle size={16} className="status-icon cancelled" />;
      default:
        return <AlertCircle size={16} className="status-icon" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'confirmada': 'Confirmada',
      'pendiente': 'Pendiente',
      'cancelada': 'Cancelada'
    };
    return statusMap[status] || status;
  };

  const handleViewDetails = (booking) => {
    console.log('Ver detalles:', booking);
    // Aquí implementarías la navegación a detalles
  };

  const handleDownloadVoucher = (booking) => {
    console.log('Descargar voucher:', booking);
    // Implementar descarga de voucher
  };

  const handleContactHost = (booking) => {
    console.log('Contactar anfitrión:', booking);
    // Implementar chat/contacto
  };

  if (loading) {
    return (
      <div className="my-bookings loading">
        <div className="loading-spinner"></div>
        <p>Cargando tus reservas...</p>
      </div>
    );
  }

  return (
    <div className="my-bookings">
      <div className="bookings-header">
        <div className="header-title">
          <h2 className="section-title">Mis Reservas</h2>
          <span className="bookings-count">{filteredBookings.length} reserva{filteredBookings.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="bookings-controls">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por propiedad o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filtros
            <ChevronDown size={16} className={showFilters ? 'rotate' : ''} />
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Estado:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Todos</option>
                <option value="confirmada">Confirmadas</option>
                <option value="pendiente">Pendientes</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Ordenar por:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="date">Fecha</option>
                <option value="price">Precio</option>
                <option value="name">Nombre</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lista de reservas */}
      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>No se encontraron reservas</h3>
            <p>Prueba ajustando los filtros o realiza una nueva búsqueda</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className={`booking-card ${booking.status}`}>
              <div className="booking-image">
                <img src={booking.image} alt={booking.property} />
                <div className="booking-status-badge">
                  {getStatusIcon(booking.status)}
                  <span>{getStatusText(booking.status)}</span>
                </div>
              </div>

              <div className="booking-content">
                <div className="booking-main-info">
                  <h3 className="booking-property">{booking.property}</h3>
                  <div className="booking-location">
                    <MapPin size={14} />
                    <span>{booking.location}</span>
                  </div>
                  
                  <div className="booking-rating">
                    <Star size={14} className="star-filled" />
                    <span>{booking.rating}</span>
                    <span className="reviews-count">({booking.reviews} reseñas)</span>
                  </div>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <div>
                      <span className="detail-label">Fechas</span>
                      <span className="detail-value">{booking.dates}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <Users size={16} />
                    <div>
                      <span className="detail-label">Huéspedes</span>
                      <span className="detail-value">{booking.guests} personas</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <DollarSign size={16} />
                    <div>
                      <span className="detail-label">Total</span>
                      <span className="detail-value price">{booking.totalPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="booking-meta">
                  <span className="booking-code">Código: {booking.bookingCode}</span>
                  <span className="booking-host">Anfitrión: {booking.host}</span>
                </div>

                <div className="booking-amenities">
                  {booking.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={index} className="amenity-tag">{amenity}</span>
                  ))}
                  {booking.amenities.length > 3 && (
                    <span className="amenity-tag more">+{booking.amenities.length - 3} más</span>
                  )}
                </div>
              </div>

              <div className="booking-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => handleViewDetails(booking)}
                >
                  <Eye size={16} />
                  Ver Detalles
                </button>

                {booking.status === 'confirmada' && (
                  <button 
                    className="action-btn secondary"
                    onClick={() => handleDownloadVoucher(booking)}
                  >
                    <Download size={16} />
                    Voucher
                  </button>
                )}

                <button 
                  className="action-btn secondary"
                  onClick={() => handleContactHost(booking)}
                >
                  <MessageSquare size={16} />
                  Contactar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredBookings.length > 0 && (
        <div className="bookings-footer">
          <button className="view-all-btn">
            Ver historial completo
          </button>
          <p className="footer-note">
            ¿Necesitas ayuda? <a href="/support">Contacta nuestro soporte</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
