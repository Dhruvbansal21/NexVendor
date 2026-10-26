import { z } from 'zod';
import { badRequest } from '@marketplace/shared';

export const createProductSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.number().int().min(0, 'Price must be non-negative integer in paise'),
  category: z.string().min(2, 'Category is required'),
  stock: z.number().int().min(0, 'Stock must be non-negative integer'),
  imageUrl: z.string().optional().default('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'),
  status: z.enum(['draft', 'active']).optional().default('draft')
});

export const updateProductSchema = createProductSchema.partial();

export const reserveStockSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, 'productId is required'),
      qty: z.number().int().min(1, 'Quantity must be at least 1')
    })
  ).min(1, 'At least one item is required for reservation')
});

export const releaseStockSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, 'productId is required'),
      qty: z.number().int().min(1, 'Quantity must be at least 1')
    })
  ).min(1, 'At least one item is required for release')
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
