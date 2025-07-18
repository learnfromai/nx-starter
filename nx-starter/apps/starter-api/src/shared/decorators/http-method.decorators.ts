import 'reflect-metadata';
import { MetadataStorage, RouteMetadata, HttpMethod, METADATA_KEYS } from './metadata.storage';

/**
 * Creates an HTTP method decorator
 * @param method - HTTP method type
 * @param path - Route path (optional)
 */
function createHttpMethodDecorator(method: HttpMethod, path: string = ''): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const methodName = String(propertyKey);
    
    // Get existing route metadata or create new
    const existingRoute = Reflect.getMetadata(METADATA_KEYS.ROUTE, target, propertyKey) || {};
    const routePath = existingRoute.path || path;
    
    const metadata: RouteMetadata = {
      path: routePath,
      method,
      methodName,
      target: target.constructor,
      parameters: Reflect.getMetadata(METADATA_KEYS.PARAMETERS, target, propertyKey) || [],
      validation: Reflect.getMetadata(METADATA_KEYS.VALIDATION, target, propertyKey),
      response: Reflect.getMetadata(METADATA_KEYS.RESPONSE, target, propertyKey),
    };
    
    MetadataStorage.getInstance().setRouteMetadata(target.constructor, methodName, metadata);
    
    // Also store in reflect metadata for compatibility
    Reflect.defineMetadata(METADATA_KEYS.HTTP_METHOD, { method, path: routePath }, target, propertyKey);
  };
}

/**
 * GET method decorator
 * @param path - Route path (optional)
 */
export function Get(path: string = ''): MethodDecorator {
  return createHttpMethodDecorator(HttpMethod.GET, path);
}

/**
 * POST method decorator
 * @param path - Route path (optional)
 */
export function Post(path: string = ''): MethodDecorator {
  return createHttpMethodDecorator(HttpMethod.POST, path);
}

/**
 * PUT method decorator
 * @param path - Route path (optional)
 */
export function Put(path: string = ''): MethodDecorator {
  return createHttpMethodDecorator(HttpMethod.PUT, path);
}

/**
 * DELETE method decorator
 * @param path - Route path (optional)
 */
export function Delete(path: string = ''): MethodDecorator {
  return createHttpMethodDecorator(HttpMethod.DELETE, path);
}

/**
 * PATCH method decorator
 * @param path - Route path (optional)
 */
export function Patch(path: string = ''): MethodDecorator {
  return createHttpMethodDecorator(HttpMethod.PATCH, path);
}

/**
 * HEAD method decorator
 * @param path - Route path (optional)
 */
export function Head(path: string = ''): MethodDecorator {
  return createHttpMethodDecorator(HttpMethod.HEAD, path);
}

/**
 * OPTIONS method decorator
 * @param path - Route path (optional)
 */
export function Options(path: string = ''): MethodDecorator {
  return createHttpMethodDecorator(HttpMethod.OPTIONS, path);
}