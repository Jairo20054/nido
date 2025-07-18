const config = {
  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 10000, // 10 seconds
    retryAttempts: 3
  },

  // Authentication Configuration
  auth: {
    tokenKey: 'nido_auth_token',
    refreshTokenKey: 'nido_refresh_token',
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
  },

  // App Features Configuration
  features: {
    instantBooking: true,
    guestReviews: true,
    propertyRating: true,
    messaging: true,
    mapView: true,
    notifications: true
  },

  // Map Configuration
  map: {
    defaultCenter: {
      lat: 4.710989,
      lng: -74.072092
    },
    defaultZoom: 12,
    apiKey: process.env.REACT_APP_MAPS_API_KEY
  },

  // Image Configuration
  images: {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxCount: 10,
    defaultPlaceholder: '/images/placeholder.jpg'
  },

  // Booking Configuration
  booking: {
    minNights: 1,
    maxNights: 90,
    maxGuests: 16,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    cancellationPeriod: 48 // hours
  },

  // Price Configuration
  pricing: {
    currency: 'COP',
    serviceFeePercentage: 0.10, // 10%
    cleaningFeeBase: 50000,
    additionalGuestFee: 25000
  },

  // Search Configuration
  search: {
    resultsPerPage: 12,
    maxPriceFilter: 2000000,
    maxFilterOptions: 5,
    sortOptions: [
      { value: 'recommended', label: 'Recomendados' },
      { value: 'price-asc', label: 'Precio: Menor a Mayor' },
      { value: 'price-desc', label: 'Precio: Mayor a Menor' },
      { value: 'rating', label: 'Mejor Valorados' }
    ]
  },

  // Property Configuration
  property: {
    amenities: [
      { id: 'wifi', label: 'WiFi', icon: '📶' },
      { id: 'ac', label: 'Aire Acondicionado', icon: '❄️' },
      { id: 'kitchen', label: 'Cocina', icon: '🍳' },
      { id: 'tv', label: 'TV', icon: '📺' },
      { id: 'parking', label: 'Parqueadero', icon: '🚗' },
      { id: 'pool', label: 'Piscina', icon: '🏊‍♂️' },
      { id: 'gym', label: 'Gimnasio', icon: '💪' },
      { id: 'washer', label: 'Lavadora', icon: '🧺' },
      { id: 'beach', label: 'Playa', icon: '🏖️' },
      { id: 'bbq', label: 'BBQ', icon: '🍖' }
    ],
    types: [
      'Apartamento',
      'Casa',
      'Villa',
      'Cabaña',
      'Habitación Privada',
      'Casa de Campo',
      'Casa de Playa'
    ]
  },

  // Contact Information
  contact: {
    email: 'soporte@nido.com',
    phone: '+57 1234567890',
    address: 'Bogotá, Colombia',
    socialMedia: {
      facebook: 'https://facebook.com/nido',
      instagram: 'https://instagram.com/nido',
      twitter: 'https://twitter.com/nido'
    }
  },

  // Error Messages
  errorMessages: {
    general: 'Ha ocurrido un error. Por favor, inténtalo de nuevo.',
    network: 'Error de conexión. Verifica tu conexión a internet.',
    auth: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
    notFound: 'El recurso solicitado no fue encontrado.',
    validation: 'Por favor, verifica los datos ingresados.',
    booking: 'Error al procesar la reserva. Por favor, inténtalo de nuevo.'
  }
};

export default config;
