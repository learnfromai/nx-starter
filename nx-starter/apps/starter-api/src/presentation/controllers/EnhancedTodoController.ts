import { Request, Response } from 'express';
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
  Req,
  Res,
  ApiOkResponse,
  ApiCreatedResponse,
  ValidateBody,
  ValidateParams,
} from '../../shared/decorators';

/**
 * Enhanced Todo Controller demonstrating advanced decorator patterns
 * This controller showcases all available decorators and their usage
 */
@Controller('/api/v2/todos')
@injectable()
export class EnhancedTodoController {
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
   * Get all todos with optional filtering
   * Demonstrates: @Get, @Query, @ApiOkResponse
   */
  @Get()
  @ApiOkResponse('Returns all todos with optional filtering')
  async getAllTodos(
    @Query('status') status?: 'active' | 'completed',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    let todos;
    
    if (status === 'active') {
      todos = await this.getActiveTodosQueryHandler.execute();
    } else if (status === 'completed') {
      todos = await this.getCompletedTodosQueryHandler.execute();
    } else {
      todos = await this.getAllTodosQueryHandler.execute();
    }
    
    const todoDtos = TodoMapper.toDtoArray(todos);
    
    // Apply limit/offset if provided
    if (limit || offset) {
      const limitNum = limit ? parseInt(limit, 10) : todoDtos.length;
      const offsetNum = offset ? parseInt(offset, 10) : 0;
      return todoDtos.slice(offsetNum, offsetNum + limitNum);
    }
    
    return todoDtos;
  }

  /**
   * Get active todos
   * Demonstrates: @Get with path, @ApiOkResponse
   */
  @Get('/active')
  @ApiOkResponse('Returns active todos')
  async getActiveTodos() {
    const todos = await this.getActiveTodosQueryHandler.execute();
    return TodoMapper.toDtoArray(todos);
  }

  /**
   * Get completed todos
   * Demonstrates: @Get with path, @ApiOkResponse
   */
  @Get('/completed')
  @ApiOkResponse('Returns completed todos')
  async getCompletedTodos() {
    const todos = await this.getCompletedTodosQueryHandler.execute();
    return TodoMapper.toDtoArray(todos);
  }

  /**
   * Get todo statistics
   * Demonstrates: @Get, @ApiOkResponse
   */
  @Get('/stats')
  @ApiOkResponse('Returns todo statistics')
  async getTodoStats() {
    return await this.getTodoStatsQueryHandler.execute();
  }

  /**
   * Get todo by ID
   * Demonstrates: @Get with parameter, @Param, @ApiOkResponse
   */
  @Get('/:id')
  @ApiOkResponse('Returns todo by ID')
  async getTodoById(@Param('id') id: string) {
    const todo = await this.getTodoByIdQueryHandler.execute({ id });
    return TodoMapper.toDto(todo);
  }

  /**
   * Create a new todo
   * Demonstrates: @Post, @Body, @ValidateBody, @ApiCreatedResponse
   */
  @Post()
  @ApiCreatedResponse('Todo created successfully')
  @ValidateBody(this.validationSchemas.CreateTodoCommandSchema)
  async createTodo(@Body() createTodoData: any) {
    const todo = await this.createTodoUseCase.execute(createTodoData);
    return TodoMapper.toDto(todo);
  }

  /**
   * Update a todo
   * Demonstrates: @Put, @Param, @Body, @ValidateBody, @ApiOkResponse
   */
  @Put('/:id')
  @ApiOkResponse('Todo updated successfully')
  @ValidateBody(this.validationSchemas.UpdateTodoCommandSchema)
  async updateTodo(@Param('id') id: string, @Body() updateTodoData: any) {
    const validatedData = { ...updateTodoData, id };
    await this.updateTodoUseCase.execute(validatedData);
    return { message: 'Todo updated successfully' };
  }

