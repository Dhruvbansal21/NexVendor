import { z } from 'zod';
import { badRequest } from '@marketplace/shared';

export const onboardSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  description: z.string().optional().default(''),
  contactEmail: z.string().email('Valid contact email is required'),
  contactPhone: z.string().min(8, 'Contact phone must be at least 8 digits')
});

export const rejectSchema = z.object({
  reason: z.string().min(3, 'Rejection reason must be at least 3 characters')
});

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }));
      return next(badRequest('Validation failed', details, 'VALIDATION_ERROR'));
    }
    req.body = { ...req.body, ...result.data };
    next();
  };
}
