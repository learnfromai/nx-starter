import 'reflect-metadata';
import { ValidationMetadata, METADATA_KEYS } from './metadata.storage';

/**
 * Validation decorator - applies validation schema to method parameters
 * @param schema - Validation schema (e.g., Zod schema)
 */
export function Validate(schema: any): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const metadata: ValidationMetadata = {
      schema,
      target,
      propertyName: String(propertyKey),
    };
    
    Reflect.defineMetadata(METADATA_KEYS.VALIDATION, metadata, target, propertyKey);
  };
}

/**
 * ValidateBody decorator - validates request body with provided schema
 * @param schema - Validation schema for request body
 */
export function ValidateBody(schema: any): MethodDecorator {
  return Validate(schema);
}

/**
 * ValidateParams decorator - validates route parameters with provided schema
 * @param schema - Validation schema for route parameters
 */
export function ValidateParams(schema: any): MethodDecorator {
  return Validate(schema);
}

/**
 * ValidateQuery decorator - validates query parameters with provided schema
 * @param schema - Validation schema for query parameters
 */
export function ValidateQuery(schema: any): MethodDecorator {
  return Validate(schema);
}