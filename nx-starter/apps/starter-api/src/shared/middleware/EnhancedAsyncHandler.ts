import { Request, Response, NextFunction } from 'express';
import { handleControllerError } from './ErrorHandler';
import { createResponseHelper, ResponseHelper } from '../utils/ResponseHelpers';
import { ApiResponse } from '../types/ResponseTypes';

/**
 * Enhanced request object with response helper
 */
export interface EnhancedRequest extends Request {
  respond: ResponseHelper;
}

/**
 * Enhanced async handler that provides response standardization
 * This handler extends the original asyncHandler with response helpers
 */
export const enhancedAsyncHandler = (
  fn: (req: EnhancedRequest, res: Response, next: NextFunction) => Promise<void | ApiResponse>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Enhance the request object with response helpers
    const enhancedReq = req as EnhancedRequest;
    enhancedReq.respond = createResponseHelper(res);

    Promise.resolve(fn(enhancedReq, res, next))
      .then((result) => {
        // If the handler returns a response object, send it
        if (result && typeof result === 'object' && 'success' in result) {
          if (result.success) {
            if ('data' in result) {
              res.json(result);
            } else if ('message' in result) {
              res.json(result);
            }
          } else {
            res.status(400).json(result);
          }
        }
        // If no return value, assume response was already sent
      })
      .catch((error) => {
        handleControllerError(error, enhancedReq, res, next);
      });
  };
};

/**
 * Legacy async handler type for backward compatibility
 */
export type LegacyAsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Enhanced async handler type
 */
export type EnhancedAsyncHandler = (
  req: EnhancedRequest,
  res: Response,
  next: NextFunction
) => Promise<void | ApiResponse>;

/**
 * Utility function to create response objects that can be returned from handlers
 */
export const createResponse = {
  /**
   * Create success response with data
   */
  data: <T>(data: T): ApiResponse<T> => ({
    success: true,
    data,
  }),

  /**
   * Create success response with message
   */
  message: (message: string): ApiResponse => ({
    success: true,
    message,
  }),

  /**
   * Create error response
   */
  error: (error: string, code?: string, details?: any): ApiResponse => ({
    success: false,
    error,
    ...(code && { code }),
    ...(details && { details }),
  }),
};