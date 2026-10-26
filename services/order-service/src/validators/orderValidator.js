import { z } from 'zod';
import { badRequest } from '@marketplace/shared';

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, 'productId is required'),
      qty: z.number().int().min(1, 'Quantity must be at least 1')
    })
  ).min(1, 'Cart items cannot be empty'),
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    street: z.string().min(3, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().min(4, 'Postal code is required'),
    country: z.string().optional().default('India'),
    phone: z.string().min(8, 'Phone number is required')
  })
});

export const updateStatusSchema = z.object({
  subOrderId: z.string().min(1, 'subOrderId is required'),
  status: z.enum(['confirmed', 'packed', 'shipped', 'delivered', 'cancelled'])
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
    req.body = result.data;
    next();
  };
}
