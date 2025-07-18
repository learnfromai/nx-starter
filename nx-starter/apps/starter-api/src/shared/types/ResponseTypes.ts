/**
 * Response Types for API Standardization
 * Provides consistent response structure across all API endpoints
 */

/**
 * Base API response structure
 */
export interface BaseApiResponse {
  success: boolean;
}

/**
 * Success response with data
 */
export interface SuccessDataResponse<T = any> extends BaseApiResponse {
  success: true;
  data: T;
}

/**
 * Success response with message
 */
export interface SuccessMessageResponse extends BaseApiResponse {
  success: true;
  message: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse extends BaseApiResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

/**
 * Union type for all possible API responses
 */
export type ApiResponse<T = any> = SuccessDataResponse<T> | SuccessMessageResponse | ErrorResponse;

/**
 * Response creator function type
 */
export type ResponseCreator<T = any> = () => ApiResponse<T>;