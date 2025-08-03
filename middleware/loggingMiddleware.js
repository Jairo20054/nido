// Middleware de logging detallado

const fs = require('fs');
const path = require('path');

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Archivo de log
const logFile = path.join(logDir, 'api.log');

/**
 * Middleware para logging de solicitudes
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const requestLogger = (req, res, next) => {
  // Capturar el tiempo de inicio
  const startTime = Date.now();
  
  // Registrar la solicitud entrante
  const requestLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query
  };
  
  console.log(`[${requestLog.timestamp}] ${requestLog.method} ${requestLog.url} - IP: ${requestLog.ip}`);
  
  // Registrar en archivo
  fs.appendFileSync(logFile, JSON.stringify(requestLog) + '\n');
  
  // Capturar la respuesta para logging
  const originalSend = res.send;
  res.send = function(data) {
    // Calcular el tiempo de respuesta
    const duration = Date.now() - startTime;
    
    // Registrar la respuesta
    const responseLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      response: data
    };
    
    console.log(`[${responseLog.timestamp}] ${responseLog.method} ${req.url} - Status: ${responseLog.statusCode} - Duration: ${responseLog.duration}`);
    
    // Registrar en archivo
    fs.appendFileSync(logFile, JSON.stringify(responseLog) + '\n');
    
    // Llamar al método original send
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = requestLogger;
