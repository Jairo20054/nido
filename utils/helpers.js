// Funciones de utilidad generales

// Función para generar un ID único
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Función para validar un email
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Función para validar una contraseña
const validatePassword = (password) => {
  // Al menos 8 caracteres, una mayúscula, una minúscula y un número
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

// Función para calcular la edad
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Función para formatear una fecha
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Función para calcular la diferencia en días entre dos fechas
const dateDifferenceInDays = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000; // horas*minutos*segundos*milisegundos
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

// Función para generar un token de acceso (simulado)
const generateToken = (payload) => {
  // En una implementación real, aquí se usaría JWT para generar un token
  // Por ahora, simulamos la generación de un token
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// Función para verificar un token de acceso (simulado)
const verifyToken = (token) => {
  // En una implementación real, aquí se usaría JWT para verificar un token
  // Por ahora, simulamos la verificación de un token
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('ascii'));
    return payload;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateId,
  validateEmail,
  validatePassword,
  calculateAge,
  formatDate,
  dateDifferenceInDays,
  generateToken,
  verifyToken
};
