# Migration Guide: From Traditional to Decorator-Based Controllers

This guide provides step-by-step instructions for migrating from traditional Express.js controllers to decorator-based controllers.

## Before and After Comparison

### Traditional Controller (Before)

```typescript
// Traditional TodoController
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { asyncHandler } from '../../shared/middleware/ErrorHandler';

@injectable()
export class TodoController {
  constructor(
    @inject(TOKENS.CreateTodoUseCase)
    private createTodoUseCase: CreateTodoUseCase,
    // ... other dependencies
  ) {}

  getAllTodos = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const todos = await this.getAllTodosQueryHandler.execute();
      const todoDtos = TodoMapper.toDtoArray(todos);

      res.json({
        success: true,
        data: todoDtos,
      });
    }
  );

  createTodo = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const validatedData = this.validationSchemas.CreateTodoCommandSchema
        ? this.validationSchemas.CreateTodoCommandSchema.parse(req.body)
        : req.body;
      const todo = await this.createTodoUseCase.execute(validatedData);
      const todoDto = TodoMapper.toDto(todo);

      res.status(201).json({
        success: true,
        data: todoDto,
      });
    }
  );
}
```

### Traditional Route Setup (Before)

```typescript
// Traditional route setup
import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { TodoController } from '../controllers/TodoController';

export const createTodoRoutes = (): Router => {
  const router = Router();
  const todoController = container.resolve(TodoController);

  const bindMethod = (method: Function) => method.bind(todoController);

  router.get('/', bindMethod(todoController.getAllTodos));
  router.post('/', bindMethod(todoController.createTodo));

  return router;
};
```

### Decorator-Based Controller (After)

```typescript
// Decorator-based TodoController
import { injectable, inject } from 'tsyringe';
import { 
  Controller, 
  Get, 
  Post, 
  Body,
  ApiOkResponse,
  ApiCreatedResponse,
  ValidateBody,
} from '../../shared/decorators';

@Controller('/api/todos')
@injectable()
export class TodoController {
  constructor(
    @inject(TOKENS.CreateTodoUseCase)
    private createTodoUseCase: CreateTodoUseCase,
    // ... other dependencies
  ) {}

  @Get()
  @ApiOkResponse('Returns all todos')
  async getAllTodos() {
    const todos = await this.getAllTodosQueryHandler.execute();
    return TodoMapper.toDtoArray(todos);
  }

  @Post()
  @ApiCreatedResponse('Todo created successfully')
  @ValidateBody(this.validationSchemas.CreateTodoCommandSchema)
  async createTodo(@Body() createTodoData: any) {
    const todo = await this.createTodoUseCase.execute(createTodoData);
    return TodoMapper.toDto(todo);
  }
}
```

### Decorator-Based Route Setup (After)

```typescript
// Decorator-based route setup
import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { RouteRegistry } from '../../shared/decorators';
import { TodoController } from '../controllers/TodoController';

export const createTodoRoutes = (): Router => {
  const routeRegistry = new RouteRegistry();
  const todoController = container.resolve(TodoController);
  
  return routeRegistry.createRoutes(todoController);
};
```

## Step-by-Step Migration Process

### Step 1: Add Controller Decorator

Add the `@Controller` decorator to your class:

```typescript
// Before
@injectable()
export class TodoController {

// After
@Controller('/api/todos')
@injectable()
export class TodoController {
```

### Step 2: Convert Methods to Use HTTP Method Decorators

Replace the traditional method pattern with decorators:

```typescript
// Before
getAllTodos = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const todos = await this.getAllTodosQueryHandler.execute();
    res.json({ success: true, data: TodoMapper.toDtoArray(todos) });
  }
);

// After
@Get()
@ApiOkResponse('Returns all todos')
async getAllTodos() {
  const todos = await this.getAllTodosQueryHandler.execute();
  return TodoMapper.toDtoArray(todos);
}
```

### Step 3: Add Parameter Decorators

Replace manual parameter extraction with decorators:

