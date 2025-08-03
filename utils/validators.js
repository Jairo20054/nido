// Validadores para diferentes tipos de datos

// Validador para propiedades
const validateProperty = (property) => {
  const errors = [];
  
  if (!property.name || property.name.trim() === '') {
    errors.push('Property name is required');
  }
  
  if (!property.location || property.location.trim() === '') {
    errors.push('Property location is required');
  }
  
  if (!property.price || property.price <= 0) {
    errors.push('Property price must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validador para usuarios
const validateUser = (user) => {
  const errors = [];
  
  if (!user.name || user.name.trim() === '') {
    errors.push('User name is required');
  }
  
  if (!user.email || user.email.trim() === '') {
    errors.push('User email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push('User email is invalid');
  }
  
  if (!user.password || user.password.trim() === '') {
    errors.push('User password is required');
  } else if (user.password.length < 8) {
    errors.push('User password must be at least 8 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validador para reservas
const validateBooking = (booking) => {
  const errors = [];
  
  if (!booking.userId) {
    errors.push('User ID is required');
  }
  
  if (!booking.propertyId) {
    errors.push('Property ID is required');
  }
  
  if (!booking.startDate) {
    errors.push('Start date is required');
  }
  
  if (!booking.endDate) {
    errors.push('End date is required');
  }
  
  if (booking.startDate && booking.endDate) {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      errors.push('Invalid date format');
    } else if (start >= end) {
      errors.push('End date must be after start date');
    }
  }
  
  if (!booking.guests || booking.guests <= 0) {
    errors.push('Number of guests must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validador para fechas
const validateDateRange = (startDate, endDate) => {
  const errors = [];
  
  if (!startDate) {
    errors.push('Start date is required');
  }
  
  if (!endDate) {
    errors.push('End date is required');
  }
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      errors.push('Invalid date format');
    } else if (start >= end) {
      errors.push('End date must be after start date');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateProperty,
  validateUser,
  validateBooking,
  validateDateRange
};
