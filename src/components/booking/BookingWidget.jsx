import React, { useState, useEffect, useMemo } from 'react';
import { Users, Star, Clock, Shield } from 'lucide-react';

// Objeto con valores predeterminados
const defaultProperty = {
  pricePerNight: 120,
  rating: 4.8,
  reviewCount: 247,
  cleaningFee: 25,
  serviceFeeRate: 0.12,
  maxGuests: 8,
  instantBook: true
};

const BookingWidget = ({ property = null }) => {
  // Usar property o defaultProperty si es null/undefined
  const safeProperty = useMemo(() => property || defaultProperty, [property]);

  const [dates, setDates] = useState({ start: null, end: null });
  const [guests, setGuests] = useState({ adults: 1, children: 0 });
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validación
  useEffect(() => {
    const newErrors = {};
    
    if (dates.start && dates.end) {
      if (dates.start >= dates.end) {
        newErrors.dates = 'La fecha de salida debe ser posterior a la llegada';
      }
    }
    
    const totalGuests = guests.adults + guests.children;
    if (totalGuests > safeProperty.maxGuests) {
      newErrors.guests = `Máximo ${safeProperty.maxGuests} huéspedes permitidos`;
    }
    
    if (guests.adults === 0) {
      newErrors.guests = 'Se requiere al menos un adulto';
    }
    
    setErrors(newErrors);
  }, [dates, guests, safeProperty.maxGuests]);

  const handleDateChange = (field, value) => {
    const date = value ? new Date(value) : null;
    setDates(prev => ({ ...prev, [field]: date }));
  };

  const handleGuestChange = (type, increment) => {
    setGuests(prev => {
      const newValue = prev[type] + increment;
      return {
        ...prev,
        [type]: Math.max(0, newValue)
      };
    });
  };

  const calculateTotal = () => {
    if (!dates.start || !dates.end) return { subtotal: 0, cleaningFee: 0, serviceFee: 0, total: 0, days: 0 };
    
    const days = Math.ceil((dates.end - dates.start) / (1000 * 60 * 60 * 24));
    const subtotal = safeProperty.pricePerNight * days;
    const cleaningFee = safeProperty.cleaningFee || 0;
    const serviceFee = subtotal * (safeProperty.serviceFeeRate || 0.1);
    const total = subtotal + cleaningFee + serviceFee;
    
    return { subtotal, cleaningFee, serviceFee, total, days };
  };

  const { subtotal, cleaningFee, serviceFee, total, days } = calculateTotal();

  const formatDate = (date) => {
    return date ? date.toISOString().split('T')[0] : '';
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const canBook = () => {
    return dates.start && dates.end && guests.adults > 0 && Object.keys(errors).length === 0;
  };

  const handleBooking = async () => {
    if (!canBook()) return;
    
    setIsLoading(true);
    // Simular proceso de reserva
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    alert('¡Reserva realizada con éxito!');
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-gray-900">
              ${safeProperty.pricePerNight.toLocaleString()}
            </span>
            <span className="text-gray-600">/noche</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{safeProperty.rating}</span>
            <span className="text-gray-500">({safeProperty.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-4">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-2 border border-gray-300 rounded-lg overflow-hidden">
          <div className="p-3 border-r border-gray-300">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
              Llegada
            </label>
            <input
              type="date"
              value={formatDate(dates.start)}
              onChange={(e) => handleDateChange('start', e.target.value)}
              min={getTodayDate()}
              className="w-full text-sm font-medium text-gray-900 bg-transparent border-none outline-none"
            />
          </div>
          <div className="p-3">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
              Salida
            </label>
            <input
              type="date"
              value={formatDate(dates.end)}
              onChange={(e) => handleDateChange('end', e.target.value)}
              min={dates.start ? formatDate(new Date(dates.start.getTime() + 24 * 60 * 60 * 1000)) : getTodayDate()}
              className="w-full text-sm font-medium text-gray-900 bg-transparent border-none outline-none"
            />
          </div>
        </div>

        {errors.dates && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {errors.dates}
          </p>
        )}

        {/* Guests */}
        <div className="relative">
          <button
            onClick={() => setShowGuestModal(!showGuestModal)}
            className="w-full p-3 border border-gray-300 rounded-lg text-left hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                  Huéspedes
                </label>
                <span className="text-sm font-medium text-gray-900">
                  {guests.adults + guests.children} huésped{guests.adults + guests.children !== 1 ? 'es' : ''}
                </span>
              </div>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          {showGuestModal && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Adultos</div>
                    <div className="text-sm text-gray-500">13 años o más</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleGuestChange('adults', -1)}
                      disabled={guests.adults <= 1}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{guests.adults}</span>
                    <button
                      onClick={() => handleGuestChange('adults', 1)}
                      disabled={guests.adults + guests.children >= safeProperty.maxGuests}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Niños</div>
                    <div className="text-sm text-gray-500">2-12 años</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleGuestChange('children', -1)}
                      disabled={guests.children <= 0}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{guests.children}</span>
                    <button
                      onClick={() => handleGuestChange('children', 1)}
                      disabled={guests.adults + guests.children >= safeProperty.maxGuests}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowGuestModal(false)}
                  className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>

        {errors.guests && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {errors.guests}
          </p>
        )}

        {/* Availability Check */}
        {!canBook() ? (
          <button
            disabled
            className="w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
          >
            Verificar disponibilidad
          </button>
        ) : (
          <div className="space-y-4">
            {/* Price Breakdown */}
            <div className="space-y-3 py-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span>${safeProperty.pricePerNight.toLocaleString()} × {days} noche{days !== 1 ? 's' : ''}</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              
              {cleaningFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tarifa de limpieza</span>
                  <span>${cleaningFee.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span>Tarifa de servicio</span>
                <span>${serviceFee.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Book Button */}
            <button
              onClick={handleBooking}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : (
                <>
                  {safeProperty.instantBook && <Shield className="w-4 h-4" />}
                  {safeProperty.instantBook ? 'Reserva instantánea' : 'Reservar ahora'}
                </>
              )}
            </button>

            {/* Contact Host */}
            <button className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Contactar al anfitrión
            </button>

            {safeProperty.instantBook && (
              <p className="text-xs text-gray-500 text-center">
                No se te cobrará todavía
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingWidget;