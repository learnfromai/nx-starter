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
} from '@nx-starter/shared-application';
import { DomainException } from '@nx-starter/shared-domain';
import { 
  asyncHandler, 
  enhancedAsyncHandler, 
  createResponse, 
  EnhancedRequest 
} from '../../shared/middleware/ErrorHandler';

/**
 * REST API Controller for Todo operations
 * Follows Clean Architecture - Controllers are part of the presentation layer
 */
@injectable()
export class TodoController {
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
   * GET /api/todos - Get all todos
   * Enhanced version using new response standardization
   */
  getAllTodos = enhancedAsyncHandler(
    async (req: EnhancedRequest): Promise<void> => {
      const todos = await this.getAllTodosQueryHandler.execute();
      const todoDtos = TodoMapper.toDtoArray(todos);
      
      req.respond.successData(todoDtos);
    }
  );

  /**
   * GET /api/todos/active - Get active todos
   * Enhanced version using return-based response
   */
  getActiveTodos = enhancedAsyncHandler(
    async (req: EnhancedRequest) => {
      const todos = await this.getActiveTodosQueryHandler.execute();
      const todoDtos = TodoMapper.toDtoArray(todos);
      
      return createResponse.data(todoDtos);
    }
  );

  /**
   * GET /api/todos/completed - Get completed todos
   */
  getCompletedTodos = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const todos = await this.getCompletedTodosQueryHandler.execute();
      const todoDtos = TodoMapper.toDtoArray(todos);

      res.json({
        success: true,
        data: todoDtos,
      });
    }
  );

  /**
   * GET /api/todos/stats - Get todo statistics
   */
  getTodoStats = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const stats = await this.getTodoStatsQueryHandler.execute();

      res.json({
        success: true,
        data: stats,
      });
    }
  );

  /**
   * GET /api/todos/:id - Get todo by ID
   */
  getTodoById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const todo = await this.getTodoByIdQueryHandler.execute({ id });

      const todoDto = TodoMapper.toDto(todo);
      res.json({
        success: true,
        data: todoDto,
      });
    }
  );

  /**
   * POST /api/todos - Create a new todo
   * Enhanced version demonstrating 201 status code
   */
  createTodo = enhancedAsyncHandler(
    async (req: EnhancedRequest): Promise<void> => {
      const validatedData = this.validationSchemas.CreateTodoCommandSchema
        ? this.validationSchemas.CreateTodoCommandSchema.parse(req.body)
        : req.body;
      const todo = await this.createTodoUseCase.execute(validatedData);
      const todoDto = TodoMapper.toDto(todo);

      req.respond.successData(todoDto, 201);
    }
  );

  /**
   * PUT /api/todos/:id - Update a todo
   * Enhanced version using message response
   */
  updateTodo = enhancedAsyncHandler(
    async (req: EnhancedRequest) => {
      const { id } = req.params;
      const validatedData = this.validationSchemas.UpdateTodoCommandSchema
        ? this.validationSchemas.UpdateTodoCommandSchema.parse({
            ...req.body,
            id,
          })
        : { ...req.body, id };

      await this.updateTodoUseCase.execute(validatedData);

      return createResponse.message('Todo updated successfully');
    }
  );

  /**
   * PATCH /api/todos/:id/toggle - Toggle todo completion
   */
  toggleTodo = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const validatedData = this.validationSchemas.ToggleTodoCommandSchema
        ? this.validationSchemas.ToggleTodoCommandSchema.parse({ id })
        : { id };

      await this.toggleTodoUseCase.execute(validatedData);

      res.json({
        success: true,
        message: 'Todo toggled successfully',
      });
    }
  );

  /**
   * DELETE /api/todos/:id - Delete a todo
   * Enhanced version using helper method
   */
  deleteTodo = enhancedAsyncHandler(
    async (req: EnhancedRequest): Promise<void> => {
      const { id } = req.params;
      const validatedData = this.validationSchemas.DeleteTodoCommandSchema
        ? this.validationSchemas.DeleteTodoCommandSchema.parse({ id })
        : { id };

      await this.deleteTodoUseCase.execute(validatedData);

      req.respond.successMessage('Todo deleted successfully');
    }
  );
}
