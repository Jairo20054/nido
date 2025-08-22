// middleware/requestLogger.js
const morgan = require('morgan');
const logger = require('../utils/logger');

morgan.token('body', (req) => JSON.stringify(req.body));

// stream for morgan to forward logs to winston
const stream = {
  write: (message) => {
    // morgan appends a newline
    logger.info(message.trim());
  }
};

const skip = (req) => {
  // Skip health checks or static assets if you want
  return req.url.includes('/health');
};

module.exports = morgan(':method :url :status :res[content-length] - :response-time ms :body', { stream, skip });
