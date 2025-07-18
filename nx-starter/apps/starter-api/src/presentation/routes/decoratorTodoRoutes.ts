import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { RouteRegistry } from '../../shared/decorators';
import { DecoratorTodoController } from '../controllers/DecoratorTodoController';

/**
 * Creates todo routes using the decorator-based route registry
 */
export const createDecoratorTodoRoutes = (): Router => {
  const routeRegistry = new RouteRegistry();
  const todoController = container.resolve(DecoratorTodoController);
  
  // Generate routes from decorator metadata
  return routeRegistry.createRoutes(todoController);
};

/**
 * Alternative function that creates both traditional and decorator-based routes
 * This allows for gradual migration from traditional to decorator-based patterns
 */
export const createHybridTodoRoutes = (): Router => {
  const router = Router();
  
  // Add decorator-based routes under /decorator prefix for demonstration
  const decoratorRoutes = createDecoratorTodoRoutes();
  router.use('/decorator', decoratorRoutes);
  
  return router;
};