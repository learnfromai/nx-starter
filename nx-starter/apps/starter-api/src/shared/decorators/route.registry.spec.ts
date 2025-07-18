import 'reflect-metadata';
import { Request, Response } from 'express';
import { RouteRegistry } from '../route.registry';
import { MetadataStorage } from '../metadata.storage';
import { Controller } from '../controller.decorator';
import { Get, Post, Put, Delete } from '../http-method.decorators';
import { Body, Param, Query } from '../parameter.decorators';
import { ApiOkResponse, ApiCreatedResponse } from '../response.decorators';
import { ValidateBody } from '../validation.decorators';

describe('RouteRegistry', () => {
  let routeRegistry: RouteRegistry;
  let metadataStorage: MetadataStorage;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    metadataStorage = MetadataStorage.getInstance();
    metadataStorage.clear();
    routeRegistry = new RouteRegistry();

    mockRequest = {
      body: {},
      params: {},
      query: {},
      headers: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      headersSent: false,
    };
  });

  describe('createRoutes', () => {
    it('should create routes from controller metadata', () => {
      @Controller('/api/test')
      class TestController {
        @Get('/items')
        @ApiOkResponse('Returns items')
        getItems() {
          return { items: [] };
        }

        @Post('/items')
        @ApiCreatedResponse('Item created')
        createItem(@Body() body: any) {
          return { created: true };
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);

      expect(router).toBeDefined();
      expect(router.stack).toHaveLength(2);
    });

    it('should throw error if controller metadata not found', () => {
      class TestController {
        getItems() {
          return { items: [] };
        }
      }

      const controller = new TestController();
      
      expect(() => {
        routeRegistry.createRoutes(controller);
      }).toThrow('Controller metadata not found for TestController');
    });

    it('should handle controller without base path', () => {
      @Controller()
      class TestController {
        @Get('/items')
        getItems() {
          return { items: [] };
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);

      expect(router).toBeDefined();
      expect(router.stack).toHaveLength(1);
    });

    it('should handle route without specific path', () => {
      @Controller('/api/test')
      class TestController {
        @Get()
        getItems() {
          return { items: [] };
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);

      expect(router).toBeDefined();
      expect(router.stack).toHaveLength(1);
    });
  });

  describe('parameter extraction', () => {
    it('should extract body parameters', async () => {
      let capturedBody: any;

      @Controller('/api/test')
      class TestController {
        @Post('/items')
        createItem(@Body() body: any) {
          capturedBody = body;
          return { created: true };
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);

      mockRequest.body = { name: 'test item' };
      
      // Simulate route execution
      const route = router.stack[0];
      const handler = route.route.stack[0].handle;
      
      await handler(mockRequest as Request, mockResponse as Response, jest.fn());

      expect(capturedBody).toEqual({ name: 'test item' });
    });

    it('should extract route parameters', async () => {
      let capturedId: string;

      @Controller('/api/test')
      class TestController {
        @Get('/items/:id')
        getItem(@Param('id') id: string) {
          capturedId = id;
          return { item: { id } };
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);

      mockRequest.params = { id: '123' };
      
      const route = router.stack[0];
      const handler = route.route.stack[0].handle;
      
      await handler(mockRequest as Request, mockResponse as Response, jest.fn());

      expect(capturedId).toBe('123');
    });

    it('should extract query parameters', async () => {
      let capturedLimit: string;
      let capturedQuery: any;

      @Controller('/api/test')
      class TestController {
        @Get('/items')
        getItems(@Query('limit') limit: string, @Query() query: any) {
          capturedLimit = limit;
          capturedQuery = query;
          return { items: [] };
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);

      mockRequest.query = { limit: '10', offset: '0' };
      
      const route = router.stack[0];
      const handler = route.route.stack[0].handle;
      
      await handler(mockRequest as Request, mockResponse as Response, jest.fn());

      expect(capturedLimit).toBe('10');
      expect(capturedQuery).toEqual({ limit: '10', offset: '0' });
    });

    it('should handle multiple parameter types', async () => {
      let capturedParams: any[] = [];

      @Controller('/api/test')
      class TestController {
        @Put('/items/:id')
        updateItem(@Param('id') id: string, @Body() body: any, @Query('version') version: string) {
          capturedParams = [id, body, version];
          return { updated: true };
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);

      mockRequest.params = { id: '123' };
      mockRequest.body = { name: 'updated item' };
      mockRequest.query = { version: '2' };
      
      const route = router.stack[0];
      const handler = route.route.stack[0].handle;
      
      await handler(mockRequest as Request, mockResponse as Response, jest.fn());

      expect(capturedParams).toEqual([
        '123',
        { name: 'updated item' },
        '2'
      ]);
    });
  });

  describe('response handling', () => {
    it('should send response with default status code', async () => {
      @Controller('/api/test')
      class TestController {
        @Get('/items')
        getItems() {
          return { items: [] };
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);
      
      const route = router.stack[0];
      const handler = route.route.stack[0].handle;
      
      await handler(mockRequest as Request, mockResponse as Response, jest.fn());

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { items: [] },
      });
    });

    it('should send response with custom status code from response decorator', async () => {
      @Controller('/api/test')
      class TestController {
        @Post('/items')
        @ApiCreatedResponse('Item created')
        createItem() {
          return { created: true };
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);
      
      const route = router.stack[0];
      const handler = route.route.stack[0].handle;
      
      await handler(mockRequest as Request, mockResponse as Response, jest.fn());

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { created: true },
      });
    });

    it('should not send response if method handles it', async () => {
      @Controller('/api/test')
      class TestController {
        @Get('/items')
        getItems() {
          // Method returns undefined, indicating it handles response itself
          return undefined;
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);
      
      const route = router.stack[0];
      const handler = route.route.stack[0].handle;
      
      await handler(mockRequest as Request, mockResponse as Response, jest.fn());

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should validate request with Zod schema', async () => {
      const mockSchema = {
        parse: jest.fn().mockReturnValue({ name: 'test' }),
      };

      @Controller('/api/test')
      class TestController {
        @Post('/items')
        @ValidateBody(mockSchema)
        createItem(@Body() body: any) {
          return { created: true };
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);

      mockRequest.body = { name: 'test' };
      
      const route = router.stack[0];
      const handler = route.route.stack[0].handle;
      
      await handler(mockRequest as Request, mockResponse as Response, jest.fn());

      expect(mockSchema.parse).toHaveBeenCalledWith({ name: 'test' });
    });

    it('should handle validation errors', async () => {
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Validation failed');
        }),
      };

      @Controller('/api/test')
      class TestController {
        @Post('/items')
        @ValidateBody(mockSchema)
        createItem(@Body() body: any) {
          return { created: true };
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);

      mockRequest.body = { invalid: 'data' };
      
      const route = router.stack[0];
      const handler = route.route.stack[0].handle;
      
      // Should throw error, which would be caught by asyncHandler
      await expect(handler(mockRequest as Request, mockResponse as Response, jest.fn()))
        .rejects.toThrow('Validation failed');
    });
  });

  describe('path combination', () => {
    it('should combine controller and route paths correctly', () => {
      @Controller('/api/v1')
      class TestController {
        @Get('/items')
        getItems() {
          return { items: [] };
        }

        @Post('/items')
        createItem() {
          return { created: true };
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);

      expect(router.stack).toHaveLength(2);
      
      // Check that paths are combined correctly
      const getRoute = router.stack.find(layer => layer.route.methods.get);
      const postRoute = router.stack.find(layer => layer.route.methods.post);
      
      expect(getRoute?.route.path).toBe('/api/v1/items');
      expect(postRoute?.route.path).toBe('/api/v1/items');
    });

    it('should handle empty controller path', () => {
      @Controller()
      class TestController {
        @Get('/items')
        getItems() {
          return { items: [] };
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);

      const route = router.stack[0];
      expect(route.route.path).toBe('/items');
    });

    it('should handle empty route path', () => {
      @Controller('/api/test')
      class TestController {
        @Get()
        getItems() {
          return { items: [] };
        }
      }

      const controller = new TestController();
      const router = routeRegistry.createRoutes(controller);

      const route = router.stack[0];
      expect(route.route.path).toBe('/api/test');
    });
  });
});