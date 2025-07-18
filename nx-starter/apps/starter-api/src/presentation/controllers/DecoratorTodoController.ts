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
  ApiOkResponse,
  ApiCreatedResponse,
  ValidateBody,
} from '../../shared/decorators';

/**
 * REST API Controller for Todo operations using decorator-based patterns
 * Demonstrates the new decorator system while maintaining Clean Architecture
 */
@Controller('/api/todos')
@injectable()
export class DecoratorTodoController {
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
   * Get all todos
   */
  @Get()
  @ApiOkResponse('Returns all todos')
  async getAllTodos() {
    const todos = await this.getAllTodosQueryHandler.execute();
    return TodoMapper.toDtoArray(todos);
  }

  /**
   * Get active todos
   */
  @Get('/active')
  @ApiOkResponse('Returns active todos')
  async getActiveTodos() {
    const todos = await this.getActiveTodosQueryHandler.execute();
    return TodoMapper.toDtoArray(todos);
  }

  /**
   * Get completed todos
   */
  @Get('/completed')
  @ApiOkResponse('Returns completed todos')
  async getCompletedTodos() {
    const todos = await this.getCompletedTodosQueryHandler.execute();
    return TodoMapper.toDtoArray(todos);
  }

  /**
   * Get todo statistics
   */
  @Get('/stats')
  @ApiOkResponse('Returns todo statistics')
  async getTodoStats() {
    return await this.getTodoStatsQueryHandler.execute();
  }

  /**
   * Get todo by ID
   */
  @Get('/:id')
  @ApiOkResponse('Returns todo by ID')
  async getTodoById(@Param('id') id: string) {
    const todo = await this.getTodoByIdQueryHandler.execute({ id });
    return TodoMapper.toDto(todo);
  }

  /**
   * Create a new todo
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
   * Toggle todo completion
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
   */
  @Delete('/:id')
  @ApiOkResponse('Todo deleted successfully')
  async deleteTodo(@Param('id') id: string) {
    const validatedData = { id };
    await this.deleteTodoUseCase.execute(validatedData);
    return { message: 'Todo deleted successfully' };
  }
}