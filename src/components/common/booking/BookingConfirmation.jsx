import React from 'react';
import './BookingConfirmation.css';

const BookingConfirmation = ({ booking, onEdit, onConfirm }) => {
  // Verificar si booking es null o undefined
  if (!booking) {
    return (
      <div className="error-container">
        <h2>¡Reserva no disponible!</h2>
        <p>No se encontraron datos de reserva. Por favor intenta nuevamente.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Crear objetos seguros para propiedades anidadas
  const safeGuest = booking.guest || {};
  const safePayment = booking.payment || {};

  return (
    <div className="confirmation-container">
      <div className="confirmation-header">
        <div className="success-icon">✓</div>
        <h2>¡Reserva Confirmada!</h2>
        <p>Tu reserva ha sido procesada exitosamente</p>
      </div>
      
      <div className="booking-summary">
        <h3>Resumen de tu Reserva</h3>
        
        <div className="summary-section">
          <h4>Detalles de la Reserva</h4>
          <div className="summary-item">
            <span>Referencia:</span>
            <strong>{booking.reference || 'N/A'}</strong>
          </div>
          <div className="summary-item">
            <span>Fecha de Entrada:</span>
            <span>{formatDate(booking.checkIn)}</span>
          </div>
          <div className="summary-item">
            <span>Fecha de Salida:</span>
            <span>{formatDate(booking.checkOut)}</span>
          </div>
          <div className="summary-item">
            <span>Huéspedes:</span>
            <span>{booking.guests || 0} personas</span>
          </div>
        </div>
        
        <div className="summary-section">
          <h4>Información del Huésped</h4>
          <div className="summary-item">
            <span>Nombre:</span>
            <span>
              {safeGuest.firstName || 'N/A'} {safeGuest.lastName || ''}
            </span>
          </div>
          <div className="summary-item">
            <span>Email:</span>
            <span>{safeGuest.email || 'N/A'}</span>
          </div>
          <div className="summary-item">
            <span>Teléfono:</span>
            <span>{safeGuest.phone || 'N/A'}</span>
          </div>
        </div>
        
        <div className="summary-section">
          <h4>Detalles de Pago</h4>
          <div className="summary-item">
            <span>Método:</span>
            <span>{safePayment.method || 'N/A'}</span>
          </div>
          <div className="summary-item">
            <span>Total Pagado:</span>
            <strong>${(booking.total || 0).toFixed(2)}</strong>
          </div>
        </div>
      </div>
      
      <div className="confirmation-actions">
        <button onClick={onEdit} className="edit-btn">
          Editar Reserva
        </button>
        <button onClick={onConfirm} className="finish-btn">
          Finalizar
        </button>
      </div>
      
      <div className="confirmation-footer">
        <p>Se ha enviado un correo de confirmación a <strong>{safeGuest.email || 'N/A'}</strong></p>
        <p>Para cualquier consulta, contacta a soporte@hotel.com</p>
      </div>
    </div>
  );
};

export default BookingConfirmation;