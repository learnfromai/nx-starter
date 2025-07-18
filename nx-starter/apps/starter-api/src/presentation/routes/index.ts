import { Router } from 'express';
import { createTodoRoutes } from './todoRoutes';
import { createDecoratorTodoRoutes, createHybridTodoRoutes } from './decoratorTodoRoutes';

export const createApiRoutes = (): Router => {
  const router = Router();

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  });

  // Traditional API routes
  router.use('/todos', createTodoRoutes());

  // Decorator-based API routes (demonstration)
  // This shows how decorator-based controllers can be integrated
  router.use('/decorator-todos', createDecoratorTodoRoutes());
  
  // Hybrid routes (both traditional and decorator-based)
  router.use('/hybrid', createHybridTodoRoutes());

  return router;
};
