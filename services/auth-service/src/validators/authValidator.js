import { z } from 'zod';
import { badRequest } from '@marketplace/shared';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'vendor'], {
    errorMap: () => ({ message: 'Role must be customer or vendor only. Admin cannot self-register.' })
  })
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export function validateBody(schema) {
  return (req, res, next) => {
    if (req.body?.role === 'admin') {
      return next(badRequest('Admin self-registration is strictly prohibited', [], 'CANNOT_REGISTER_AS_ADMIN'));
    }
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }));
      return next(badRequest('Validation failed', details, 'VALIDATION_ERROR'));
    }
    req.body = result.data;
    next();
  };
}
