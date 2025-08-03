// Utilidades para el backend API

/**
 * Función para validar que los campos requeridos estén presentes
 * @param {Object} data - Objeto con los datos a validar
 * @param {Array} requiredFields - Array con los nombres de los campos requeridos
 * @returns {Object} - Objeto con success y message
 */
const validateRequiredFields = (data, requiredFields) => {
  for (const field of requiredFields) {
    if (!data[field] || data[field] === '') {
      return {
        success: false,
        message: `El campo ${field} es requerido`
      };
    }
  }
  return { success: true };
};

/**
 * Función para validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido, false si no
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Función para validar que una fecha sea futura
 * @param {string} date - Fecha a validar
 * @returns {boolean} - True si es futura, false si no
 */
const isFutureDate = (date) => {
  const today = new Date();
  const inputDate = new Date(date);
  return inputDate > today;
};

/**
 * Función para calcular el precio total de una reserva
 * @param {number} pricePerNight - Precio por noche
 * @param {string} startDate - Fecha de inicio
 * @param {string} endDate - Fecha de fin
 * @returns {number} - Precio total
 */
const calculateTotalPrice = (pricePerNight, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays * pricePerNight;
};

/**
 * Función para generar un ID único
 * @returns {string} - ID único
 */
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Función para formatear una fecha
 * @param {string} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Función para verificar si un usuario tiene permisos
 * @param {Object} user - Usuario
 * @param {Array} allowedRoles - Roles permitidos
 * @returns {boolean} - True si tiene permisos, false si no
 */
const hasPermission = (user, allowedRoles) => {
  return allowedRoles.includes(user.role);
};

module.exports = {
  validateRequiredFields,
  validateEmail,
  isFutureDate,
  calculateTotalPrice,
  generateUniqueId,
  formatDate,
  hasPermission
};
