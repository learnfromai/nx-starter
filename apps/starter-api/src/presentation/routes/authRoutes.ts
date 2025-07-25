import { Router } from 'express';
import { useExpressServer } from 'routing-controllers';
import { AuthController } from '../controllers/AuthController';

export function createAuthRoutes(): Router {
  const router = Router();
  
  // Use routing-controllers to handle the AuthController
  useExpressServer(router, {
    controllers: [AuthController],
    routePrefix: '',
  });

  return router;
}