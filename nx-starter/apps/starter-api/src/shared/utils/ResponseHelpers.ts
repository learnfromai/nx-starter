import { Response } from 'express';
import { 
  SuccessDataResponse, 
  SuccessMessageResponse, 
  ErrorResponse, 
  ApiResponse 
} from '../types/ResponseTypes';

/**
 * Response Helper Functions
 * Provides consistent response creation utilities
 */

/**
 * Creates a success response with data
 */
export const createSuccessDataResponse = <T>(data: T): SuccessDataResponse<T> => ({
  success: true,
  data,
});

/**
 * Creates a success response with message
 */
export const createSuccessMessageResponse = (message: string): SuccessMessageResponse => ({
  success: true,
  message,
});

/**
 * Creates an error response
 */
export const createErrorResponse = (
  error: string,
  code?: string,
  details?: any
): ErrorResponse => ({
  success: false,
  error,
  ...(code && { code }),
  ...(details && { details }),
});

/**
 * Sends a success response with data
 */
export const sendSuccessData = <T>(
  res: Response,
  data: T,
  statusCode: number = 200
): void => {
  res.status(statusCode).json(createSuccessDataResponse(data));
};

/**
 * Sends a success response with message
 */
export const sendSuccessMessage = (
  res: Response,
  message: string,
  statusCode: number = 200
): void => {
  res.status(statusCode).json(createSuccessMessageResponse(message));
};

/**
 * Sends an error response
 */
export const sendErrorResponse = (
  res: Response,
  error: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): void => {
  res.status(statusCode).json(createErrorResponse(error, code, details));
};

/**
 * Response helper class for chainable response creation
 */
export class ResponseHelper {
  constructor(private res: Response) {}

  /**
   * Send success response with data
   */
  successData<T>(data: T, statusCode: number = 200): void {
    sendSuccessData(this.res, data, statusCode);
  }

  /**
   * Send success response with message
   */
  successMessage(message: string, statusCode: number = 200): void {
    sendSuccessMessage(this.res, message, statusCode);
  }

  /**
   * Send error response
   */
  error(error: string, statusCode: number = 500, code?: string, details?: any): void {
    sendErrorResponse(this.res, error, statusCode, code, details);
  }
}

/**
 * Creates a response helper instance
 */
export const createResponseHelper = (res: Response): ResponseHelper => 
  new ResponseHelper(res);