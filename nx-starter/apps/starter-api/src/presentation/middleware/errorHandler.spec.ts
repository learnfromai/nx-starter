import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler, requestLogger } from './errorHandler';

describe('ErrorHandler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let consoleErrorSpy: any;
  let consoleLogSpy: any;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/test',
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      headersSent: false,
      on: vi.fn(),
    };

    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Mock environment
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('errorHandler', () => {
    it('should handle general errors in development mode', () => {
      const error = new Error('Test error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Global error handler:', error);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Test error',
        stack: expect.any(String),
      });
    });

    it('should handle general errors in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Test error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Global error handler:', error);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
      });
    });

    it('should not send response if headers already sent', () => {
      mockRes.headersSent = true;
      const error = new Error('Test error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('notFoundHandler', () => {
    it('should handle 404 errors', () => {
      mockReq.originalUrl = '/nonexistent';

      notFoundHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not Found',
        message: 'Route /nonexistent not found',
      });
    });
  });

  describe('requestLogger', () => {
    it('should log request details', () => {
      mockReq.method = 'POST';
      mockReq.path = '/api/test';
      mockReq.body = { test: 'data' };

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Request: POST /api/test',
        'Body:',
        { test: 'data' }
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle request without body', () => {
      mockReq.method = 'GET';
      mockReq.path = '/api/test';

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Request: GET /api/test',
        'Body:',
        undefined
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });
});