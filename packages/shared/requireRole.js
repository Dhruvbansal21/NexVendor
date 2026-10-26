import { unauthorized, forbidden } from './errors.js';

export function extractUserFromHeaders(req, res, next) {
  const id = req.headers['x-user-id'];
  const role = req.headers['x-user-role'];
  const email = req.headers['x-user-email'];

  if (id && role) {
    req.user = {
      id: String(id),
      role: String(role),
      email: email ? String(email) : undefined
    };
  }
  next();
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.id || !req.user.role) {
      return next(unauthorized('Authentication required', 'UNAUTHORIZED'));
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return next(forbidden(`Forbidden: requires role ${allowedRoles.join(' or ')}`, 'FORBIDDEN'));
    }

    next();
  };
}