```typescript
// Before
getTodoById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const todo = await this.getTodoByIdQueryHandler.execute({ id });
    res.json({ success: true, data: TodoMapper.toDto(todo) });
  }
);

// After
@Get('/:id')
@ApiOkResponse('Returns todo by ID')
async getTodoById(@Param('id') id: string) {
  const todo = await this.getTodoByIdQueryHandler.execute({ id });
  return TodoMapper.toDto(todo);
}
```

### Step 4: Add Validation Decorators

Replace manual validation with decorators:

```typescript
// Before
createTodo = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const validatedData = this.validationSchemas.CreateTodoCommandSchema.parse(req.body);
    const todo = await this.createTodoUseCase.execute(validatedData);
    res.status(201).json({ success: true, data: TodoMapper.toDto(todo) });
  }
);

// After
@Post()
@ApiCreatedResponse('Todo created successfully')
@ValidateBody(this.validationSchemas.CreateTodoCommandSchema)
async createTodo(@Body() createTodoData: any) {
  const todo = await this.createTodoUseCase.execute(createTodoData);
  return TodoMapper.toDto(todo);
}
```

### Step 5: Update Route Registration

Replace manual route binding with RouteRegistry:

```typescript
// Before
export const createTodoRoutes = (): Router => {
  const router = Router();
  const todoController = container.resolve(TodoController);
  const bindMethod = (method: Function) => method.bind(todoController);

  router.get('/', bindMethod(todoController.getAllTodos));
  router.get('/:id', bindMethod(todoController.getTodoById));
  router.post('/', bindMethod(todoController.createTodo));
  // ... more routes

  return router;
};

// After
export const createTodoRoutes = (): Router => {
  const routeRegistry = new RouteRegistry();
  const todoController = container.resolve(TodoController);
  
  return routeRegistry.createRoutes(todoController);
};
```

## Common Migration Patterns

### 1. Handling Complex Parameter Extraction

```typescript
// Before
updateTodo = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;
    const { version } = req.query;
    
    const validatedData = { ...updateData, id };
    await this.updateTodoUseCase.execute(validatedData);
    res.json({ success: true, message: 'Updated' });
  }
);

// After
@Put('/:id')
@ApiOkResponse('Todo updated successfully')
@ValidateBody(this.validationSchemas.UpdateTodoCommandSchema)
async updateTodo(
  @Param('id') id: string,
  @Body() updateData: any,
  @Query('version') version?: string
) {
  const validatedData = { ...updateData, id };
  await this.updateTodoUseCase.execute(validatedData);
  return { message: 'Todo updated successfully' };
}
```

### 2. Handling Custom Response Logic

```typescript
// Before
exportTodos = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const todos = await this.getAllTodosQueryHandler.execute();
    const csv = this.generateCsv(todos);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=todos.csv');
    res.send(csv);
  }
);

// After
@Get('/export')
@ApiOkResponse('Exports todos as CSV')
async exportTodos(@Res() res: Response) {
  const todos = await this.getAllTodosQueryHandler.execute();
  const csv = this.generateCsv(todos);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=todos.csv');
  res.send(csv);
  
  return undefined; // Prevent automatic response handling
}
```

### 3. Handling Middleware

```typescript
// Before
// Middleware applied in route setup
router.get('/admin', authMiddleware, adminMiddleware, bindMethod(todoController.getAdminTodos));

// After
@Get('/admin')
@UseMiddleware(authMiddleware, adminMiddleware)
@Authorize('admin')
@ApiOkResponse('Returns admin todos')
async getAdminTodos() {
  // Implementation
}
```

## Migration Checklist

Use this checklist to ensure a complete migration:

### Controller Class
- [ ] Add `@Controller(path)` decorator
- [ ] Keep `@injectable()` decorator
- [ ] Remove `asyncHandler` wrappers from methods
- [ ] Change method signatures to remove `Request` and `Response` parameters
- [ ] Change methods to return data instead of calling `res.json()`

