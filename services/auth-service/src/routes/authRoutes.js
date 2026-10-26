import { Router } from 'express';
import { handleRegister, handleLogin, handleMe } from '../controllers/authController.js';
import { registerSchema, loginSchema, validateBody } from '../validators/authValidator.js';
import { extractUserFromHeaders } from '@marketplace/shared';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), handleRegister);
authRouter.post('/login', validateBody(loginSchema), handleLogin);
authRouter.get('/me', extractUserFromHeaders, handleMe);
