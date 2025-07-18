import React, { useState, useMemo } from 'react';
import './BookingSummary.css';

const BookingSummary = ({ property, bookingData, onBack, onSubmit, loading = false }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validación de datos de entrada
  const safeProperty = property || {};
  const safeBookingData = bookingData || {
    dates: {},
    guests: {},
    payment: {},
    personalInfo: {}
  };

  // Cálculos optimizados con useMemo y validación mejorada
  const bookingCalculations = useMemo(() => {
    const startDate = safeBookingData.dates?.start || new Date();
    const endDate = safeBookingData.dates?.end || new Date();
    
    const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const basePrice = (safeProperty.pricePerNight || 0) * days;
    const cleaningFee = safeProperty.cleaningFee || 0;
    const serviceFee = Math.round(basePrice * 0.1);
    const taxes = Math.round(basePrice * 0.05);
    const total = basePrice + cleaningFee + serviceFee + taxes;

    return { 
      days, 
      basePrice, 
      cleaningFee, 
      serviceFee, 
      taxes, 
      total 
    };
  }, [safeProperty, safeBookingData]);

  // Formateo de fechas con manejo de errores mejorado
  const formatDate = (date) => {
    if (!date || !(date instanceof Date)) return 'Fecha no disponible';
    
    try {
      return new Intl.DateTimeFormat('es-ES', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return date.toLocaleDateString('es-ES');
    }
  };

  // Formateo de moneda con valores predeterminados
  const formatCurrency = (amount) => {
    const value = Number(amount) || 0;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Manejo del envío con validación mejorada
  const handleSubmit = async () => {
    if (!termsAccepted) {
      alert('Debes aceptar los términos y condiciones para continuar');
      return;
    }

    const personalInfo = safeBookingData.personalInfo || {};
    
    if (!personalInfo.email || !personalInfo.firstName) {
      alert('Faltan datos personales requeridos');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...safeBookingData,
        calculations: bookingCalculations,
        termsAccepted,
        submittedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert(`Error al procesar la reserva: ${error.message || 'Por favor, inténtalo de nuevo.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Información de huéspedes con manejo de valores nulos
  const getGuestSummary = () => {
    const guests = safeBookingData.guests || {};
    const adults = guests.adults || 0;
    const children = guests.children || 0;
    const infants = guests.infants || 0;
    const pets = guests.pets || 0;
    
    const totalGuests = adults + children;
    
    let summary = totalGuests > 0 
      ? `${totalGuests} huésped${totalGuests !== 1 ? 'es' : ''}` 
      : 'Sin huéspedes';
    
    if (infants > 0) {
      summary += `, ${infants} bebé${infants !== 1 ? 's' : ''}`;
    }
    
    if (pets > 0) {
      summary += `, ${pets} mascota${pets !== 1 ? 's' : ''}`;
    }
    
    return summary;
  };

  // Método de pago con valores predeterminados
  const getPaymentMethodText = () => {
    const method = safeBookingData.payment?.method || 'unknown';
    const methodTexts = {
      card: 'Tarjeta de crédito/débito',
      paypal: 'PayPal',
      cash: 'Efectivo al llegar',
      transfer: 'Transferencia bancaria',
      unknown: 'No especificado'
    };
    
    return methodTexts[method];
  };

  // Estado de carga mejorado
  if (!property || !bookingData) {
    return (
      <div className="booking-summary loading">
        <div className="loading-spinner"></div>
        <p>Cargando resumen de reserva...</p>
      </div>
    );
  }

  return (
    <div className="booking-summary">
      <header className="summary-header">
        <h2>Revisa y confirma tu reserva</h2>
        <p>Verifica que todos los detalles sean correctos antes de confirmar</p>
      </header>
      
      <div className="summary-content">
        <div className="summary-card">
          <div className="property-info">
            <div className="property-image">
              <img 
                src={safeProperty.images?.[0] || '/placeholder-image.jpg'} 
                alt={safeProperty.title || 'Propiedad sin nombre'}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                  e.target.alt = 'Imagen no disponible';
                }}
              />
            </div>
            <div className="property-details">
              <h3>{safeProperty.title || 'Propiedad sin nombre'}</h3>
              <div className="property-location">
                {safeProperty.location || 'Ubicación no disponible'}
              </div>
              {safeProperty.rating && (
                <div className="property-rating">
                  <span className="rating-stars">
                    {'★'.repeat(Math.floor(safeProperty.rating))}
                    {'☆'.repeat(5 - Math.floor(safeProperty.rating))}
                  </span>
                  <span className="rating-number">{safeProperty.rating}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="booking-details">
            <h4>Detalles de la reserva</h4>
            
            <div className="detail-row">
              <span className="detail-label">Fechas:</span>
              <div className="detail-value">
                <span className="dates">
                  {formatDate(safeBookingData.dates?.start)} - {formatDate(safeBookingData.dates?.end)}
                </span>
                <span className="nights">({bookingCalculations.days} noche{bookingCalculations.days !== 1 ? 's' : ''})</span>
              </div>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Huéspedes:</span>
              <span className="detail-value">{getGuestSummary()}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Método de pago:</span>
              <span className="detail-value">{getPaymentMethodText()}</span>
            </div>
          </div>
          
          <div className="price-summary">
            <h4>Resumen de precios</h4>
            
            <div className="price-row">
              <span>{formatCurrency(safeProperty.pricePerNight)} × {bookingCalculations.days} noche{bookingCalculations.days !== 1 ? 's' : ''}</span>
              <span>{formatCurrency(bookingCalculations.basePrice)}</span>
            </div>
            
            {bookingCalculations.cleaningFee > 0 && (
              <div className="price-row">
                <span>Tarifa de limpieza</span>
                <span>{formatCurrency(bookingCalculations.cleaningFee)}</span>
              </div>
            )}
            
            <div className="price-row">
              <span>Tarifa de servicio</span>
              <span>{formatCurrency(bookingCalculations.serviceFee)}</span>
            </div>
            
            <div className="price-row">
              <span>Impuestos y tasas</span>
              <span>{formatCurrency(bookingCalculations.taxes)}</span>
            </div>
            
            <div className="price-row total">
              <span>Total</span>
              <span>{formatCurrency(bookingCalculations.total)}</span>
            </div>
          </div>
        </div>
        
        <div className="personal-info">
          <h3>Información personal</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Nombre:</span>
              <span className="info-value">
                {safeBookingData.personalInfo?.firstName || 'No proporcionado'} {safeBookingData.personalInfo?.lastName || ''}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Correo electrónico:</span>
              <span className="info-value">
                {safeBookingData.personalInfo?.email || 'No proporcionado'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Teléfono:</span>
              <span className="info-value">
                {safeBookingData.personalInfo?.phone || 'No proporcionado'}
              </span>
            </div>
            {safeBookingData.personalInfo?.specialRequests && (
              <div className="info-item full-width">
                <span className="info-label">Solicitudes especiales:</span>
                <span className="info-value">
                  {safeBookingData.personalInfo.specialRequests}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="terms-section">
          <div className="terms-checkbox">
            <input
              type="checkbox"
              id="terms-acceptance"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={isSubmitting}
            />
            <label htmlFor="terms-acceptance">
              Acepto las <a href="/terms" target="_blank" rel="noopener noreferrer">Reglas de la casa</a>, 
              las <a href="/cancellation" target="_blank" rel="noopener noreferrer">Políticas de cancelación</a> 
              y el <a href="/agreement" target="_blank" rel="noopener noreferrer">Acuerdo de arrendamiento</a>.
            </label>
          </div>
        </div>
      </div>
      
      <div className="actions">
        <button 
          type="button" 
          className="back-button"
          onClick={onBack}
          disabled={isSubmitting}
        >
          ← Atrás
        </button>
        <button 
          type="button" 
          className={`confirm-button ${!termsAccepted ? 'disabled' : ''}`}
          onClick={handleSubmit}
          disabled={!termsAccepted || isSubmitting || loading}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Procesando...
            </>
          ) : (
            'Confirmar reserva'
          )}
        </button>
      </div>
    </div>
  );
};

export default BookingSummary;