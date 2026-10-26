export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function badRequest(message = 'Bad Request', details = [], code = 'BAD_REQUEST') {
  return new AppError(message, 400, code, details);
}

export function unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
  return new AppError(message, 401, code);
}

export function forbidden(message = 'Forbidden: insufficient permissions', code = 'FORBIDDEN') {
  return new AppError(message, 403, code);
}

export function notFound(message = 'Resource not found', code = 'NOT_FOUND') {
  return new AppError(message, 404, code);
}

export function conflict(message = 'Conflict', code = 'CONFLICT', details = []) {
  return new AppError(message, 409, code, details);
}
