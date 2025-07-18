import { MONTHS, DAYS_OF_WEEK, LOCALE_CONFIG } from './constants.js';
import { MONTHS } from './constants';
/**
 * Formateo de moneda
 */
export const formatCurrency = (value, options = {}) => {
  const {
    currency = LOCALE_CONFIG.currency,
    locale = LOCALE_CONFIG.locale,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    compact = false
  } = options;

  if (value == null || isNaN(value)) return '$0';

  if (compact && value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  
  if (compact && value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
};

/**
 * Calcula la diferencia en días entre dos fechas
 */
export const getDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Normalizar las fechas a medianoche para evitar problemas con horarios
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

/**
 * Formateo de fechas con múltiples opciones
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const {
    includeYear = true,
    includeDay = false,
    format = 'long', // 'long', 'short', 'numeric'
    locale = LOCALE_CONFIG.locale
  } = options;

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';

  const day = dateObj.getDate();
  const month = format === 'short' 
    ? MONTHS[dateObj.getMonth()].short 
    : MONTHS[dateObj.getMonth()].label;
  const year = dateObj.getFullYear();
  const dayOfWeek = format === 'short' 
    ? DAYS_OF_WEEK[dateObj.getDay()].short 
    : DAYS_OF_WEEK[dateObj.getDay()].label;

  if (format === 'numeric') {
    return includeYear 
      ? `${day.toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${year}`
      : `${day.toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  let formatted = includeDay ? `${dayOfWeek}, ` : '';
  formatted += `${day} de ${month}`;
  formatted += includeYear ? ` de ${year}` : '';

  return formatted;
};

/**
 * Trunca texto con opciones avanzadas
 */
export const truncateText = (text, options = {}) => {
  const {
    maxLength = 100,
    suffix = '...',
    preserveWords = true,
    stripHtml = false
  } = options;

  if (!text || typeof text !== 'string') return '';

  let processedText = stripHtml ? text.replace(/<[^>]*>/g, '') : text;
  
  if (processedText.length <= maxLength) return processedText;

  let truncated = processedText.substring(0, maxLength);
  
  if (preserveWords) {
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    if (lastSpaceIndex > 0) {
      truncated = truncated.substring(0, lastSpaceIndex);
    }
  }

  return truncated + suffix;
};

/**
 * Validación de email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validación de teléfono colombiano
 */
export const isValidPhoneNumber = (phone) => {
  // Acepta formatos: +57 XXX XXX XXXX, 57XXXXXXXXXX, 3XXXXXXXXX
  const phoneRegex = /^(\+57|57)?[3][0-9]{9}$/;
  const cleanPhone = phone.replace(/[\s-]/g, '');
  return phoneRegex.test(cleanPhone);
};

/**
 * Genera un ID único simple
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce function para optimizar búsquedas
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Formatea números de manera legible
 */
export const formatNumber = (num, options = {}) => {
  const { locale = LOCALE_CONFIG.locale, compact = false } = options;
  
  if (num == null || isNaN(num)) return '0';

  if (compact) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Calcula el precio total de una reserva
 */
export const calculateTotalPrice = (pricePerNight, startDate, endDate, fees = {}) => {
  const nights = getDateRange(startDate, endDate);
  const subtotal = pricePerNight * nights;
  
  const {
    cleaningFee = 0,
    serviceFee = 0,
    taxRate = 0.19 // IVA en Colombia
  } = fees;

  const feesTotal = cleaningFee + serviceFee;
  const subtotalWithFees = subtotal + feesTotal;
  const taxes = subtotalWithFees * taxRate;
  const total = subtotalWithFees + taxes;

  return {
    nights,
    subtotal,
    cleaningFee,
    serviceFee,
    taxes,
    total,
    priceBreakdown: {
      [`${formatCurrency(pricePerNight)} x ${nights} noche${nights !== 1 ? 's' : ''}`]: subtotal,
      ...(cleaningFee > 0 && { 'Tarifa de limpieza': cleaningFee }),
      ...(serviceFee > 0 && { 'Tarifa de servicio': serviceFee }),
      'Impuestos': taxes
    }
  };
};

/**
 * Verifica si una fecha está disponible
 */
export const isDateAvailable = (date, unavailableDates = []) => {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return !unavailableDates.some(unavailable => {
    const unavailableDate = new Date(unavailable);
    unavailableDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === unavailableDate.getTime();
  });
};

/**
 * Obtiene el rango de fechas entre dos fechas
 */
export const getDatesBetween = (startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  while (start <= end) {
    dates.push(new Date(start));
    start.setDate(start.getDate() + 1);
  }
  
  return dates;
};

/**
 * Formatea un rango de fechas
 */
export const formatDateRange = (startDate, endDate, options = {}) => {
  const { separator = ' - ', includeYear = true } = options;
  
  if (!startDate || !endDate) return '';
  
  const start = formatDate(startDate, { includeYear: false });
  const end = formatDate(endDate, { includeYear });
  
  return `${start}${separator}${end}`;
};

/**
 * Capitaliza la primera letra de cada palabra
 */
export const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Obtiene las iniciales de un nombre
 */
export const getInitials = (name, maxInitials = 2) => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .split(' ')
    .filter(word => word.length > 0)
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

/**
 * Convierte un valor a boolean de manera segura
 */
export const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
};

/**
 * Limpia y formatea un número de teléfono
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('57')) {
    const number = cleaned.substring(2);
    return `+57 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
  }
  
  if (cleaned.length === 10) {
    return `+57 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  return phone;
};

/**
 * Obtiene una imagen placeholder
 */
export const getPlaceholderImage = (width = 400, height = 300, text = 'Sin imagen') => {
  return `https://via.placeholder.com/${width}x${height}/e2e8f0/64748b?text=${encodeURIComponent(text)}`;
};