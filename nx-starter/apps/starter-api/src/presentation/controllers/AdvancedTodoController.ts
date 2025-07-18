import { injectable, inject } from 'tsyringe';
import {
  createCommandValidationSchema,
  CreateTodoUseCase,
  UpdateTodoUseCase,
  DeleteTodoUseCase,
  ToggleTodoUseCase,
  GetAllTodosQueryHandler,
  GetActiveTodosQueryHandler,
  GetCompletedTodosQueryHandler,
  GetTodoByIdQueryHandler,
  GetTodoStatsQueryHandler,
  TodoMapper,
  TOKENS,
} from '@nx-starter/application-core';
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Patch,
  Body,
  Param,
  Query,
  ApiOkResponse,
  ApiCreatedResponse,
  ValidateBody,
  UseMiddleware,
  Authorize,
  Cache,
  RateLimit,
  Transform,
  Deprecated,
  ApiTags,
  Version,
  Summary,
} from '../../shared/decorators';

// Example middleware functions (these would be implemented separately)
const loggerMiddleware = (req: any, res: any, next: any) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

const authMiddleware = (req: any, res: any, next: any) => {
  // Check authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

/**
 * Advanced Todo Controller showcasing all decorator patterns
 * This controller demonstrates the full range of decorator capabilities
 */
@Controller('/api/v3/todos')
@ApiTags('Todos', 'Advanced')
@Version('3.0')
@injectable()
export class AdvancedTodoController {
  private validationSchemas = createCommandValidationSchema();

  constructor(
    @inject(TOKENS.CreateTodoUseCase)
    private createTodoUseCase: CreateTodoUseCase,
    @inject(TOKENS.UpdateTodoUseCase)
    private updateTodoUseCase: UpdateTodoUseCase,
    @inject(TOKENS.DeleteTodoUseCase)
    private deleteTodoUseCase: DeleteTodoUseCase,
    @inject(TOKENS.ToggleTodoUseCase)
    private toggleTodoUseCase: ToggleTodoUseCase,
    @inject(TOKENS.GetAllTodosQueryHandler)
    private getAllTodosQueryHandler: GetAllTodosQueryHandler,
    @inject(TOKENS.GetActiveTodosQueryHandler)
    private getActiveTodosQueryHandler: GetActiveTodosQueryHandler,
    @inject(TOKENS.GetCompletedTodosQueryHandler)
    private getCompletedTodosQueryHandler: GetCompletedTodosQueryHandler,
    @inject(TOKENS.GetTodoByIdQueryHandler)
    private getTodoByIdQueryHandler: GetTodoByIdQueryHandler,
    @inject(TOKENS.GetTodoStatsQueryHandler)
    private getTodoStatsQueryHandler: GetTodoStatsQueryHandler
  ) {}

  /**
   * Get all todos with caching and rate limiting
   */
  @Get()
  @Summary('Get all todos')
  @ApiOkResponse('Returns all todos with caching enabled')
  @UseMiddleware(loggerMiddleware)
  @Cache(300) // Cache for 5 minutes
  @RateLimit(100, 60000) // 100 requests per minute
  @Transform((data) => ({ todos: data, count: data.length }))
  async getAllTodos(@Query('limit') limit?: string) {
    const todos = await this.getAllTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);
    
    if (limit) {
      const limitNum = parseInt(limit, 10);
      return todoDtos.slice(0, limitNum);
    }
    
    return todoDtos;
  }

  /**
   * Get active todos with authorization required
   */
  @Get('/active')
  @Summary('Get active todos')
  @ApiOkResponse('Returns active todos')
  @UseMiddleware(authMiddleware)
  @Authorize('user', 'admin')
  @Cache(60) // Cache for 1 minute
  async getActiveTodos() {
    const todos = await this.getActiveTodosQueryHandler.execute();
    return TodoMapper.toDtoArray(todos);
  }

  /**
   * Get todo statistics with heavy caching
   */
  @Get('/stats')
  @Summary('Get todo statistics')
  @ApiOkResponse('Returns todo statistics')
  @Cache(600) // Cache for 10 minutes
  @RateLimit(10, 60000) // 10 requests per minute
  async getTodoStats() {
    return await this.getTodoStatsQueryHandler.execute();
  }

  /**
   * Get todo by ID with logging
   */
  @Get('/:id')
  @Summary('Get todo by ID')
  @ApiOkResponse('Returns todo by ID')
  @UseMiddleware(loggerMiddleware)
  @Cache(120) // Cache for 2 minutes
  async getTodoById(@Param('id') id: string) {
    const todo = await this.getTodoByIdQueryHandler.execute({ id });
    return TodoMapper.toDto(todo);
  }

  /**
   * Create a new todo with validation and rate limiting
   */
  @Post()
  @Summary('Create a new todo')
  @ApiCreatedResponse('Todo created successfully')
  @UseMiddleware(authMiddleware, loggerMiddleware)
  @Authorize('user', 'admin')
  @ValidateBody(this.validationSchemas.CreateTodoCommandSchema)
  @RateLimit(50, 60000) // 50 requests per minute
  async createTodo(@Body() createTodoData: any) {
    const todo = await this.createTodoUseCase.execute(createTodoData);
    return TodoMapper.toDto(todo);
  }

  /**
   * Update a todo with full authorization
   */
  @Put('/:id')
  @Summary('Update a todo')
  @ApiOkResponse('Todo updated successfully')
  @UseMiddleware(authMiddleware, loggerMiddleware)
  @Authorize('user', 'admin')
  @ValidateBody(this.validationSchemas.UpdateTodoCommandSchema)
  @RateLimit(30, 60000) // 30 requests per minute
  async updateTodo(@Param('id') id: string, @Body() updateTodoData: any) {
    const validatedData = { ...updateTodoData, id };
    await this.updateTodoUseCase.execute(validatedData);
    return { message: 'Todo updated successfully' };
  }

  /**
   * Quick toggle todo (optimized for mobile)
   */
  @Patch('/:id/toggle')
  @Summary('Toggle todo completion')
  @ApiOkResponse('Todo toggled successfully')
  @UseMiddleware(authMiddleware)
  @Authorize('user', 'admin')
  @Cache(0) // No caching for state changes
  @RateLimit(200, 60000) // High rate limit for mobile apps
  async toggleTodo(@Param('id') id: string) {
    const validatedData = { id };
    await this.toggleTodoUseCase.execute(validatedData);
    return { message: 'Todo toggled successfully' };
  }

  /**
   * Delete a todo with admin authorization
   */
  @Delete('/:id')
  @Summary('Delete a todo')
  @ApiOkResponse('Todo deleted successfully')
  @UseMiddleware(authMiddleware, loggerMiddleware)
  @Authorize('admin') // Only admins can delete
  @RateLimit(20, 60000) // 20 requests per minute
  async deleteTodo(@Param('id') id: string) {
    const validatedData = { id };
    await this.deleteTodoUseCase.execute(validatedData);
    return { message: 'Todo deleted successfully' };
  }

  /**
   * Legacy endpoint for backward compatibility
   */
  @Get('/legacy')
  @Summary('Legacy todo endpoint')
  @ApiOkResponse('Returns todos in legacy format')
  @Deprecated('This endpoint is deprecated. Use /api/v3/todos instead.', '4.0')
  @UseMiddleware(loggerMiddleware)
  async getLegacyTodos() {
    const todos = await this.getAllTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);
    
    // Return in legacy format
    return {
      success: true,
      data: todoDtos,
      message: 'This endpoint is deprecated. Please use /api/v3/todos',
    };
  }

  /**
   * Bulk operations endpoint
   */
  @Post('/bulk')
  @Summary('Bulk operations on todos')
  @ApiCreatedResponse('Bulk operation completed')
  @UseMiddleware(authMiddleware, loggerMiddleware)
  @Authorize('admin')
  @RateLimit(5, 60000) // Very limited for bulk operations
  async bulkOperations(@Body() operations: any[]) {
    const results = [];
    
    for (const operation of operations) {
      try {
        if (operation.type === 'create') {
          const todo = await this.createTodoUseCase.execute(operation.data);
          results.push({ success: true, todo: TodoMapper.toDto(todo) });
        } else if (operation.type === 'update') {
          await this.updateTodoUseCase.execute(operation.data);
          results.push({ success: true, message: 'Updated' });
        } else if (operation.type === 'delete') {
          await this.deleteTodoUseCase.execute(operation.data);
          results.push({ success: true, message: 'Deleted' });
        }
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    
    return { results };
  }

  /**
   * Health check endpoint for this specific controller
   */
  @Get('/health')
  @Summary('Controller health check')
  @ApiOkResponse('Controller health status')
  @Cache(30) // Cache for 30 seconds
  async healthCheck() {
    return {
      controller: 'AdvancedTodoController',
      version: '3.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      features: [
        'Authentication',
        'Authorization',
        'Caching',
        'Rate Limiting',
        'Request Validation',
        'Response Transformation',
        'Deprecation Warnings',
        'Bulk Operations',
      ],
    };
  }
}