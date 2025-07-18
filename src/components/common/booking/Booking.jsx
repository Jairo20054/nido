import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../../hooks/useBooking';
import GuestInfoForm from './GuestInfoForm';
import BookingStepper from './BookingStepper';
import PaymentMethodForm from './PaymentMethodForm';
import BookingSummary from './BookingSummary';
import BookingConfirmation from './BookingConfirmation';
import LoadingSpinner from './LoadingSpinner';
import ErrorState from '../ErrorState/ErrorState';
import { api } from '../../../utils/api';
import './Booking.css';

const BOOKING_STEPS = {
  GUEST_INFO: 0,
  PAYMENT: 1,
  CONFIRMATION: 2
};

const STEP_TITLES = {
  [BOOKING_STEPS.GUEST_INFO]: 'Información del huésped',
  [BOOKING_STEPS.PAYMENT]: 'Método de pago',
  [BOOKING_STEPS.CONFIRMATION]: 'Confirmación'
};

const Booking = () => {
  const navigate = useNavigate();
  const { bookingData, resetBooking } = useBooking();
  
  // Estados principales
  const [activeStep, setActiveStep] = useState(BOOKING_STEPS.GUEST_INFO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  // Objeto seguro para bookingData.property
  const safeProperty = useMemo(() => {
    return bookingData?.property || {
      id: '',
      name: 'Propiedad desconocida',
      pricePerNight: 0,
      rating: 0,
      reviewCount: 0,
      cleaningFee: 0,
      serviceFeeRate: 0,
      maxGuests: 0,
      instantBook: false
    };
  }, [bookingData]);

  // Validación de datos de reserva usando el objeto seguro
  const isBookingDataValid = useMemo(() => {
    return bookingData?.dates?.start && 
           bookingData?.dates?.end && 
           bookingData?.guests;
  }, [bookingData]);

  // Redirección si no hay datos válidos
  useEffect(() => {
    if (!isBookingDataValid) {
      navigate('/', { replace: true });
    }
  }, [isBookingDataValid, navigate]);

  // Funciones de navegación entre pasos
  const handleNext = useCallback(() => {
    setActiveStep(prev => Math.min(prev + 1, BOOKING_STEPS.CONFIRMATION));
    setError(null);
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep(prev => Math.max(prev - 1, BOOKING_STEPS.GUEST_INFO));
    setError(null);
  }, []);

  // Manejo del envío de la reserva usando el objeto seguro
  const handleSubmitBooking = useCallback(async (paymentData) => {
    if (!isBookingDataValid) {
      setError("Datos de reserva incompletos. Por favor, inicia el proceso nuevamente.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const bookingPayload = {
        propertyId: safeProperty.id,
        checkIn: bookingData.dates.start,
        checkOut: bookingData.dates.end,
        guests: bookingData.guests,
        paymentMethod: paymentData.method,
        paymentDetails: paymentData.details,
        totalPrice: bookingData.totalPrice,
        timestamp: new Date().toISOString()
      };
      
      const response = await api.post('/bookings', bookingPayload);
      
      if (response?.data) {
        setConfirmation({
          ...response.data,
          propertyName: safeProperty.name // Añadir nombre de propiedad seguro
        });
        handleNext();
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Error al procesar tu reserva. Por favor, intenta de nuevo.";
      setError(errorMessage);
      console.error("Booking submission error:", err);
    } finally {
      setLoading(false);
    }
  }, [bookingData, isBookingDataValid, handleNext, safeProperty]);

  // Completar proceso de reserva
  const handleComplete = useCallback(() => {
    resetBooking();
    navigate('/dashboard/bookings', { replace: true });
  }, [resetBooking, navigate]);

  // Reintentar en caso de error
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  // Estados de carga y validación
  if (loading) {
    return (
      <div className="booking-page">
        <LoadingSpinner 
          fullPage 
          message="Procesando tu reserva..." 
        />
      </div>
    );
  }

  if (!isBookingDataValid) {
    return null;
  }

  // Renderizado del contenido según el paso activo
  const renderStepContent = () => {
    switch (activeStep) {
      case BOOKING_STEPS.GUEST_INFO:
        return (
          <GuestInfoForm 
            onNext={handleNext}
            // No necesitamos pasar bookingData aquí
          />
        );
      
      case BOOKING_STEPS.PAYMENT:
        return (
          <PaymentMethodForm 
            onBack={handleBack} 
            onSubmit={handleSubmitBooking}
            // No necesitamos pasar bookingData aquí
            loading={loading}
          />
        );
      
      case BOOKING_STEPS.CONFIRMATION:
        return confirmation ? (
          <BookingConfirmation 
            confirmation={confirmation} 
            onComplete={handleComplete}
            // Pasamos solo el nombre seguro de la propiedad
            propertyName={safeProperty.name}
          />
        ) : (
          <ErrorState 
            message="No se pudo obtener la confirmación de la reserva"
            onRetry={handleRetry}
          />
        );
      
      default:
        return (
          <ErrorState 
            message="Paso de reserva no válido"
            onRetry={() => setActiveStep(BOOKING_STEPS.GUEST_INFO)}
          />
        );
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1 className="booking-title">Completar Reserva</h1>
          <p className="booking-subtitle">
            {STEP_TITLES[activeStep]}
          </p>
        </div>

        <div className="booking-stepper-container">
          <BookingStepper 
            activeStep={activeStep} 
            steps={Object.values(STEP_TITLES)}
          />
        </div>
        
        <div className="booking-content">
          <div className="booking-form-container">
            {renderStepContent()}
            
            {error && (
              <div className="booking-error-container">
                <ErrorState 
                  message={error} 
                  onRetry={handleRetry}
                  showRetry={activeStep === BOOKING_STEPS.PAYMENT}
                />
              </div>
            )}
          </div>
          
          {activeStep !== BOOKING_STEPS.CONFIRMATION && (
            <div className="booking-summary-container">
              <BookingSummary 
                // Pasamos solo los datos necesarios con valores seguros
                propertyName={safeProperty.name}
                pricePerNight={safeProperty.pricePerNight}
                rating={safeProperty.rating}
                reviewCount={safeProperty.reviewCount}
                dates={bookingData.dates}
                guests={bookingData.guests}
                cleaningFee={safeProperty.cleaningFee}
                serviceFeeRate={safeProperty.serviceFeeRate}
                totalPrice={bookingData.totalPrice}
                currentStep={activeStep}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;