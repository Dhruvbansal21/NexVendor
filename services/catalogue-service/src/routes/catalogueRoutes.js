import { Router } from 'express';
import {
  handleGetProducts,
  handleGetProductById,
  handleGetCategories,
  handleGetMyProducts,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct
} from '../controllers/catalogueController.js';
import {
  createProductSchema,
  updateProductSchema,
  validateBody
} from '../validators/productValidator.js';
import { extractUserFromHeaders, requireRole } from '@marketplace/shared';

export const catalogueRouter = Router();

catalogueRouter.use(extractUserFromHeaders);

// Public catalogue routes
catalogueRouter.get('/products', handleGetProducts);
catalogueRouter.get('/categories', handleGetCategories);
catalogueRouter.get('/products/:id', handleGetProductById);

// Vendor-protected routes
catalogueRouter.get('/my-products', requireRole('vendor'), handleGetMyProducts);
catalogueRouter.post('/products', requireRole('vendor'), validateBody(createProductSchema), handleCreateProduct);
catalogueRouter.patch('/products/:id', requireRole('vendor'), validateBody(updateProductSchema), handleUpdateProduct);
catalogueRouter.delete('/products/:id', requireRole('vendor'), handleDeleteProduct);
