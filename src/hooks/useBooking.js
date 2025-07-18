import { useState, useContext, useCallback, useMemo } from 'react';
import { BookingContext } from '../context/BookingContext';

export const useBooking = () => {
  const context = useContext(BookingContext);
  const [validationErrors, setValidationErrors] = useState({});
  
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  
  const { bookingData, setBookingData } = context;

  // Función mejorada para calcular precio total
  const calculateTotalPrice = useCallback((pricePerNight, nights, cleaningFee = 0, serviceFee = 0, taxes = 0) => {
    if (!pricePerNight || !nights || nights <= 0) return 0;
    
    const subtotal = pricePerNight * nights;
    const fees = cleaningFee + serviceFee;
    const total = subtotal + fees + taxes;
    
    return Math.round(total * 100) / 100; // Redondear a 2 decimales
  }, []);

  // Validaciones
  const validateProperty = useCallback((property) => {
    const errors = {};
    
    if (!property) {
      errors.property = 'Debe seleccionar una propiedad';
      return errors;
    }
    
    if (!property.id) errors.property = 'Propiedad inválida';
    if (!property.price || property.price <= 0) errors.price = 'Precio inválido';
    if (!property.maxGuests || property.maxGuests <= 0) errors.maxGuests = 'Capacidad inválida';
    
    return errors;
  }, []);

  const validateDates = useCallback((dates) => {
    const errors = {};
    
    if (!dates) {
      errors.dates = 'Debe seleccionar fechas';
      return errors;
    }
    
    if (!dates.checkIn || !dates.checkOut) {
      errors.dates = 'Fechas de check-in y check-out son requeridas';
      return errors;
    }
    
    const checkIn = new Date(dates.checkIn);
    const checkOut = new Date(dates.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
      errors.checkIn = 'La fecha de check-in no puede ser anterior a hoy';
    }
    
    if (checkOut <= checkIn) {
      errors.checkOut = 'La fecha de check-out debe ser posterior al check-in';
    }
    
    if (!dates.nights || dates.nights <= 0) {
      errors.nights = 'Debe seleccionar al menos una noche';
    }
    
    return errors;
  }, []);

  const validateGuests = useCallback((guests, maxGuests = Infinity) => {
    const errors = {};
    
    if (!guests || guests <= 0) {
      errors.guests = 'Debe seleccionar al menos un huésped';
    } else if (guests > maxGuests) {
      errors.guests = `Máximo ${maxGuests} huéspedes permitidos`;
    }
    
    return errors;
  }, []);

  // Función mejorada para establecer propiedad
  const setProperty = useCallback((property) => {
    const errors = validateProperty(property);
    
    setValidationErrors(prev => ({ ...prev, ...errors }));
    
    if (Object.keys(errors).length === 0) {
      setBookingData(prev => {
        const newData = {
          ...prev,
          property,
          totalPrice: calculateTotalPrice(
            property.price,
            prev.dates?.nights || 0,
            property.cleaningFee || 0,
            property.serviceFee || 0,
            property.taxes || 0
          )
        };
        
        // Revalidar huéspedes si exceden el límite de la nueva propiedad
        if (prev.guests > property.maxGuests) {
          newData.guests = property.maxGuests;
        }
        
        return newData;
      });
    }
  }, [setBookingData, calculateTotalPrice, validateProperty]);
  
  const setDates = useCallback((dates) => {
    const errors = validateDates(dates);
    
    setValidationErrors(prev => ({ ...prev, ...errors }));
    
    if (Object.keys(errors).length === 0) {
      setBookingData(prev => ({
        ...prev,
        dates,
        totalPrice: prev.property ? calculateTotalPrice(
          prev.property.price,
          dates.nights,
          prev.property.cleaningFee || 0,
          prev.property.serviceFee || 0,
          prev.property.taxes || 0
        ) : 0
      }));
    }
  }, [setBookingData, calculateTotalPrice, validateDates]);
  
  const setGuests = useCallback((guests) => {
    const maxGuests = bookingData.property?.maxGuests;
    const errors = validateGuests(guests, maxGuests);
    
    setValidationErrors(prev => ({ ...prev, ...errors }));
    
    if (Object.keys(errors).length === 0) {
      setBookingData(prev => ({ ...prev, guests }));
    }
  }, [setBookingData, bookingData.property?.maxGuests, validateGuests]);
  
  const resetBooking = useCallback(() => {
    setBookingData({
      property: null,
      dates: null,
      guests: 1,
      totalPrice: 0
    });
    setValidationErrors({});
  }, [setBookingData]);

  // Función para validar toda la reserva
  const validateBooking = useCallback(() => {
    const propertyErrors = validateProperty(bookingData.property);
    const datesErrors = validateDates(bookingData.dates);
    const guestsErrors = validateGuests(bookingData.guests, bookingData.property?.maxGuests);
    
    const allErrors = { ...propertyErrors, ...datesErrors, ...guestsErrors };
    setValidationErrors(allErrors);
    
    return Object.keys(allErrors).length === 0;
  }, [bookingData, validateProperty, validateDates, validateGuests]);

  // Función para confirmar la reserva
  const confirmBooking = useCallback(async (paymentData = {}) => {
    if (!validateBooking()) {
      throw new Error('Datos de reserva inválidos');
    }

    const bookingPayload = {
      property: bookingData.property,
      dates: bookingData.dates,
      guests: bookingData.guests,
      totalPrice: bookingData.totalPrice,
      payment: paymentData,
      timestamp: new Date().toISOString()
    };

    return bookingPayload;
  }, [bookingData, validateBooking]);

  // Calcular precios desglosados usando useMemo para optimización
  const priceBreakdown = useMemo(() => {
    if (!bookingData.property || !bookingData.dates?.nights) {
      return {
        subtotal: 0,
        cleaningFee: 0,
        serviceFee: 0,
        taxes: 0,
        total: 0
      };
    }

    const { property, dates } = bookingData;
    const subtotal = property.price * dates.nights;
    const cleaningFee = property.cleaningFee || 0;
    const serviceFee = property.serviceFee || 0;
    const taxes = property.taxes || 0;
    const total = subtotal + cleaningFee + serviceFee + taxes;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      cleaningFee: Math.round(cleaningFee * 100) / 100,
      serviceFee: Math.round(serviceFee * 100) / 100,
      taxes: Math.round(taxes * 100) / 100,
      total: Math.round(total * 100) / 100,
      pricePerNight: property.price,
      nights: dates.nights
    };
  }, [bookingData.property, bookingData.dates]);

  // Estado de la reserva
  const bookingStatus = useMemo(() => {
    const hasProperty = !!bookingData.property;
    const hasDates = !!bookingData.dates;
    const hasGuests = bookingData.guests > 0;
    const isValid = Object.keys(validationErrors).length === 0;

    return {
      hasProperty,
      hasDates,
      hasGuests,
      isComplete: hasProperty && hasDates && hasGuests,
      isValid: isValid && hasProperty && hasDates && hasGuests,
      completionPercentage: Math.round(
        ((hasProperty ? 33 : 0) + (hasDates ? 33 : 0) + (hasGuests ? 34 : 0))
      )
    };
  }, [bookingData, validationErrors]);

  return {
    // Estado principal
    bookingData,
    validationErrors,
    priceBreakdown,
    bookingStatus,
    
    // Acciones principales
    setProperty,
    setDates,
    setGuests,
    resetBooking,
    
    // Validación y confirmación
    validateBooking,
    confirmBooking,
    clearValidationErrors: () => setValidationErrors({}),
    
    // Utilidades
    isReadyToBook: bookingStatus.isValid
  };
};