### HTTP Methods
- [ ] Add `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()` decorators
- [ ] Specify paths in decorators instead of route setup
- [ ] Add `@ApiOkResponse()`, `@ApiCreatedResponse()` decorators

### Parameter Handling
- [ ] Replace `req.params` with `@Param()` decorators
- [ ] Replace `req.body` with `@Body()` decorators
- [ ] Replace `req.query` with `@Query()` decorators
- [ ] Replace `req.headers` with `@Headers()` decorators

### Validation
- [ ] Replace manual validation with `@ValidateBody()` decorators
- [ ] Add `@ValidateParams()` and `@ValidateQuery()` as needed

### Route Setup
- [ ] Replace manual route binding with `RouteRegistry`
- [ ] Update route exports to use `routeRegistry.createRoutes()`
- [ ] Remove manual method binding

### Error Handling
- [ ] Verify that error handling still works (RouteRegistry uses asyncHandler internally)
- [ ] Test that validation errors are properly handled

## Testing Your Migration

### 1. Unit Tests

```typescript
// Test that decorators are properly applied
describe('TodoController Decorators', () => {
  it('should have controller metadata', () => {
    const metadata = MetadataStorage.getInstance().getControllerMetadata(TodoController);
    expect(metadata?.path).toBe('/api/todos');
  });

  it('should have route metadata', () => {
    const routes = MetadataStorage.getInstance().getRouteMetadata(TodoController);
    expect(routes.length).toBeGreaterThan(0);
  });
});
```

### 2. Integration Tests

```typescript
// Test that routes work correctly
describe('TodoController Integration', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    const routeRegistry = new RouteRegistry();
    const todoController = container.resolve(TodoController);
    const router = routeRegistry.createRoutes(todoController);
    app.use(router);
  });

  it('should get all todos', async () => {
    const response = await request(app)
      .get('/api/todos')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
  });
});
```

## Common Pitfalls and Solutions

### 1. Async Handler Dependency

**Problem**: The decorator system handles async operations automatically, but you might miss removing `asyncHandler` wrappers.

**Solution**: Remove all `asyncHandler` wrappers from methods - the RouteRegistry handles this automatically.

### 2. Response Handling

**Problem**: Methods that directly manipulate the response object might not work as expected.

**Solution**: Use `@Res()` decorator to inject the response object when needed, and return `undefined` to prevent automatic response handling.

### 3. Middleware Order

**Problem**: Middleware application order might differ from the traditional approach.

**Solution**: Use `@UseMiddleware()` decorator to apply middleware in the correct order, or apply middleware at the router level.

### 4. Validation Schema Access

**Problem**: `this.validationSchemas` might not be available in decorator context.

**Solution**: Access validation schemas in the method implementation, not in the decorator. The decorator should reference the schema directly.

## Performance Considerations

1. **Reflection Overhead**: Decorators add some reflection overhead, but it's minimal in typical applications.
2. **Metadata Caching**: The metadata storage system caches decorator information for performance.
3. **Route Registration**: Route registration happens once at startup, not per request.

## Backward Compatibility

The decorator system is designed to coexist with traditional controllers:

```typescript
// You can mix both approaches
router.use('/todos', createTodoRoutes()); // Traditional
router.use('/todos-v2', createDecoratorTodoRoutes()); // Decorator-based
```

This allows for gradual migration without breaking existing functionality.

## Advanced Migration Patterns

### Gradual Migration Strategy

1. **Phase 1**: Add decorators to existing controllers without changing route setup
2. **Phase 2**: Update route setup to use RouteRegistry
3. **Phase 3**: Remove traditional route binding code
4. **Phase 4**: Add advanced decorators (caching, authorization, etc.)

### Feature Flags

Use feature flags to control which controllers use decorators:

```typescript
const useDecorators = process.env.USE_DECORATORS === 'true';

if (useDecorators) {
  router.use('/todos', createDecoratorTodoRoutes());
} else {
  router.use('/todos', createTodoRoutes());
}
```

This approach allows for safe rollback if issues arise during migration.