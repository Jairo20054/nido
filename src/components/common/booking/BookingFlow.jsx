import React, { useState, useEffect, useCallback } from 'react';
import DateSelector from './DateSelector';
import GuestSelector from './GuestSelector';
import PaymentForm from './g';
import BookingSummary from '../BookingSummary/BookingSummary';
import './BookingFlow.css';

const STEPS = [
  { id: 1, label: 'Fechas', icon: '📅' },
  { id: 2, label: 'Huéspedes', icon: '👥' },
  { id: 3, label: 'Pago', icon: '💳' },
  { id: 4, label: 'Confirmación', icon: '✓' }
];

const INITIAL_BOOKING_DATA = {
  dates: { start: null, end: null },
  guests: { adults: 1, children: 0, infants: 0, pets: 0 },
  payment: {
    method: 'card',
    card: {
      number: '',
      name: '',
      expiry: '',
      cvc: ''
    },
    paypal: {
      email: ''
    }
  },
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  }
};

const BookingFlow = ({ 
  property, 
  onBookingComplete, 
  onBookingError,
  initialData = {},
  className = '' 
}) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [bookingData, setBookingData] = useState({
    ...INITIAL_BOOKING_DATA,
    ...initialData
  });

  // Validación segura de propiedades
  const safeProperty = property || {};
  const safeGuest = bookingData.guests || {};
  const safePersonalInfo = bookingData.personalInfo || {};
  const safePayment = bookingData.payment || {};

  // Validación de pasos
  const validateStep = useCallback((stepNumber, data = bookingData) => {
    const stepErrors = {};
    
    switch (stepNumber) {
      case 1:
        if (!data.dates?.start || !data.dates?.end) {
          stepErrors.dates = 'Por favor selecciona las fechas de tu estancia';
        }
        break;
      case 2:
        if ((safeGuest.adults || 0) < 1) {
          stepErrors.guests = 'Debe haber al menos un adulto';
        }
        if (safeProperty?.maxGuests && 
            ((safeGuest.adults || 0) + (safeGuest.children || 0)) > safeProperty.maxGuests) {
          stepErrors.guests = `Máximo ${safeProperty.maxGuests} huéspedes permitidos`;
        }
        break;
      case 3:
        if (!safePersonalInfo.firstName || !safePersonalInfo.lastName) {
          stepErrors.personalInfo = 'Nombre y apellido son requeridos';
        }
        if (!safePersonalInfo.email || !/\S+@\S+\.\S+/.test(safePersonalInfo.email)) {
          stepErrors.personalInfo = 'Email válido es requerido';
        }
        if (safePayment.method === 'card') {
          if (!safePayment.card?.number || 
              !safePayment.card?.name || 
              !safePayment.card?.expiry || 
              !safePayment.card?.cvc) {
            stepErrors.payment = 'Todos los campos de la tarjeta son requeridos';
          }
        }
        break;
    }
    
    return stepErrors;
  }, [bookingData, safeProperty, safeGuest, safePersonalInfo, safePayment]);

  // Navegación entre pasos
  const goToStep = useCallback((targetStep) => {
    if (targetStep < 1 || targetStep > STEPS.length) return;
    
    // Validar pasos anteriores
    if (targetStep > step) {
      for (let i = step; i < targetStep; i++) {
        const stepErrors = validateStep(i);
        if (Object.keys(stepErrors).length > 0) {
          setErrors(stepErrors);
          return;
        }
      }
    }
    
    setErrors({});
    setStep(targetStep);
  }, [step, validateStep]);

  const nextStep = useCallback(() => goToStep(step + 1), [goToStep, step]);
  const prevStep = useCallback(() => goToStep(step - 1), [goToStep, step]);

  // Manejadores de cambios optimizados
  const updateBookingData = useCallback((updates) => {
    setBookingData(prev => ({ 
      ...prev, 
      ...updates,
      guests: { ...(prev.guests || {}), ...(updates.guests || {}) },
      payment: { ...(prev.payment || {}), ...(updates.payment || {}) },
      personalInfo: { ...(prev.personalInfo || {}), ...(updates.personalInfo || {}) }
    }));
    setErrors({});
  }, []);

  const handleDateChange = useCallback((dates) => {
    updateBookingData({ dates });
  }, [updateBookingData]);

  const handleGuestChange = useCallback((guests) => {
    updateBookingData({ guests });
  }, [updateBookingData]);

  const handlePaymentChange = useCallback((payment) => {
    updateBookingData({ payment });
  }, [updateBookingData]);

  const handlePersonalInfoChange = useCallback((personalInfo) => {
    updateBookingData({ personalInfo });
  }, [updateBookingData]);

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación final
    const finalErrors = validateStep(4);
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const bookingResult = {
        ...bookingData,
        property: safeProperty,
        timestamp: new Date().toISOString(),
        totalAmount: calculateTotalAmount()
      };
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Reserva completada:', bookingResult);
      onBookingComplete?.(bookingResult);
      
    } catch (error) {
      console.error('Error al procesar la reserva:', error);
      setErrors({ submit: 'Error al procesar la reserva. Inténtalo de nuevo.' });
      onBookingError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cálculo del monto total
  const calculateTotalAmount = useCallback(() => {
    if (!bookingData.dates?.start || 
        !bookingData.dates?.end || 
        !safeProperty?.pricePerNight) {
      return 0;
    }
    
    const start = new Date(bookingData.dates.start);
    const end = new Date(bookingData.dates.end);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    return nights * (safeProperty.pricePerNight || 0);
  }, [bookingData.dates, safeProperty]);

  // Manejo de teclado para navegación
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && step > 1) {
        prevStep();
      } else if (e.key === 'ArrowRight' && step < STEPS.length) {
        nextStep();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [step, nextStep, prevStep]);

  const currentStepData = STEPS.find(s => s.id === step);
  const completedSteps = step - 1;

  return (
    <div className={`booking-flow ${className}`} role="main" aria-label="Proceso de reserva">
      {/* Indicador de progreso */}
      <div className="steps" role="tablist" aria-label="Pasos de la reserva">
        <div 
          className="progress-bar" 
          style={{ width: `${(completedSteps / (STEPS.length - 1)) * 100}%` }}
          aria-hidden="true"
        />
        
        {STEPS.map((stepInfo, index) => (
          <button
            key={stepInfo.id}
            className={`step ${step === stepInfo.id ? 'active' : ''} ${step > stepInfo.id ? 'completed' : ''}`}
            onClick={() => goToStep(stepInfo.id)}
            disabled={stepInfo.id > step + 1}
            role="tab"
            aria-selected={step === stepInfo.id}
            aria-controls={`step-panel-${stepInfo.id}`}
            type="button"
          >
            <span className="step-number" aria-hidden="true">
              {step > stepInfo.id ? '✓' : stepInfo.id}
            </span>
            <span className="step-label">{stepInfo.label}</span>
            <span className="step-icon" aria-hidden="true">{stepInfo.icon}</span>
          </button>
        ))}
      </div>

      {/* Contenido del paso actual */}
      <div 
        className="flow-content"
        id={`step-panel-${step}`}
        role="tabpanel"
        aria-labelledby={`step-${step}`}
      >
        <div className="step-header">
          <h2 className="step-title">
            {currentStepData?.icon} {currentStepData?.label}
          </h2>
          <p className="step-description">
            Paso {step} de {STEPS.length}
          </p>
        </div>

        {/* Mostrar errores globales */}
        {Object.keys(errors).length > 0 && (
          <div className="error-banner" role="alert" aria-live="polite">
            {Object.values(errors).map((error, index) => (
              <p key={index} className="error-message">{error}</p>
            ))}
          </div>
        )}

        {/* Componentes de cada paso */}
        <div className="step-content">
          {step === 1 && (
            <DateSelector 
              dates={bookingData.dates || {}} 
              onChange={handleDateChange} 
              onNext={nextStep}
              property={safeProperty}
              errors={errors.dates}
            />
          )}
          
          {step === 2 && (
            <GuestSelector 
              guests={safeGuest} 
              maxGuests={safeProperty?.maxGuests}
              onChange={handleGuestChange}
              onBack={prevStep}
              onNext={nextStep}
              errors={errors.guests}
            />
          )}
          
          {step === 3 && (
            <PaymentForm 
              payment={safePayment} 
              personalInfo={safePersonalInfo}
              onChange={handlePaymentChange}
              onPersonalInfoChange={handlePersonalInfoChange}
              onBack={prevStep}
              onNext={nextStep}
              errors={{
                ...(errors.payment && { payment: errors.payment }),
                ...(errors.personalInfo && { personalInfo: errors.personalInfo })
              }}
              totalAmount={calculateTotalAmount()}
            />
          )}
          
          {step === 4 && (
            <BookingSummary 
              property={safeProperty}
              bookingData={{
                ...bookingData,
                guests: safeGuest,
                personalInfo: safePersonalInfo,
                payment: safePayment
              }}
              onBack={prevStep}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              errors={errors.submit}
              totalAmount={calculateTotalAmount()}
            />
          )}
        </div>

        {/* Navegación inferior */}
        <div className="step-navigation">
          {step > 1 && (
            <button 
              type="button" 
              onClick={prevStep}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              ← Anterior
            </button>
          )}
          
          <div className="nav-spacer" />
          
          {step < STEPS.length && (
            <button 
              type="button" 
              onClick={nextStep}
              className="btn btn-primary"
              disabled={isLoading}
            >
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;