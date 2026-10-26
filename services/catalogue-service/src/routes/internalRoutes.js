import { Router } from 'express';
import {
  handleReserveStock,
  handleReleaseStock,
  handleSyncVendorStatus,
  handleInternalStats
} from '../controllers/catalogueController.js';
import {
  reserveStockSchema,
  releaseStockSchema,
  validateBody
} from '../validators/productValidator.js';
import { requireInternalKey } from '@marketplace/shared';

export const internalRouter = Router();

internalRouter.use(requireInternalKey);

internalRouter.post('/stock/reserve', validateBody(reserveStockSchema), handleReserveStock);
internalRouter.post('/stock/release', validateBody(releaseStockSchema), handleReleaseStock);
internalRouter.post('/vendors/:id/status-changed', handleSyncVendorStatus);
internalRouter.get('/stats', handleInternalStats);
