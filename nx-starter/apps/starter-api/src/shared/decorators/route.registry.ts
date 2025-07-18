import { Router, Request, Response } from 'express';
import { MetadataStorage, RouteMetadata, ParameterType, ParameterMetadata } from './metadata.storage';
import { asyncHandler } from '../middleware/ErrorHandler';

/**
 * Route registry that creates Express routes from decorator metadata
 */
export class RouteRegistry {
  private metadataStorage: MetadataStorage;

  constructor() {
    this.metadataStorage = MetadataStorage.getInstance();
  }

  /**
   * Create Express router from controller metadata
   * @param controllerInstance - Instance of the controller class
   * @returns Express router with registered routes
   */
  createRoutes(controllerInstance: any): Router {
    const router = Router();
    const controllerMetadata = this.metadataStorage.getControllerMetadata(controllerInstance.constructor);
    
    if (!controllerMetadata) {
      throw new Error(`Controller metadata not found for ${controllerInstance.constructor.name}`);
    }

    const routes = this.metadataStorage.getRouteMetadata(controllerInstance.constructor);

    routes.forEach(route => {
      const { path, method, methodName, parameters = [] } = route;
      const fullPath = this.combinePaths(controllerMetadata.path, path);
      
      // Create route handler
      const handler = asyncHandler(async (req: Request, res: Response) => {
        // Extract parameters for method call
        const args = this.extractParameters(req, res, parameters);
        
        // Validate if validation metadata exists
        if (route.validation) {
          this.validateRequest(req, route.validation.schema);
        }
        
        // Call the controller method
        const result = await controllerInstance[methodName](...args);
        
        // If method doesn't handle response itself, send the result
        if (result !== undefined && !res.headersSent) {
          const statusCode = route.response?.statusCode || (method === 'post' ? 201 : 200);
          res.status(statusCode).json({
            success: true,
            data: result,
          });
        }
      });

      // Register the route
      switch (method) {
        case 'get':
          router.get(fullPath, handler);
          break;
        case 'post':
          router.post(fullPath, handler);
          break;
        case 'put':
          router.put(fullPath, handler);
          break;
        case 'delete':
          router.delete(fullPath, handler);
          break;
        case 'patch':
          router.patch(fullPath, handler);
          break;
        case 'head':
          router.head(fullPath, handler);
          break;
        case 'options':
          router.options(fullPath, handler);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
    });

    return router;
  }

  /**
   * Extract parameters from request based on parameter metadata
   * @param req - Express request object
   * @param res - Express response object
   * @param parameters - Parameter metadata array
   * @returns Array of extracted parameters
   */
  private extractParameters(req: Request, res: Response, parameters: ParameterMetadata[]): any[] {
    const args: any[] = [];
    
    // Sort parameters by index to maintain order
    const sortedParameters = parameters.sort((a, b) => a.index - b.index);
    
    sortedParameters.forEach(param => {
      let value: any;
      
      switch (param.type) {
        case ParameterType.BODY:
          value = param.key ? req.body[param.key] : req.body;
          break;
        case ParameterType.PARAM:
          value = param.key ? req.params[param.key] : req.params;
          break;
        case ParameterType.QUERY:
          value = param.key ? req.query[param.key] : req.query;
          break;
        case ParameterType.HEADERS:
          value = param.key ? req.headers[param.key] : req.headers;
          break;
        case ParameterType.REQUEST:
          value = req;
          break;
        case ParameterType.RESPONSE:
          value = res;
          break;
        default:
          value = undefined;
      }
      
      // Apply transformation if provided
      if (param.transform) {
        value = param.transform(value);
      }
      
      args[param.index] = value;
    });
    
    return args;
  }

  /**
   * Validate request using provided schema
   * @param req - Express request object
   * @param schema - Validation schema
   */
  private validateRequest(req: Request, schema: any): void {
    if (schema && schema.parse) {
      // Zod schema validation
      schema.parse(req.body);
    } else if (schema && typeof schema.validate === 'function') {
      // Joi schema validation
      const { error } = schema.validate(req.body);
      if (error) {
        throw error;
      }
    }
  }

  /**
   * Combine controller path and route path
   * @param controllerPath - Controller base path
   * @param routePath - Route specific path
   * @returns Combined path
   */
  private combinePaths(controllerPath: string, routePath: string): string {
    const controller = controllerPath.replace(/^\/+|\/+$/g, '');
    const route = routePath.replace(/^\/+|\/+$/g, '');
    
    const combined = [controller, route].filter(Boolean).join('/');
    return combined ? `/${combined}` : '/';
  }
}