  /**
   * Partial update of a todo
   * Demonstrates: @Patch, @Param, @Body, @ApiOkResponse
   */
  @Patch('/:id')
  @ApiOkResponse('Todo partially updated successfully')
  async patchTodo(@Param('id') id: string, @Body() patchData: any) {
    // For partial updates, we don't validate the entire schema
    const validatedData = { ...patchData, id };
    await this.updateTodoUseCase.execute(validatedData);
    return { message: 'Todo partially updated successfully' };
  }

  /**
   * Toggle todo completion
   * Demonstrates: @Patch with specific path, @Param, @ApiOkResponse
   */
  @Patch('/:id/toggle')
  @ApiOkResponse('Todo toggled successfully')
  async toggleTodo(@Param('id') id: string) {
    const validatedData = { id };
    await this.toggleTodoUseCase.execute(validatedData);
    return { message: 'Todo toggled successfully' };
  }

  /**
   * Delete a todo
   * Demonstrates: @Delete, @Param, @ApiOkResponse
   */
  @Delete('/:id')
  @ApiOkResponse('Todo deleted successfully')
  async deleteTodo(@Param('id') id: string) {
    const validatedData = { id };
    await this.deleteTodoUseCase.execute(validatedData);
    return { message: 'Todo deleted successfully' };
  }

  /**
   * Bulk delete todos
   * Demonstrates: @Delete, @Body with array, @ApiOkResponse
   */
  @Delete('/bulk')
  @ApiOkResponse('Todos deleted successfully')
  async bulkDeleteTodos(@Body('ids') ids: string[]) {
    for (const id of ids) {
      await this.deleteTodoUseCase.execute({ id });
    }
    return { message: `${ids.length} todos deleted successfully` };
  }

  /**
   * Search todos
   * Demonstrates: @Get, @Query with multiple parameters, @ApiOkResponse
   */
  @Get('/search')
  @ApiOkResponse('Returns search results')
  async searchTodos(
    @Query('q') searchTerm?: string,
    @Query('status') status?: 'active' | 'completed',
    @Query('limit') limit?: string
  ) {
    let todos = await this.getAllTodosQueryHandler.execute();
    
    // Apply search filter
    if (searchTerm) {
      todos = todos.filter(todo => 
        todo.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (status) {
      const isCompleted = status === 'completed';
      todos = todos.filter(todo => todo.completed === isCompleted);
    }
    
    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit, 10);
      todos = todos.slice(0, limitNum);
    }
    
    return TodoMapper.toDtoArray(todos);
  }

  /**
   * Export todos
   * Demonstrates: @Get, @Req, @Res for custom response handling
   */
  @Get('/export')
  @ApiOkResponse('Exports todos as CSV')
  async exportTodos(@Req() req: Request, @Res() res: Response) {
    const todos = await this.getAllTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);
    
    // Generate CSV
    const csvHeader = 'ID,Title,Completed,Created At\n';
    const csvData = todoDtos.map(todo => 
      `${todo.id},${todo.title},${todo.completed},${todo.createdAt || new Date().toISOString()}`
    ).join('\n');
    
    const csv = csvHeader + csvData;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=todos.csv');
    res.send(csv);
    
    // Return undefined to prevent automatic response handling
    return undefined;
  }

  /**
   * Get todo with additional metadata
   * Demonstrates: @Get, @Param, @Query, complex response
   */
  @Get('/:id/detailed')
  @ApiOkResponse('Returns detailed todo information')
  async getDetailedTodo(
    @Param('id') id: string,
    @Query('includeStats') includeStats?: string
  ) {
    const todo = await this.getTodoByIdQueryHandler.execute({ id });
    const todoDto = TodoMapper.toDto(todo);
    
    const response: any = {
      todo: todoDto,
      metadata: {
        requestedAt: new Date().toISOString(),
        version: 'v2',
      },
    };
    
    if (includeStats === 'true') {
      const stats = await this.getTodoStatsQueryHandler.execute();
      response.stats = stats;
    }
    
    return response;
  }
}