

/**
 * Formatear fecha a string legible en español
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
const formatDate = (date) => {
  if (!date) return '';
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return new Date(date).toLocaleDateString('es-ES', options);
};

/**
 * Calcular la diferencia en días entre dos fechas
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin
 * @returns {number} Número de días
 */
const calculateDaysDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calcular la diferencia en milisegundos
  const diffTime = Math.abs(end - start);
  
  // Convertir a días
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Generar un ID único
 * @returns {string} ID único
 */
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido, false si no
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar contraseña
 * @param {string} password - Contraseña a validar
 * @returns {boolean} true si es válida, false si no
 */
const validatePassword = (password) => {
  // Al menos 6 caracteres
  return password.length >= 6;
};

/**
 * Formatear precio a moneda
 * @param {number} price - Precio a formatear
 * @param {string} currency - Código de moneda (por defecto 'COP')
 * @returns {string} Precio formateado
 */
const formatPrice = (price, currency = 'COP') => {
  if (typeof price !== 'number') return '';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(price);
};

/**
 * Capitalizar primera letra de una cadena
 * @param {string} string - Cadena a capitalizar
 * @returns {string} Cadena con primera letra mayúscula
 */
const capitalizeFirstLetter = (string) => {
  if (typeof string !== 'string') return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Generar slug a partir de una cadena
 * @param {string} string - Cadena a convertir a slug
 * @returns {string} Slug generado
 */
const generateSlug = (string) => {
  if (typeof string !== 'string') return '';
  
  return string
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Validar número de teléfono
 * @param {string} phone - Número de teléfono a validar
 * @returns {boolean} true si es válido, false si no
 */
const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

module.exports = {
  formatDate,
  calculateDaysDifference,
  generateUniqueId,
  validateEmail,
  validatePassword,
  formatPrice,
  capitalizeFirstLetter,
  generateSlug,
  validatePhone
};
