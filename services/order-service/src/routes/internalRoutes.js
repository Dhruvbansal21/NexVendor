import { Router } from 'express';
import {
  handleInternalStats,
  handleInternalVendorStats,
  handleInternalCustomerStats
} from '../controllers/orderController.js';
import { requireInternalKey } from '@marketplace/shared';

export const internalRouter = Router();

internalRouter.use(requireInternalKey);

internalRouter.get('/stats', handleInternalStats);
internalRouter.get('/orders/vendor-stats/:vendorId', handleInternalVendorStats);
internalRouter.get('/orders/customer-stats/:customerId', handleInternalCustomerStats);
