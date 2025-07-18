import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './BookingSummary.css';

const BookingSummary = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // Fetch booking details
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando detalles de la reserva...</p>
      </div>
    );
  }

  return (
    <div className="booking-summary-page">
      <div className="booking-summary-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h1>¡Reserva Confirmada!</h1>
          <p>Tu reserva ha sido confirmada exitosamente</p>
        </div>

        <div className="booking-details-card">
          <div className="property-preview">
            <img src={booking.property.image} alt={booking.property.name} />
            <div className="property-info">
              <h2>{booking.property.name}</h2>
              <p>{booking.property.location}</p>
            </div>
          </div>

          <div className="booking-info">
            <div className="info-group">
              <h3>Detalles de la Estancia</h3>
              <div className="info-row">
                <span>Check-in</span>
                <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <span>Check-out</span>
                <span>{new Date(booking.checkOut).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <span>Huéspedes</span>
                <span>{booking.guests} persona(s)</span>
              </div>
            </div>

            <div className="info-group">
              <h3>Información del Pago</h3>
              <div className="info-row">
                <span>Total pagado</span>
                <span className="total-amount">${booking.totalAmount}</span>
              </div>
              <div className="info-row">
                <span>Método de pago</span>
                <span>{booking.paymentMethod}</span>
              </div>
              <div className="info-row">
                <span>ID de reserva</span>
                <span>{booking.id}</span>
              </div>
            </div>

            <div className="info-group">
              <h3>Contacto del Anfitrión</h3>
              <div className="host-info">
                <img src={booking.host.avatar} alt={booking.host.name} />
                <div>
                  <p>{booking.host.name}</p>
                  <button className="contact-host-btn">Enviar Mensaje</button>
                </div>
              </div>
            </div>
          </div>

          <div className="next-steps">
            <h3>Próximos Pasos</h3>
            <ul>
              <li>✉️ Recibirás un email con los detalles de tu reserva</li>
              <li>📱 Descarga nuestra app para gestionar tu reserva</li>
              <li>📍 Revisa las indicaciones para llegar</li>
            </ul>
          </div>

          <div className="booking-actions">
            <Link to={`/bookings/${bookingId}/download`} className="download-btn">
              Descargar Confirmación
            </Link>
            <Link to="/bookings" className="view-bookings-btn">
              Ver Mis Reservas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
