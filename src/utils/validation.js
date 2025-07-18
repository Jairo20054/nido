// Funciones de validación mejoradas con mensajes de error y validaciones más robustas

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {Object} - {isValid: boolean, message: string}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'El email es requerido' };
  }
  
  const trimmedEmail = email.trim();
  if (trimmedEmail === '') {
    return { isValid: false, message: 'El email es requerido' };
  }
  
  // Regex más completo para validación de email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, message: 'Formato de email inválido' };
  }
  
  if (trimmedEmail.length > 254) {
    return { isValid: false, message: 'Email demasiado largo' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida contraseña con criterios de seguridad
 * @param {string} password - Contraseña a validar
 * @param {Object} options - Opciones de validación
 * @returns {Object} - {isValid: boolean, message: string}
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false,
    maxLength = 128
  } = options;
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'La contraseña es requerida' };
  }
  
  if (password.length < minLength) {
    return { isValid: false, message: `La contraseña debe tener al menos ${minLength} caracteres` };
  }
  
  if (password.length > maxLength) {
    return { isValid: false, message: `La contraseña no puede exceder ${maxLength} caracteres` };
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos una mayúscula' };
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos una minúscula' };
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos un número' };
  }
  
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos un carácter especial' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida número de teléfono con formatos internacionales
 * @param {string} phone - Teléfono a validar
 * @param {string} country - Código de país (opcional)
 * @returns {Object} - {isValid: boolean, message: string}
 */
export const validatePhone = (phone, country = 'international') => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, message: 'El teléfono es requerido' };
  }
  
  // Limpiar el teléfono de espacios y caracteres especiales
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Patrones por país/región
  const patterns = {
    'co': /^(\+57|0057|57)?[13][0-9]{9}$/, // Colombia
    'us': /^(\+1|001|1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/, // Estados Unidos
    'mx': /^(\+52|0052|52)?[1-9]\d{9}$/, // México
    'international': /^(\+?[1-9]\d{1,14})$/ // Formato E.164
  };
  
  const pattern = patterns[country.toLowerCase()] || patterns.international;
  
  if (!pattern.test(cleanPhone)) {
    return { 
      isValid: false, 
      message: country === 'international' 
        ? 'Formato de teléfono inválido' 
        : `Formato de teléfono inválido para ${country.toUpperCase()}`
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida campo requerido con manejo de diferentes tipos
 * @param {any} value - Valor a validar
 * @param {string} fieldName - Nombre del campo para el mensaje
 * @returns {Object} - {isValid: boolean, message: string}
 */
export const validateRequired = (value, fieldName = 'Este campo') => {
  if (value === null || value === undefined) {
    return { isValid: false, message: `${fieldName} es requerido` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, message: `${fieldName} es requerido` };
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return { isValid: false, message: `${fieldName} debe tener al menos un elemento` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida rango de fechas
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @param {Object} options - Opciones de validación
 * @returns {Object} - {isValid: boolean, message: string}
 */
export const validateDateRange = (startDate, endDate, options = {}) => {
  const { allowPastDates = false, maxDaysApart = null } = options;
  
  if (!startDate || !endDate) {
    return { isValid: false, message: 'Ambas fechas son requeridas' };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Validar que las fechas sean válidas
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, message: 'Formato de fecha inválido' };
  }
  
  // Validar que la fecha de inicio sea antes que la de fin
  if (start >= end) {
    return { isValid: false, message: 'La fecha de inicio debe ser anterior a la fecha de fin' };
  }
  
  // Validar fechas pasadas si no están permitidas
  if (!allowPastDates && start < today) {
    return { isValid: false, message: 'La fecha de inicio no puede ser en el pasado' };
  }
  
  // Validar máximo de días entre fechas
  if (maxDaysApart) {
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > maxDaysApart) {
      return { 
        isValid: false, 
        message: `El rango no puede exceder ${maxDaysApart} días` 
      };
    }
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida número de huéspedes
 * @param {number|string} guests - Número de huéspedes
 * @param {Object} options - Opciones de validación
 * @returns {Object} - {isValid: boolean, message: string}
 */
export const validateGuests = (guests, options = {}) => {
  const { min = 1, max = 16 } = options;
  
  if (!guests && guests !== 0) {
    return { isValid: false, message: 'El número de huéspedes es requerido' };
  }
  
  const numGuests = parseInt(guests, 10);
  
  if (isNaN(numGuests)) {
    return { isValid: false, message: 'El número de huéspedes debe ser un número válido' };
  }
  
  if (numGuests < min) {
    return { isValid: false, message: `Mínimo ${min} huésped${min > 1 ? 'es' : ''}` };
  }
  
  if (numGuests > max) {
    return { isValid: false, message: `Máximo ${max} huéspedes` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida múltiples campos y retorna resumen de errores
 * @param {Object} fields - Objeto con campos a validar
 * @param {Object} validationRules - Reglas de validación por campo
 * @returns {Object} - {isValid: boolean, errors: Object}
 */
export const validateForm = (fields, validationRules) => {
  const errors = {};
  let isFormValid = true;
  
  for (const [fieldName, value] of Object.entries(fields)) {
    const rules = validationRules[fieldName];
    if (!rules) continue;
    
    for (const rule of rules) {
      const result = rule.validator(value, rule.options);
      if (!result.isValid) {
        errors[fieldName] = result.message;
        isFormValid = false;
        break; // Solo mostrar el primer error por campo
      }
    }
  }
  
  return { isValid: isFormValid, errors };
};

/**
 * Ejemplo de uso del validador de formularios
 */
export const createBookingValidationRules = () => ({
  email: [
    { validator: validateEmail }
  ],
  password: [
    { validator: validatePassword, options: { minLength: 8, requireSpecialChars: true } }
  ],
  phone: [
    { validator: validatePhone, options: 'co' }
  ],
  fullName: [
    { validator: validateRequired, options: 'Nombre completo' }
  ],
  guests: [
    { validator: validateGuests, options: { min: 1, max: 10 } }
  ]
});