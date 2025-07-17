import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/AuthController';

export const createAuthRoutes = (): Router => {
  const router = Router();
  const authController = container.resolve(AuthController);

  // Auth endpoints
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.post('/logout', authController.logout);

  return router;
};