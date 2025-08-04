/**
 * Validar datos de propiedad
 * @param {Object} propertyData - Datos de la propiedad a validar
 * @returns {Object} Resultado de la validación
 */
const validatePropertyData = (propertyData) => {
  const errors = [];
  
  // Validar nombre
  if (!propertyData.name || propertyData.name.trim().length === 0) {
    errors.push('El nombre de la propiedad es requerido');
  }
  
  // Validar ubicación
  if (!propertyData.location || propertyData.location.trim().length === 0) {
    errors.push('La ubicación es requerida');
  }
  
  // Validar precio
  if (propertyData.price === undefined || propertyData.price === null) {
    errors.push('El precio es requerido');
  } else if (isNaN(propertyData.price) || propertyData.price < 0) {
    errors.push('El precio debe ser un número válido y no negativo');
  }
  
  // Validar descripción
  if (!propertyData.description || propertyData.description.trim().length === 0) {
    errors.push('La descripción es requerida');
  }
  
  // Validar tipo de propiedad
  const validPropertyTypes = ['house', 'apartment', 'condo', 'villa'];
  if (!propertyData.propertyType || !validPropertyTypes.includes(propertyData.propertyType)) {
    errors.push('El tipo de propiedad es requerido y debe ser válido');
  }
  
  // Validar número de habitaciones
  if (propertyData.bedrooms === undefined || propertyData.bedrooms === null) {
    errors.push('El número de habitaciones es requerido');
  } else if (isNaN(propertyData.bedrooms) || propertyData.bedrooms < 1) {
    errors.push('El número de habitaciones debe ser un número válido y mayor a 0');
  }
  
  // Validar número de baños
  if (propertyData.bathrooms === undefined || propertyData.bathrooms === null) {
    errors.push('El número de baños es requerido');
  } else if (isNaN(propertyData.bathrooms) || propertyData.bathrooms < 1) {
    errors.push('El número de baños debe ser un número válido y mayor a 0');
  }
  
  // Validar número máximo de huéspedes
  if (propertyData.maxGuests === undefined || propertyData.maxGuests === null) {
    errors.push('El número máximo de huéspedes es requerido');
  } else if (isNaN(propertyData.maxGuests) || propertyData.maxGuests < 1) {
    errors.push('El número máximo de huéspedes debe ser un número válido y mayor a 0');
  }
  
  // Validar anfitrión
  if (!propertyData.host) {
    errors.push('El anfitrión es requerido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar datos de usuario
 * @param {Object} userData - Datos del usuario a validar
 * @returns {Object} Resultado de la validación
 */
const validateUserData = (userData) => {
  const errors = [];
  
  // Validar nombre
  if (!userData.name || userData.name.trim().length === 0) {
    errors.push('El nombre es requerido');
  }
  
  // Validar email
  if (!userData.email || userData.email.trim().length === 0) {
    errors.push('El email es requerido');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push('El email no es válido');
    }
  }
  
  // Validar contraseña
  if (!userData.password || userData.password.length === 0) {
    errors.push('La contraseña es requerida');
  } else if (userData.password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  // Validar rol
  const validRoles = ['user', 'host', 'admin'];
  if (userData.role && !validRoles.includes(userData.role)) {
    errors.push('El rol debe ser válido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar datos de reserva
 * @param {Object} bookingData - Datos de la reserva a validar
 * @returns {Object} Resultado de la validación
 */
const validateBookingData = (bookingData) => {
  const errors = [];
  
  // Validar usuario
  if (!bookingData.userId) {
    errors.push('El usuario es requerido');
  }
  
  // Validar propiedad
  if (!bookingData.propertyId) {
    errors.push('La propiedad es requerida');
  }
  
  // Validar fecha de inicio
  if (!bookingData.startDate) {
    errors.push('La fecha de inicio es requerida');
  } else {
    const startDate = new Date(bookingData.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push('La fecha de inicio no es válida');
    }
  }
  
  // Validar fecha de fin
  if (!bookingData.endDate) {
    errors.push('La fecha de fin es requerida');
  } else {
    const endDate = new Date(bookingData.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push('La fecha de fin no es válida');
    }
  }
  
  // Validar que la fecha de inicio sea anterior a la fecha de fin
  if (bookingData.startDate && bookingData.endDate) {
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);
    
    if (startDate >= endDate) {
      errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
    }
  }
  
  // Validar número de huéspedes
  if (bookingData.guests === undefined || bookingData.guests === null) {
    errors.push('El número de huéspedes es requerido');
  } else if (isNaN(bookingData.guests) || bookingData.guests < 1) {
    errors.push('El número de huéspedes debe ser un número válido y mayor a 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar datos de login
 * @param {Object} loginData - Datos de login a validar
 * @returns {Object} Resultado de la validación
 */
const validateLoginData = (loginData) => {
  const errors = [];
  
  // Validar email
  if (!loginData.email || loginData.email.trim().length === 0) {
    errors.push('El email es requerido');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginData.email)) {
      errors.push('El email no es válido');
    }
  }
  
  // Validar contraseña
  if (!loginData.password || loginData.password.length === 0) {
    errors.push('La contraseña es requerida');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validatePropertyData,
  validateUserData,
  validateBookingData,
  validateLoginData
};
