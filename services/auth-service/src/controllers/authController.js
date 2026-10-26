import * as authService from '../services/authService.js';
import { sendSuccess, unauthorized } from '@marketplace/shared';

export async function handleRegister(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function handleLogin(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleMe(req, res, next) {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    if (!userId) {
      return next(unauthorized('User identity missing', 'UNAUTHORIZED'));
    }
    const user = await authService.getMe(userId);
    return sendSuccess(res, user, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleInternalStats(req, res, next) {
  try {
    const stats = await authService.getStats();
    return sendSuccess(res, stats, 200);
  } catch (err) {
    next(err);
  }
}
