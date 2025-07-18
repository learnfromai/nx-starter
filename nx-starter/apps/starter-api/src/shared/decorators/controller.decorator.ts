import 'reflect-metadata';
import { MetadataStorage, ControllerMetadata, METADATA_KEYS } from './metadata.storage';

/**
 * Controller decorator - marks a class as a controller and defines its base path
 * @param path - Base path for all routes in this controller
 */
export function Controller(path: string = ''): ClassDecorator {
  return (target: any) => {
    const metadata: ControllerMetadata = {
      path,
      target,
      routes: []
    };
    
    MetadataStorage.getInstance().setControllerMetadata(target, metadata);
    
    // Also store in reflect metadata for compatibility
    Reflect.defineMetadata(METADATA_KEYS.CONTROLLER, { path }, target);
  };
}

/**
 * Route decorator - defines a specific route path for a method
 * @param path - Route path
 */
export function Route(path: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(METADATA_KEYS.ROUTE, { path }, target, propertyKey);
  };
}