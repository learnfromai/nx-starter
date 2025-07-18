import 'reflect-metadata';
import { MetadataStorage, HttpMethod } from '../metadata.storage';
import { Controller } from '../controller.decorator';
import { Get, Post, Put, Delete, Patch } from '../http-method.decorators';
import { Body, Param, Query } from '../parameter.decorators';
import { ApiOkResponse, ApiCreatedResponse } from '../response.decorators';
import { ValidateBody } from '../validation.decorators';

describe('Decorator System', () => {
  let metadataStorage: MetadataStorage;

  beforeEach(() => {
    metadataStorage = MetadataStorage.getInstance();
    metadataStorage.clear();
  });

  describe('Controller Decorator', () => {
    it('should register controller metadata', () => {
      @Controller('/api/test')
      class TestController {}

      const metadata = metadataStorage.getControllerMetadata(TestController);
      expect(metadata).toBeDefined();
      expect(metadata?.path).toBe('/api/test');
      expect(metadata?.target).toBe(TestController);
    });

    it('should work with empty path', () => {
      @Controller()
      class TestController {}

      const metadata = metadataStorage.getControllerMetadata(TestController);
      expect(metadata).toBeDefined();
      expect(metadata?.path).toBe('');
    });
  });

  describe('HTTP Method Decorators', () => {
    it('should register GET method metadata', () => {
      @Controller('/api/test')
      class TestController {
        @Get('/items')
        getItems() {}
      }

      const routes = metadataStorage.getRouteMetadata(TestController);
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe(HttpMethod.GET);
      expect(routes[0].path).toBe('/items');
      expect(routes[0].methodName).toBe('getItems');
    });

    it('should register POST method metadata', () => {
      @Controller('/api/test')
      class TestController {
        @Post('/items')
        createItem() {}
      }

      const routes = metadataStorage.getRouteMetadata(TestController);
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe(HttpMethod.POST);
      expect(routes[0].path).toBe('/items');
    });

    it('should register multiple methods', () => {
      @Controller('/api/test')
      class TestController {
        @Get('/items')
        getItems() {}

        @Post('/items')
        createItem() {}

        @Put('/items/:id')
        updateItem() {}

        @Delete('/items/:id')
        deleteItem() {}

        @Patch('/items/:id')
        patchItem() {}
      }

      const routes = metadataStorage.getRouteMetadata(TestController);
      expect(routes).toHaveLength(5);
      
      const methods = routes.map(r => r.method);
      expect(methods).toContain(HttpMethod.GET);
      expect(methods).toContain(HttpMethod.POST);
      expect(methods).toContain(HttpMethod.PUT);
      expect(methods).toContain(HttpMethod.DELETE);
      expect(methods).toContain(HttpMethod.PATCH);
    });
  });

  describe('Parameter Decorators', () => {
    it('should register parameter metadata', () => {
      @Controller('/api/test')
      class TestController {
        @Post('/items')
        createItem(@Body() body: any, @Param('id') id: string) {}
      }

      const routes = metadataStorage.getRouteMetadata(TestController);
      expect(routes).toHaveLength(1);
      
      const parameters = routes[0].parameters;
      expect(parameters).toHaveLength(2);
      
      const bodyParam = parameters?.find(p => p.type === 'body');
      expect(bodyParam).toBeDefined();
      expect(bodyParam?.index).toBe(0);
      
      const paramParam = parameters?.find(p => p.type === 'param');
      expect(paramParam).toBeDefined();
      expect(paramParam?.index).toBe(1);
      expect(paramParam?.key).toBe('id');
    });

    it('should handle query parameters', () => {
      @Controller('/api/test')
      class TestController {
        @Get('/items')
        getItems(@Query('limit') limit: string, @Query() query: any) {}
      }

      const routes = metadataStorage.getRouteMetadata(TestController);
      const parameters = routes[0].parameters;
      
      expect(parameters).toHaveLength(2);
      
      const limitParam = parameters?.find(p => p.key === 'limit');
      expect(limitParam).toBeDefined();
      expect(limitParam?.type).toBe('query');
      
      const queryParam = parameters?.find(p => p.key === undefined && p.type === 'query');
      expect(queryParam).toBeDefined();
    });
  });

  describe('Response Decorators', () => {
    it('should register response metadata', () => {
      @Controller('/api/test')
      class TestController {
        @Get('/items')
        @ApiOkResponse('Returns items')
        getItems() {}

        @Post('/items')
        @ApiCreatedResponse('Item created')
        createItem() {}
      }

      const routes = metadataStorage.getRouteMetadata(TestController);
      expect(routes).toHaveLength(2);
      
      const getRoute = routes.find(r => r.method === HttpMethod.GET);
      expect(getRoute?.response?.statusCode).toBe(200);
      expect(getRoute?.response?.description).toBe('Returns items');
      
      const postRoute = routes.find(r => r.method === HttpMethod.POST);
      expect(postRoute?.response?.statusCode).toBe(201);
      expect(postRoute?.response?.description).toBe('Item created');
    });
  });

  describe('Validation Decorators', () => {
    it('should register validation metadata', () => {
      const mockSchema = { parse: jest.fn() };
      
      @Controller('/api/test')
      class TestController {
        @Post('/items')
        @ValidateBody(mockSchema)
        createItem() {}
      }

      const routes = metadataStorage.getRouteMetadata(TestController);
      expect(routes).toHaveLength(1);
      
      const validation = routes[0].validation;
      expect(validation).toBeDefined();
      expect(validation?.schema).toBe(mockSchema);
    });
  });

  describe('Integration', () => {
    it('should work with complex controller setup', () => {
      const mockSchema = { parse: jest.fn() };
      
      @Controller('/api/todos')
      class TodoController {
        @Get()
        @ApiOkResponse('Returns all todos')
        getAllTodos() {}

        @Get('/:id')
        @ApiOkResponse('Returns todo by ID')
        getTodoById(@Param('id') id: string) {}

        @Post()
        @ApiCreatedResponse('Todo created')
        @ValidateBody(mockSchema)
        createTodo(@Body() body: any) {}

        @Put('/:id')
        @ApiOkResponse('Todo updated')
        updateTodo(@Param('id') id: string, @Body() body: any) {}

        @Delete('/:id')
        @ApiOkResponse('Todo deleted')
        deleteTodo(@Param('id') id: string) {}
      }

      const controllerMetadata = metadataStorage.getControllerMetadata(TodoController);
      expect(controllerMetadata?.path).toBe('/api/todos');
      
      const routes = metadataStorage.getRouteMetadata(TodoController);
      expect(routes).toHaveLength(5);
      
      // Check GET all todos
      const getAllRoute = routes.find(r => r.methodName === 'getAllTodos');
      expect(getAllRoute?.method).toBe(HttpMethod.GET);
      expect(getAllRoute?.path).toBe('');
      
      // Check GET by ID
      const getByIdRoute = routes.find(r => r.methodName === 'getTodoById');
      expect(getByIdRoute?.method).toBe(HttpMethod.GET);
      expect(getByIdRoute?.path).toBe('/:id');
      expect(getByIdRoute?.parameters).toHaveLength(1);
      
      // Check POST
      const createRoute = routes.find(r => r.methodName === 'createTodo');
      expect(createRoute?.method).toBe(HttpMethod.POST);
      expect(createRoute?.validation?.schema).toBe(mockSchema);
      expect(createRoute?.parameters).toHaveLength(1);
      
      // Check PUT
      const updateRoute = routes.find(r => r.methodName === 'updateTodo');
      expect(updateRoute?.method).toBe(HttpMethod.PUT);
      expect(updateRoute?.parameters).toHaveLength(2);
      
      // Check DELETE
      const deleteRoute = routes.find(r => r.methodName === 'deleteTodo');
      expect(deleteRoute?.method).toBe(HttpMethod.DELETE);
      expect(deleteRoute?.parameters).toHaveLength(1);
    });
  });
});