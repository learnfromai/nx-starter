import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/AuthController';
import { JwtMiddleware } from '../middleware/JwtMiddleware';

export const createAuthRoutes = (): Router => {
  const router = Router();
  const authController = container.resolve(AuthController);

  /**
   * Authentication routes
   * Base path: /api/auth
   */

  // Public routes
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.post('/refresh', authController.refreshToken);
  router.post('/logout', authController.logout);

  // Protected routes
  router.get('/profile', JwtMiddleware.authenticate, authController.getProfile);

  return router;
};