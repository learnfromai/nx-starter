import 'reflect-metadata';

/**
 * Metadata keys for storing decorator information
 */
export const METADATA_KEYS = {
  CONTROLLER: 'controller',
  ROUTE: 'route',
  HTTP_METHOD: 'httpMethod',
  PARAMETERS: 'parameters',
  VALIDATION: 'validation',
  RESPONSE: 'response',
} as const;

/**
 * HTTP methods supported by decorators
 */
export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch',
  HEAD = 'head',
  OPTIONS = 'options',
}

/**
 * Parameter types for parameter decorators
 */
export enum ParameterType {
  BODY = 'body',
  PARAM = 'param',
  QUERY = 'query',
  HEADERS = 'headers',
  REQUEST = 'request',
  RESPONSE = 'response',
}

/**
 * Route metadata interface
 */
export interface RouteMetadata {
  path: string;
  method: HttpMethod;
  methodName: string;
  target: any;
  parameters?: ParameterMetadata[];
  validation?: ValidationMetadata;
  response?: ResponseMetadata;
}

/**
 * Parameter metadata interface
 */
export interface ParameterMetadata {
  index: number;
  type: ParameterType;
  key?: string;
  required?: boolean;
  transform?: (value: any) => any;
}

/**
 * Validation metadata interface
 */
export interface ValidationMetadata {
  schema: any;
  target: any;
  propertyName: string;
}

/**
 * Response metadata interface
 */
export interface ResponseMetadata {
  statusCode: number;
  description?: string;
  schema?: any;
}

/**
 * Controller metadata interface
 */
export interface ControllerMetadata {
  path: string;
  target: any;
  routes: RouteMetadata[];
}

/**
 * Metadata storage for managing decorator metadata
 */
export class MetadataStorage {
  private static instance: MetadataStorage;
  private controllers: Map<any, ControllerMetadata> = new Map();
  private routes: Map<any, RouteMetadata[]> = new Map();

  static getInstance(): MetadataStorage {
    if (!MetadataStorage.instance) {
      MetadataStorage.instance = new MetadataStorage();
    }
    return MetadataStorage.instance;
  }

  /**
   * Store controller metadata
   */
  setControllerMetadata(target: any, metadata: ControllerMetadata): void {
    this.controllers.set(target, metadata);
  }

  /**
   * Get controller metadata
   */
  getControllerMetadata(target: any): ControllerMetadata | undefined {
    return this.controllers.get(target);
  }

  /**
   * Store route metadata
   */
  setRouteMetadata(target: any, methodName: string, metadata: RouteMetadata): void {
    if (!this.routes.has(target)) {
      this.routes.set(target, []);
    }
    const routes = this.routes.get(target)!;
    const existingIndex = routes.findIndex(r => r.methodName === methodName);
    
    if (existingIndex >= 0) {
      routes[existingIndex] = metadata;
    } else {
      routes.push(metadata);
    }
  }

  /**
   * Get route metadata for a target
   */
  getRouteMetadata(target: any): RouteMetadata[] {
    return this.routes.get(target) || [];
  }

  /**
   * Get all controllers
   */
  getAllControllers(): ControllerMetadata[] {
    return Array.from(this.controllers.values());
  }

  /**
   * Clear all metadata (useful for testing)
   */
  clear(): void {
    this.controllers.clear();
    this.routes.clear();
  }
}