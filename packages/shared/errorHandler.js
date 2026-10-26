import { logger } from './logger.js';
import { AppError } from './errors.js';

export function errorHandler(err, req, res, next) {
  const correlationId = req.correlationId || req.headers?.['x-correlation-id'] || 'unknown';

  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details = [];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Input validation failed';
    details = err.errors ? err.errors.map(e => ({ path: e.path.join('.'), message: e.message })) : [];
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.message;
    details = Object.values(err.errors || {}).map(e => ({ path: e.path, message: e.message }));
  } else if (err.code === 11000) {
    // Mongo duplicate key error
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    message = 'A resource with this key already exists';
    details = err.keyValue ? Object.entries(err.keyValue).map(([k, v]) => ({ field: k, value: v })) : [];
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message || message;
    code = err.code || code;
  }

  if (statusCode >= 500) {
    logger.error({
      err,
      correlationId,
      url: req.originalUrl,
      method: req.method
    }, `[${correlationId}] 500 Server Error: ${err.message}`);
  } else {
    logger.warn({
      code,
      message,
      correlationId,
      url: req.originalUrl,
      method: req.method
    }, `[${correlationId}] Client Error ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      details,
      correlationId
    }
  });
}
