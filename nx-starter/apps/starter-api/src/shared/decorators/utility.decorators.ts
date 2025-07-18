import 'reflect-metadata';
import { METADATA_KEYS } from './metadata.storage';

/**
 * Middleware decorator - applies middleware to a specific route
 * @param middleware - Express middleware function(s)
 */
export function UseMiddleware(...middleware: any[]): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const existingMiddleware = Reflect.getMetadata(METADATA_KEYS.MIDDLEWARE, target, propertyKey) || [];
    const allMiddleware = [...existingMiddleware, ...middleware];
    
    Reflect.defineMetadata(METADATA_KEYS.MIDDLEWARE, allMiddleware, target, propertyKey);
  };
}

/**
 * Authorization decorator - requires specific roles or permissions
 * @param roles - Required roles or permissions
 */
export function Authorize(...roles: string[]): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(METADATA_KEYS.AUTHORIZATION, { roles }, target, propertyKey);
  };
}

/**
 * Cache decorator - enables caching for the route
 * @param ttl - Time to live in seconds
 * @param key - Optional cache key strategy
 */
export function Cache(ttl: number, key?: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(METADATA_KEYS.CACHE, { ttl, key }, target, propertyKey);
  };
}

/**
 * Rate limit decorator - applies rate limiting to the route
 * @param max - Maximum number of requests
 * @param windowMs - Time window in milliseconds
 */
export function RateLimit(max: number, windowMs: number): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(METADATA_KEYS.RATE_LIMIT, { max, windowMs }, target, propertyKey);
  };
}

/**
 * Transform decorator - applies data transformation to response
 * @param transformer - Transformation function
 */
export function Transform(transformer: (data: any) => any): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(METADATA_KEYS.TRANSFORM, { transformer }, target, propertyKey);
  };
}

/**
 * Timeout decorator - sets timeout for the route
 * @param timeout - Timeout in milliseconds
 */
export function Timeout(timeout: number): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(METADATA_KEYS.TIMEOUT, { timeout }, target, propertyKey);
  };
}

/**
 * Deprecated decorator - marks a route as deprecated
 * @param message - Deprecation message
 * @param version - Version when it will be removed
 */
export function Deprecated(message?: string, version?: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(METADATA_KEYS.DEPRECATED, { message, version }, target, propertyKey);
  };
}

/**
 * ApiTags decorator - adds tags to the route for documentation
 * @param tags - Tags for the route
 */
export function ApiTags(...tags: string[]): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(METADATA_KEYS.API_TAGS, { tags }, target, propertyKey);
  };
}

/**
 * Version decorator - specifies API version for the route
 * @param version - API version
 */
export function Version(version: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(METADATA_KEYS.VERSION, { version }, target, propertyKey);
  };
}

/**
 * Summary decorator - adds summary description for API documentation
 * @param summary - Summary description
 */
export function Summary(summary: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(METADATA_KEYS.SUMMARY, { summary }, target, propertyKey);
  };
}