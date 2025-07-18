import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/authMiddleware';

/**
 * Authentication routes
 * Handles user registration, login, and profile endpoints
 */
const authRouter = Router();

// Public routes
authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.post('/refresh', AuthController.refreshToken);

// Protected routes
authRouter.get('/profile', authenticateToken, AuthController.getProfile);

export { authRouter };