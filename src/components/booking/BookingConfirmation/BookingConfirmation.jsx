import React from 'react';
import './BookingConfirmation.css';

const BookingConfirmation = ({ booking, onEdit, onConfirm }) => {
  // Si no llega booking, mostramos un fallback (puede ser spinner, mensaje, etc.)
  if (!booking) {
    return (
      <div className="confirmation-loading">
        <p>Cargando detalles de la reserva…</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const {
    reference = '—',
    checkIn,
    checkOut,
    guests = '—',
    total = 0,
    guest = {},
    payment = {}
  } = booking;

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
            <strong>{reference}</strong>
          </div>
          <div className="summary-item">
            <span>Fecha de Entrada:</span>
            <span>{formatDate(checkIn)}</span>
          </div>
          <div className="summary-item">
            <span>Fecha de Salida:</span>
            <span>{formatDate(checkOut)}</span>
          </div>
          <div className="summary-item">
            <span>Huéspedes:</span>
            <span>{guests} persona{guests > 1 ? 's' : ''}</span>
          </div>
        </div>
        
        <div className="summary-section">
          <h4>Información del Huésped</h4>
          <div className="summary-item">
            <span>Nombre:</span>
            <span>
              {guest?.firstName ?? '—'} {guest?.lastName ?? ''}
            </span>
          </div>
          <div className="summary-item">
            <span>Email:</span>
            <span>{guest?.email ?? '—'}</span>
          </div>
          <div className="summary-item">
            <span>Teléfono:</span>
            <span>{guest?.phone ?? '—'}</span>
          </div>
        </div>
        
        <div className="summary-section">
          <h4>Detalles de Pago</h4>
          <div className="summary-item">
            <span>Método:</span>
            <span>{payment?.method ?? '—'}</span>
          </div>
          <div className="summary-item">
            <span>Total Pagado:</span>
            <strong>${total.toFixed(2)}</strong>
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
        <p>
          Se ha enviado un correo de confirmación a{' '}
          <strong>{guest?.email ?? '—'}</strong>
        </p>
        <p>Para cualquier consulta, contacta a soporte@hotel.com</p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
