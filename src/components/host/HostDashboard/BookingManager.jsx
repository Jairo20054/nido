import React, { useState, useMemo } from 'react';
import './BookingManager.css';

const BookingManager = () => {
  const [bookings, setBookings] = useState([
    { 
      id: 1, 
      property: 'Apartamento Centro', 
      guest: 'Juan Pérez', 
      email: 'juan.perez@email.com',
      phone: '+57 301 234 5678',
      checkIn: '2025-06-15',
      checkOut: '2025-06-20', 
      status: 'confirmada',
      price: 420000,
      nights: 5,
      guests: 2,
      paymentStatus: 'pagado'
    },
    { 
      id: 2, 
      property: 'Casa Campestre', 
      guest: 'Ana López', 
      email: 'ana.lopez@email.com',
      phone: '+57 312 987 6543',
      checkIn: '2025-06-25',
      checkOut: '2025-06-30', 
      status: 'pendiente',
      price: 600000,
      nights: 5,
      guests: 4,
      paymentStatus: 'pendiente'
    },
    { 
      id: 3, 
      property: 'Loft Moderno', 
      guest: 'Carlos Rivera', 
      email: 'carlos.rivera@email.com',
      phone: '+57 315 456 7890',
      checkIn: '2025-07-01',
      checkOut: '2025-07-05', 
      status: 'cancelada',
      price: 350000,
      nights: 4,
      guests: 2,
      paymentStatus: 'reembolsado'
    }
  ]);
  
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Memoizar bookings filtradas para optimizar rendimiento
  const filteredBookings = useMemo(() => {
    return filter === 'all' 
      ? bookings 
      : bookings.filter(booking => booking.status === filter);
  }, [bookings, filter]);

  // Formatear precio en pesos colombianos
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Formatear fechas
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmadas = bookings.filter(b => b.status === 'confirmada').length;
    const pendientes = bookings.filter(b => b.status === 'pendiente').length;
    const canceladas = bookings.filter(b => b.status === 'cancelada').length;
    
    return { total, confirmadas, pendientes, canceladas };
  }, [bookings]);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleStatusChange = (bookingId, newStatus) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      )
    );
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      confirmada: { label: 'Confirmada', class: 'confirmada' },
      pendiente: { label: 'Pendiente', class: 'pendiente' },
      cancelada: { label: 'Cancelada', class: 'cancelada' }
    };

    const config = statusConfig[status] || statusConfig.pendiente;
    
    return (
      <span className={`booking-status ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="booking-manager">
      {/* Header con estadísticas */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Gestión de Reservas</h2>
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.confirmadas}</span>
              <span className="stat-label">Confirmadas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.pendientes}</span>
              <span className="stat-label">Pendientes</span>
            </div>
          </div>
        </div>
        
        <div className="filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({stats.total})
          </button>
          <button 
            className={`filter-btn ${filter === 'confirmada' ? 'active' : ''}`}
            onClick={() => setFilter('confirmada')}
          >
            Confirmadas ({stats.confirmadas})
          </button>
          <button 
            className={`filter-btn ${filter === 'pendiente' ? 'active' : ''}`}
            onClick={() => setFilter('pendiente')}
          >
            Pendientes ({stats.pendientes})
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelada' ? 'active' : ''}`}
            onClick={() => setFilter('cancelada')}
          >
            Canceladas ({stats.canceladas})
          </button>
        </div>
      </div>
      
      {/* Lista de reservas */}
      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <p>No hay reservas que coincidan con el filtro seleccionado.</p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-main-info">
                <div className="booking-header">
                  <h3 className="booking-property">{booking.property}</h3>
                  <StatusBadge status={booking.status} />
                </div>
                
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="detail-label">Huésped:</span>
                    <span className="detail-value">{booking.guest}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Fechas:</span>
                    <span className="detail-value">
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Huéspedes:</span>
                    <span className="detail-value">{booking.guests} personas</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Noches:</span>
                    <span className="detail-value">{booking.nights} noches</span>
                  </div>
                </div>
              </div>
              
              <div className="booking-actions">
                <div className="booking-price">
                  {formatPrice(booking.price)}
                </div>
                <div className="action-buttons">
                  <button 
                    className="action-btn primary"
                    onClick={() => handleViewDetails(booking)}
                  >
                    Ver detalles
                  </button>
                  {booking.status === 'pendiente' && (
                    <button 
                      className="action-btn success"
                      onClick={() => handleStatusChange(booking.id, 'confirmada')}
                    >
                      Confirmar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de detalles */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles de la Reserva</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-section">
                <h4>Información de la Propiedad</h4>
                <p><strong>Propiedad:</strong> {selectedBooking.property}</p>
              </div>
              
              <div className="modal-section">
                <h4>Información del Huésped</h4>
                <p><strong>Nombre:</strong> {selectedBooking.guest}</p>
                <p><strong>Email:</strong> {selectedBooking.email}</p>
                <p><strong>Teléfono:</strong> {selectedBooking.phone}</p>
                <p><strong>Número de huéspedes:</strong> {selectedBooking.guests}</p>
              </div>
              
              <div className="modal-section">
                <h4>Detalles de la Estancia</h4>
                <p><strong>Check-in:</strong> {formatDate(selectedBooking.checkIn)}</p>
                <p><strong>Check-out:</strong> {formatDate(selectedBooking.checkOut)}</p>
                <p><strong>Noches:</strong> {selectedBooking.nights}</p>
              </div>
              
              <div className="modal-section">
                <h4>Información de Pago</h4>
                <p><strong>Total:</strong> {formatPrice(selectedBooking.price)}</p>
                <p><strong>Estado de pago:</strong> 
                  <span className={`payment-status ${selectedBooking.paymentStatus}`}>
                    {selectedBooking.paymentStatus}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManager;