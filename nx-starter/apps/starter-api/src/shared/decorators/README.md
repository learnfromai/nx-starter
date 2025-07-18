# Decorator-Based Controller Patterns

This document describes the decorator-based controller patterns implemented in the starter-api application. The decorator system provides a more declarative and modern approach to defining API endpoints while maintaining Clean Architecture principles.

## Overview

The decorator system allows you to define controllers using TypeScript decorators instead of manually binding routes. This approach provides:

- **Declarative API definition**: Clear and concise route definitions
- **Automatic route registration**: Routes are registered automatically based on decorators
- **Parameter extraction**: Automatic extraction of request parameters
- **Validation integration**: Built-in validation support
- **Response standardization**: Consistent API response format
- **Clean Architecture compliance**: Maintains separation of concerns

## Core Decorators

### Class Decorators

#### `@Controller(path?: string)`
Marks a class as a controller and optionally defines the base path for all routes in the controller.

```typescript
@Controller('/api/todos')
export class TodoController {
  // All routes will be prefixed with /api/todos
}
```

### Method Decorators

#### HTTP Method Decorators
- `@Get(path?: string)` - Defines a GET endpoint
- `@Post(path?: string)` - Defines a POST endpoint
- `@Put(path?: string)` - Defines a PUT endpoint
- `@Delete(path?: string)` - Defines a DELETE endpoint
- `@Patch(path?: string)` - Defines a PATCH endpoint

```typescript
@Controller('/api/todos')
export class TodoController {
  @Get()
  getAllTodos() {
    // GET /api/todos
  }

  @Get('/:id')
  getTodoById() {
    // GET /api/todos/:id
  }

  @Post()
  createTodo() {
    // POST /api/todos
  }

  @Put('/:id')
  updateTodo() {
    // PUT /api/todos/:id
  }

  @Delete('/:id')
  deleteTodo() {
    // DELETE /api/todos/:id
  }
}
```

### Parameter Decorators

#### `@Body(key?: string)`
Extracts the request body or a specific property from the body.

```typescript
@Post()
createTodo(@Body() todoData: CreateTodoDto) {
  // todoData contains the entire request body
}

@Post()
createTodo(@Body('title') title: string) {
  // title contains only the 'title' property from the request body
}
```

#### `@Param(key?: string)`
Extracts route parameters.

```typescript
@Get('/:id')
getTodoById(@Param('id') id: string) {
  // id contains the 'id' parameter from the route
}

@Get('/:id/comments/:commentId')
getComment(@Param('id') todoId: string, @Param('commentId') commentId: string) {
  // Extract multiple parameters
}
```

#### `@Query(key?: string)`
Extracts query parameters.

```typescript
@Get()
getAllTodos(@Query('limit') limit: string, @Query('offset') offset: string) {
  // Extract specific query parameters
}

@Get()
getAllTodos(@Query() query: any) {
  // Extract all query parameters
}
```

#### `@Headers(key?: string)`
Extracts request headers.

```typescript
@Get()
getAllTodos(@Headers('authorization') auth: string) {
  // Extract specific header
}

@Get()
getAllTodos(@Headers() headers: any) {
  // Extract all headers
}
```

#### `@Req()` and `@Res()`
Inject the Express request and response objects.

```typescript
@Get()
getAllTodos(@Req() req: Request, @Res() res: Response) {
  // Access raw Express objects when needed
}
```

### Validation Decorators

#### `@ValidateBody(schema)`
Validates the request body using a schema (supports Zod, Joi, etc.).

```typescript
@Post()
@ValidateBody(createTodoSchema)
createTodo(@Body() todoData: CreateTodoDto) {
  // Request body is validated before method execution
}
```

#### `@ValidateParams(schema)`
Validates route parameters.

```typescript
@Get('/:id')
@ValidateParams(todoParamsSchema)
getTodoById(@Param('id') id: string) {
  // Route parameters are validated
}
```

#### `@ValidateQuery(schema)`
Validates query parameters.

```typescript
@Get()
@ValidateQuery(todoQuerySchema)
getAllTodos(@Query() query: TodoQueryDto) {
  // Query parameters are validated
}
```

### Response Decorators

#### `@ApiResponse(statusCode, description?, schema?)`
Defines the response structure for documentation and automatic status code setting.

```typescript
@Get()
@ApiResponse(200, 'Returns all todos', TodoDto[])
getAllTodos() {
  // Response will have status 200
}
```

#### Convenience Response Decorators
- `@ApiOkResponse(description?, schema?)` - 200 OK
- `@ApiCreatedResponse(description?, schema?)` - 201 Created
- `@ApiBadRequestResponse(description?, schema?)` - 400 Bad Request
- `@ApiNotFoundResponse(description?, schema?)` - 404 Not Found
- `@ApiInternalServerErrorResponse(description?, schema?)` - 500 Internal Server Error

