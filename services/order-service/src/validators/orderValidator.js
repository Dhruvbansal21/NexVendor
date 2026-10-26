import { z } from 'zod';
import { badRequest } from '@marketplace/shared';

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, 'productId is required'),
      qty: z.number().int().min(1).optional(),
      quantity: z.number().int().min(1).optional()
    }).refine(data => data.qty !== undefined || data.quantity !== undefined, {
      message: 'Quantity must be at least 1'
    }).transform(data => ({
      productId: data.productId,
      qty: data.qty ?? data.quantity
    }))
  ).min(1, 'Cart items cannot be empty'),
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    street: z.string().optional(),
    addressLine1: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().min(4, 'Postal code is required'),
    country: z.string().optional().default('India'),
    phone: z.string().optional().default('+91 9876543210')
  }).transform(data => ({
    ...data,
    street: data.street || data.addressLine1 || 'Main Street'
  }))
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
