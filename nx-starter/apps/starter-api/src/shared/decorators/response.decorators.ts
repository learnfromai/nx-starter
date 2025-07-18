import 'reflect-metadata';
import { ResponseMetadata, METADATA_KEYS } from './metadata.storage';

/**
 * Response decorator - defines the response structure for a method
 * @param statusCode - HTTP status code
 * @param description - Optional description
 * @param schema - Optional response schema
 */
export function ApiResponse(statusCode: number, description?: string, schema?: any): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const metadata: ResponseMetadata = {
      statusCode,
      description,
      schema,
    };
    
    Reflect.defineMetadata(METADATA_KEYS.RESPONSE, metadata, target, propertyKey);
  };
}

/**
 * Success response decorator - 200 OK
 * @param description - Optional description
 * @param schema - Optional response schema
 */
export function ApiOkResponse(description?: string, schema?: any): MethodDecorator {
  return ApiResponse(200, description, schema);
}

/**
 * Created response decorator - 201 Created
 * @param description - Optional description
 * @param schema - Optional response schema
 */
export function ApiCreatedResponse(description?: string, schema?: any): MethodDecorator {
  return ApiResponse(201, description, schema);
}

/**
 * Bad request response decorator - 400 Bad Request
 * @param description - Optional description
 * @param schema - Optional response schema
 */
export function ApiBadRequestResponse(description?: string, schema?: any): MethodDecorator {
  return ApiResponse(400, description, schema);
}

/**
 * Not found response decorator - 404 Not Found
 * @param description - Optional description
 * @param schema - Optional response schema
 */
export function ApiNotFoundResponse(description?: string, schema?: any): MethodDecorator {
  return ApiResponse(404, description, schema);
}

/**
 * Internal server error response decorator - 500 Internal Server Error
 * @param description - Optional description
 * @param schema - Optional response schema
 */
export function ApiInternalServerErrorResponse(description?: string, schema?: any): MethodDecorator {
  return ApiResponse(500, description, schema);
}