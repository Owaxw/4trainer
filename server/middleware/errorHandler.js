const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  // Log the error
  logger.error(err.message, { stack: err.stack });
  
  // Default error status
  const statusCode = err.statusCode || 500;
  
  // Error response
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};