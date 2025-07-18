import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { enhancedAsyncHandler, createResponse, EnhancedRequest } from './EnhancedAsyncHandler';
import { TodoController } from '../../presentation/controllers/TodoController';

describe('Enhanced AsyncHandler Integration', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/api/todos',
      body: {},
      params: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Real-world usage scenarios', () => {
    it('should handle GET requests with data response', async () => {
      const mockHandler = enhancedAsyncHandler(
        async (req: EnhancedRequest): Promise<void> => {
          const mockData = [
            { id: 1, title: 'Todo 1', completed: false },
            { id: 2, title: 'Todo 2', completed: true },
          ];
          
          req.respond.successData(mockData);
        }
      );

      await mockHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [
          { id: 1, title: 'Todo 1', completed: false },
          { id: 2, title: 'Todo 2', completed: true },
        ],
      });
    });

    it('should handle POST requests with 201 status', async () => {
      const mockHandler = enhancedAsyncHandler(
        async (req: EnhancedRequest): Promise<void> => {
          const createdTodo = { id: 3, title: 'New Todo', completed: false };
          
          req.respond.successData(createdTodo, 201);
        }
      );

      await mockHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 3, title: 'New Todo', completed: false },
      });
    });

    it('should handle PUT requests with message response', async () => {
      const mockHandler = enhancedAsyncHandler(
        async (req: EnhancedRequest) => {
          // Simulate updating a todo
          return createResponse.message('Todo updated successfully');
        }
      );

      await mockHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Todo updated successfully',
      });
    });

    it('should handle DELETE requests with success message', async () => {
      const mockHandler = enhancedAsyncHandler(
        async (req: EnhancedRequest): Promise<void> => {
          // Simulate deleting a todo
          req.respond.successMessage('Todo deleted successfully');
        }
      );

      await mockHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Todo deleted successfully',
      });
    });

    it('should handle validation errors gracefully', async () => {
      const mockHandler = enhancedAsyncHandler(
        async (req: EnhancedRequest) => {
          // Simulate validation error
          return createResponse.error('Title is required', 'VALIDATION_ERROR', {
            field: 'title',
          });
        }
      );

      await mockHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Title is required',
        code: 'VALIDATION_ERROR',
        details: { field: 'title' },
      });
    });

    it('should handle complex data structures', async () => {
      const mockHandler = enhancedAsyncHandler(
        async (req: EnhancedRequest) => {
          const complexData = {
            todos: [
              { id: 1, title: 'Todo 1', completed: false },
              { id: 2, title: 'Todo 2', completed: true },
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 2,
            },
            stats: {
              completed: 1,
              active: 1,
            },
          };

          return createResponse.data(complexData);
        }
      );

      await mockHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          todos: [
            { id: 1, title: 'Todo 1', completed: false },
            { id: 2, title: 'Todo 2', completed: true },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
          },
          stats: {
            completed: 1,
            active: 1,
          },
        },
      });
    });

    it('should handle mixed response patterns in different methods', async () => {
      // Method 1: Using helper method
      const method1 = enhancedAsyncHandler(
        async (req: EnhancedRequest): Promise<void> => {
          req.respond.successData({ id: 1, title: 'Todo 1' });
        }
      );

      // Method 2: Using return value
      const method2 = enhancedAsyncHandler(
        async (req: EnhancedRequest) => {
          return createResponse.message('Operation successful');
        }
      );

      await method1(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, title: 'Todo 1' },
      });

      vi.clearAllMocks();

      await method2(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Operation successful',
      });
    });

    it('should handle async service calls', async () => {
      const mockService = {
        getData: vi.fn().mockResolvedValue([
          { id: 1, title: 'Todo 1' },
          { id: 2, title: 'Todo 2' },
        ]),
      };

      const mockHandler = enhancedAsyncHandler(
        async (req: EnhancedRequest) => {
          const data = await mockService.getData();
          return createResponse.data(data);
        }
      );

      await mockHandler(mockReq as Request, mockRes as Response, mockNext);

      // Give time for promise to resolve
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockService.getData).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [
          { id: 1, title: 'Todo 1' },
          { id: 2, title: 'Todo 2' },
        ],
      });
    });
  });

  describe('Backward compatibility', () => {
    it('should coexist with traditional asyncHandler patterns', async () => {
      // Traditional approach (manual response construction)
      const traditionalHandler = enhancedAsyncHandler(
        async (req: EnhancedRequest, res: Response): Promise<void> => {
          const data = { id: 1, title: 'Todo 1' };
          
          // Manual response construction still works
          res.json({
            success: true,
            data: data,
          });
        }
      );

      await traditionalHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, title: 'Todo 1' },
      });
    });
  });
});