```typescript
@Get()
@ApiOkResponse('Returns all todos')
getAllTodos() {
  // Response will have status 200
}

@Post()
@ApiCreatedResponse('Todo created successfully')
createTodo() {
  // Response will have status 201
}
```

## Complete Example

Here's a complete example of a controller using all the decorator features:

```typescript
import { injectable, inject } from 'tsyringe';
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body,
  Param,
  Query,
  ApiOkResponse,
  ApiCreatedResponse,
  ValidateBody,
  ValidateParams,
} from '../shared/decorators';

@Controller('/api/todos')
@injectable()
export class TodoController {
  constructor(
    @inject('TodoService') private todoService: TodoService
  ) {}

  @Get()
  @ApiOkResponse('Returns all todos')
  async getAllTodos(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    const todos = await this.todoService.findAll({ limit, offset });
    return todos;
  }

  @Get('/:id')
  @ApiOkResponse('Returns todo by ID')
  @ValidateParams(todoParamsSchema)
  async getTodoById(@Param('id') id: string) {
    const todo = await this.todoService.findById(id);
    return todo;
  }

  @Post()
  @ApiCreatedResponse('Todo created successfully')
  @ValidateBody(createTodoSchema)
  async createTodo(@Body() todoData: CreateTodoDto) {
    const todo = await this.todoService.create(todoData);
    return todo;
  }

  @Put('/:id')
  @ApiOkResponse('Todo updated successfully')
  @ValidateParams(todoParamsSchema)
  @ValidateBody(updateTodoSchema)
  async updateTodo(@Param('id') id: string, @Body() todoData: UpdateTodoDto) {
    await this.todoService.update(id, todoData);
    return { message: 'Todo updated successfully' };
  }

  @Delete('/:id')
  @ApiOkResponse('Todo deleted successfully')
  @ValidateParams(todoParamsSchema)
  async deleteTodo(@Param('id') id: string) {
    await this.todoService.delete(id);
    return { message: 'Todo deleted successfully' };
  }
}
```

## Route Registration

To use the decorator-based controllers, you need to register them using the `RouteRegistry`:

```typescript
import { Router } from 'express';
import { container } from '../infrastructure/di/container';
import { RouteRegistry } from '../shared/decorators';
import { TodoController } from '../controllers/TodoController';

export const createTodoRoutes = (): Router => {
  const routeRegistry = new RouteRegistry();
  const todoController = container.resolve(TodoController);
  
  return routeRegistry.createRoutes(todoController);
};
```

## Integration with Existing Code

The decorator system is designed to work alongside existing controller patterns. You can:

1. **Gradual Migration**: Use both traditional and decorator-based controllers in the same application
2. **Hybrid Approach**: Create routes that combine both patterns
3. **Backward Compatibility**: Existing controllers continue to work without changes

```typescript
// Traditional route setup
router.use('/todos', createTodoRoutes());

// Decorator-based route setup
router.use('/todos-v2', createDecoratorTodoRoutes());
```

## Benefits

1. **Reduced Boilerplate**: No need to manually bind controller methods to routes
2. **Better Documentation**: Decorators serve as inline documentation
3. **Type Safety**: Parameter decorators provide better TypeScript support
4. **Consistency**: Standardized approach to API development
5. **Maintainability**: Easier to understand and modify API endpoints
6. **Testing**: Improved testability with clear separation of concerns

## Migration Guide

To migrate from traditional controllers to decorator-based controllers:

1. **Add decorators to existing controller class**:
   ```typescript
   @Controller('/api/todos')
   export class TodoController {
     // existing methods
   }
   ```

2. **Add method decorators**:
   ```typescript
   @Get()
   getAllTodos() {
     // existing implementation
   }
   ```

3. **Add parameter decorators**:
   ```typescript
   @Get('/:id')
   getTodoById(@Param('id') id: string) {
     // existing implementation
   }
   ```

4. **Update route registration**:
   ```typescript
   const router = routeRegistry.createRoutes(todoController);
   ```

5. **Remove manual route binding**:
   ```typescript
   // Remove this
   router.get('/', bindMethod(todoController.getAllTodos));
   ```

## Best Practices

1. **Keep Controllers Thin**: Controllers should only handle HTTP concerns
2. **Use Dependency Injection**: Inject services through constructor
3. **Validate Input**: Always validate request data
4. **Document Responses**: Use response decorators for clear API documentation
5. **Error Handling**: Let the framework handle errors with proper error types
6. **Testing**: Write tests for both decorator metadata and controller logic

## Limitations and Considerations

1. **Reflection Overhead**: Using decorators adds some runtime overhead
2. **Learning Curve**: Developers need to understand the decorator system
3. **Debugging**: Stack traces might be less clear with decorated methods
4. **IDE Support**: Some IDEs might not fully support decorator-based navigation

The decorator system provides a modern, declarative approach to API development while maintaining the principles of Clean Architecture and ensuring compatibility with existing code.