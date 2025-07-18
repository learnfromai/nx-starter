import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { enhancedAsyncHandler, createResponse, EnhancedRequest } from './EnhancedAsyncHandler';

describe('Enhanced AsyncHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/test',
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  describe('enhancedAsyncHandler', () => {
    it('should provide response helper to controller', async () => {
      const mockController = vi.fn(async (req: EnhancedRequest) => {
        expect(req.respond).toBeDefined();
        expect(req.respond.successData).toBeDefined();
        expect(req.respond.successMessage).toBeDefined();
        expect(req.respond.error).toBeDefined();
      });

      const wrappedHandler = enhancedAsyncHandler(mockController);
      await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockController).toHaveBeenCalledWith(
        expect.objectContaining({
          respond: expect.any(Object),
        }),
        mockRes,
        mockNext
      );
    });

    it('should handle controller using response helper', async () => {
      const mockController = vi.fn(async (req: EnhancedRequest) => {
        req.respond.successData({ id: 1, name: 'test' });
      });

      const wrappedHandler = enhancedAsyncHandler(mockController);
      await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, name: 'test' },
      });
    });

    it('should handle controller returning response object', async () => {
      const mockController = vi.fn(async () => {
        return createResponse.data({ id: 1, name: 'test' });
      });

      const wrappedHandler = enhancedAsyncHandler(mockController);
      await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, name: 'test' },
      });
    });

    it('should handle controller returning message response', async () => {
      const mockController = vi.fn(async () => {
        return createResponse.message('Operation successful');
      });

      const wrappedHandler = enhancedAsyncHandler(mockController);
      await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Operation successful',
      });
    });

    it('should handle controller returning error response', async () => {
      const mockController = vi.fn(async () => {
        return createResponse.error('Something went wrong', 'ERROR_CODE');
      });

      const wrappedHandler = enhancedAsyncHandler(mockController);
      await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Something went wrong',
        code: 'ERROR_CODE',
      });
    });

    it('should handle exceptions by delegating to error handler', async () => {
      const error = new Error('Controller error');
      const mockController = vi.fn().mockRejectedValue(error);

      const wrappedHandler = enhancedAsyncHandler(mockController);
      await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

      // Give time for the promise to resolve
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(consoleErrorSpy).toHaveBeenCalledWith('Controller error:', error);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createResponse', () => {
    it('should create success data response', () => {
      const result = createResponse.data({ id: 1, name: 'test' });
      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'test' },
      });
    });

    it('should create success message response', () => {
      const result = createResponse.message('Operation successful');
      expect(result).toEqual({
        success: true,
        message: 'Operation successful',
      });
    });

    it('should create error response', () => {
      const result = createResponse.error('Error occurred', 'ERROR_CODE', { field: 'value' });
      expect(result).toEqual({
        success: false,
        error: 'Error occurred',
        code: 'ERROR_CODE',
        details: { field: 'value' },
      });
    });

    it('should create error response without optional fields', () => {
      const result = createResponse.error('Error occurred');
      expect(result).toEqual({
        success: false,
        error: 'Error occurred',
      });
    });
  });
});