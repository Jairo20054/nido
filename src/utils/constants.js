// Constantes globales para la aplicación de alquiler de propiedades

/**
 * Tipos de propiedades disponibles
 */
export const PROPERTY_TYPES = [
  { value: 'casa', label: 'Casa', icon: '🏠' },
  { value: 'apartamento', label: 'Apartamento', icon: '🏢' },
  { value: 'habitacion', label: 'Habitación', icon: '🛏️' },
  { value: 'loft', label: 'Loft', icon: '🏙️' },
  { value: 'villa', label: 'Villa', icon: '🏖️' },
  { value: 'cabana', label: 'Cabaña', icon: '🏕️' },
  { value: 'estudio', label: 'Estudio', icon: '📐' },
  { value: 'penthouse', label: 'Penthouse', icon: '🏰' }
];

/**
 * Comodidades y servicios disponibles
 */
export const AMENITIES = [
  // Básicos
  { value: 'wifi', label: 'WiFi', category: 'basico', icon: '📶' },
  { value: 'cocina', label: 'Cocina', category: 'basico', icon: '🍳' },
  { value: 'tv', label: 'TV', category: 'basico', icon: '📺' },
  
  // Electrodomésticos
  { value: 'lavadora', label: 'Lavadora', category: 'electrodomestico', icon: '🧺' },
  { value: 'secadora', label: 'Secadora', category: 'electrodomestico', icon: '🌪️' },
  { value: 'microondas', label: 'Microondas', category: 'electrodomestico', icon: '⚡' },
  { value: 'nevera', label: 'Nevera', category: 'electrodomestico', icon: '❄️' },
  
  // Clima y confort
  { value: 'aire_acondicionado', label: 'Aire acondicionado', category: 'clima', icon: '❄️' },
  { value: 'calefaccion', label: 'Calefacción', category: 'clima', icon: '🔥' },
  { value: 'ventilador', label: 'Ventilador', category: 'clima', icon: '💨' },
  
  // Exterior y recreación
  { value: 'piscina', label: 'Piscina', category: 'exterior', icon: '🏊' },
  { value: 'jacuzzi', label: 'Jacuzzi', category: 'exterior', icon: '🛁' },
  { value: 'terraza', label: 'Terraza', category: 'exterior', icon: '🌿' },
  { value: 'balcon', label: 'Balcón', category: 'exterior', icon: '🏙️' },
  { value: 'jardin', label: 'Jardín', category: 'exterior', icon: '🌱' },
  { value: 'parrilla', label: 'Parrilla/BBQ', category: 'exterior', icon: '🔥' },
  
  // Servicios
  { value: 'estacionamiento', label: 'Estacionamiento', category: 'servicio', icon: '🚗' },
  { value: 'ascensor', label: 'Ascensor', category: 'servicio', icon: '🛗' },
  { value: 'porteria', label: 'Portería 24h', category: 'servicio', icon: '🛡️' },
  { value: 'gym', label: 'Gimnasio', category: 'servicio', icon: '💪' },
  { value: 'accesible', label: 'Accesible', category: 'servicio', icon: '♿' }
];

/**
 * Categorías de comodidades
 */
export const AMENITY_CATEGORIES = [
  { value: 'basico', label: 'Básico' },
  { value: 'electrodomestico', label: 'Electrodomésticos' },
  { value: 'clima', label: 'Clima y Confort' },
  { value: 'exterior', label: 'Exterior y Recreación' },
  { value: 'servicio', label: 'Servicios' }
];

/**
 * Rangos de precios en COP
 */
export const PRICE_RANGES = [
  { 
    value: 'economico', 
    label: 'Económico', 
    min: 0, 
    max: 80000,
    description: 'Hasta $80.000 COP por noche'
  },
  { 
    value: 'medio', 
    label: 'Medio', 
    min: 80000, 
    max: 200000,
    description: '$80.000 - $200.000 COP por noche'
  },
  { 
    value: 'alto', 
    label: 'Alto', 
    min: 200000, 
    max: 500000,
    description: '$200.000 - $500.000 COP por noche'
  },
  { 
    value: 'premium', 
    label: 'Premium', 
    min: 500000, 
    max: 1500000,
    description: 'Más de $500.000 COP por noche'
  }
];

/**
 * Meses del año
 */
export const MONTHS = [
  { value: 0, label: 'Enero', short: 'Ene' },
  { value: 1, label: 'Febrero', short: 'Feb' },
  { value: 2, label: 'Marzo', short: 'Mar' },
  { value: 3, label: 'Abril', short: 'Abr' },
  { value: 4, label: 'Mayo', short: 'May' },
  { value: 5, label: 'Junio', short: 'Jun' },
  { value: 6, label: 'Julio', short: 'Jul' },
  { value: 7, label: 'Agosto', short: 'Ago' },
  { value: 8, label: 'Septiembre', short: 'Sep' },
  { value: 9, label: 'Octubre', short: 'Oct' },
  { value: 10, label: 'Noviembre', short: 'Nov' },
  { value: 11, label: 'Diciembre', short: 'Dic' }
];

/**
 * Días de la semana
 */
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' }
];

/**
 * Estados de reserva
 */
export const BOOKING_STATUS = [
  { value: 'pending', label: 'Pendiente', color: '#f59e0b' },
  { value: 'confirmed', label: 'Confirmada', color: '#10b981' },
  { value: 'cancelled', label: 'Cancelada', color: '#ef4444' },
  { value: 'completed', label: 'Completada', color: '#6366f1' }
];

/**
 * Capacidad de huéspedes
 */
export const GUEST_CAPACITY = [
  { value: 1, label: '1 huésped' },
  { value: 2, label: '2 huéspedes' },
  { value: 3, label: '3 huéspedes' },
  { value: 4, label: '4 huéspedes' },
  { value: 5, label: '5 huéspedes' },
  { value: 6, label: '6 huéspedes' },
  { value: 7, label: '7 huéspedes' },
  { value: 8, label: '8 huéspedes' },
  { value: 9, label: '9+ huéspedes' }
];

/**
 * Reglas de la casa
 */
export const HOUSE_RULES = [
  { value: 'no_smoking', label: 'No fumar', icon: '🚭' },
  { value: 'no_pets', label: 'No mascotas', icon: '🚫🐕' },
  { value: 'no_parties', label: 'No fiestas', icon: '🚫🎉' },
  { value: 'quiet_hours', label: 'Horas de silencio', icon: '🤫' },
  { value: 'check_in_flexible', label: 'Check-in flexible', icon: '⏰' },
  { value: 'self_check_in', label: 'Auto check-in', icon: '🔑' }
];

/**
 * Configuración regional
 */
export const LOCALE_CONFIG = {
  currency: 'COP',
  locale: 'es-CO',
  timezone: 'America/Bogota',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm'
};

/**
 * Límites de la aplicación
 */
export const APP_LIMITS = {
  MAX_IMAGES_PER_PROPERTY: 10,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_TITLE_LENGTH: 100,
  MIN_STAY_DAYS: 1,
  MAX_STAY_DAYS: 365,
  MAX_ADVANCE_BOOKING_DAYS: 365
};