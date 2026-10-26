import jwt from 'jsonwebtoken';
import { unauthorized, forbidden } from '@marketplace/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-dev-only-secret-key-32chars-min';

export function authenticateGateway(options = { required: true }) {
  return (req, res, next) => {
    // Strip client spoofing attempts
    delete req.headers['x-internal-key'];
    delete req.headers['x-user-id'];
    delete req.headers['x-user-role'];
    delete req.headers['x-user-email'];

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (options.required) {
        return next(unauthorized('Bearer token required', 'UNAUTHORIZED'));
      }
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      next();
    } catch (err) {
      if (options.required) {
        return next(unauthorized('Invalid or expired token', 'INVALID_TOKEN'));
      }
      // If optional, proceed without user
      req.user = null;
      next();
    }
  };
}

export function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(unauthorized('Authentication required', 'UNAUTHORIZED'));
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(forbidden(`Access denied: required role ${roles.join(' or ')}`, 'FORBIDDEN'));
    }
    next();
  };
}
