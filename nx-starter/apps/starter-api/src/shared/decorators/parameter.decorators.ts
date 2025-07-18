import 'reflect-metadata';
import { ParameterMetadata, ParameterType, METADATA_KEYS } from './metadata.storage';

/**
 * Creates a parameter decorator
 * @param type - Parameter type
 * @param key - Optional key for extracting specific property
 */
function createParameterDecorator(type: ParameterType, key?: string): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    if (!propertyKey) return;
    
    const existingParameters: ParameterMetadata[] = 
      Reflect.getMetadata(METADATA_KEYS.PARAMETERS, target, propertyKey) || [];
    
    const parameterMetadata: ParameterMetadata = {
      index: parameterIndex,
      type,
      key,
    };
    
    existingParameters.push(parameterMetadata);
    
    Reflect.defineMetadata(METADATA_KEYS.PARAMETERS, existingParameters, target, propertyKey);
  };
}

/**
 * Body parameter decorator - extracts request body
 * @param key - Optional key to extract specific property from body
 */
export function Body(key?: string): ParameterDecorator {
  return createParameterDecorator(ParameterType.BODY, key);
}

/**
 * Param parameter decorator - extracts route parameters
 * @param key - Parameter name (e.g., 'id' for route '/users/:id')
 */
export function Param(key?: string): ParameterDecorator {
  return createParameterDecorator(ParameterType.PARAM, key);
}

/**
 * Query parameter decorator - extracts query parameters
 * @param key - Query parameter name
 */
export function Query(key?: string): ParameterDecorator {
  return createParameterDecorator(ParameterType.QUERY, key);
}

/**
 * Headers parameter decorator - extracts request headers
 * @param key - Header name
 */
export function Headers(key?: string): ParameterDecorator {
  return createParameterDecorator(ParameterType.HEADERS, key);
}

/**
 * Request parameter decorator - injects the entire request object
 */
export function Req(): ParameterDecorator {
  return createParameterDecorator(ParameterType.REQUEST);
}

/**
 * Response parameter decorator - injects the response object
 */
export function Res(): ParameterDecorator {
  return createParameterDecorator(ParameterType.RESPONSE);
}