import { Router } from 'express';
import {
  handleInternalGetByUserId,
  handleInternalGetById,
  handleInternalStats
} from '../controllers/vendorController.js';
import { requireInternalKey } from '@marketplace/shared';

export const internalRouter = Router();

internalRouter.use(requireInternalKey);

internalRouter.get('/by-user/:userId', handleInternalGetByUserId);
internalRouter.get('/:id', handleInternalGetById);
internalRouter.get('/stats/all', handleInternalStats);
internalRouter.get('/stats', handleInternalStats);
