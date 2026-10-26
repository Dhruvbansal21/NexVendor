import { forbidden } from './errors.js';

export function requireInternalKey(req, res, next) {
  const incomingKey = req.headers['x-internal-key'];
  const expectedKey = process.env.INTERNAL_API_KEY || 'change-me-internal-secret-api-key';

  if (!incomingKey || incomingKey !== expectedKey) {
    return next(forbidden('Internal access only: invalid or missing x-internal-key', 'INTERNAL_ACCESS_REQUIRED'));
  }

  next();
}
