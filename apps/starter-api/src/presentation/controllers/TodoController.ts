import { Response } from 'express';
import { injectable, inject } from 'tsyringe';
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
} from 'routing-controllers';
import {
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
  ValidatedCreateTodoCommand,
  ValidatedUpdateTodoCommand,
  ValidatedDeleteTodoCommand,
  ValidatedToggleTodoCommand,
  CreateTodoCommand,
  UpdateTodoCommand,
  DeleteTodoCommand,
  ToggleTodoCommand,
} from '../../shared/decorators';

/**
 * REST API Controller for Todo operations
 * Follows Clean Architecture - Controllers are part of the presentation layer
 * Now uses OOP validation services with mandatory validation
 */
@Controller('/todos')
@injectable()
export class TodoController {
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
   */
  @Get('/')
  async getAllTodos(): Promise<any> {
    const todos = await this.getAllTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);

    return {
      success: true,
      data: todoDtos,
    };
  }

  /**
   * GET /api/todos/active - Get active todos
   */
  @Get('/active')
  async getActiveTodos(): Promise<any> {
    const todos = await this.getActiveTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);

    return {
      success: true,
      data: todoDtos,
    };
  }

  /**
   * GET /api/todos/completed - Get completed todos
   */
  @Get('/completed')
  async getCompletedTodos(): Promise<any> {
    const todos = await this.getCompletedTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);

    return {
      success: true,
      data: todoDtos,
    };
  }

  /**
   * GET /api/todos/stats - Get todo statistics
   */
  @Get('/stats')
  async getTodoStats(): Promise<any> {
    const stats = await this.getTodoStatsQueryHandler.execute();

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * GET /api/todos/:id - Get todo by ID
   */
  @Get('/:id')
  async getTodoById(@Param('id') id: string): Promise<any> {
    const todo = await this.getTodoByIdQueryHandler.execute({ id });
    const todoDto = TodoMapper.toDto(todo);
    return {
      success: true,
      data: todoDto,
    };
  }

  /**
   * POST /api/todos - Create a new todo
   * Uses mandatory validation with OOP validation service
   */
  @Post('/')
  @HttpCode(201)
  async createTodo(@ValidatedCreateTodoCommand() command: CreateTodoCommand): Promise<any> {
    const todo = await this.createTodoUseCase.execute(command);
    const todoDto = TodoMapper.toDto(todo);

    return {
      success: true,
      data: todoDto,
    };
  }

  /**
   * PUT /api/todos/:id - Update a todo
   * Uses mandatory validation with automatic ID merging
   */
  @Put('/:id')
  async updateTodo(@ValidatedUpdateTodoCommand() command: UpdateTodoCommand): Promise<any> {
    await this.updateTodoUseCase.execute(command);

    return {
      success: true,
      message: 'Todo updated successfully',
    };
  }

  /**
   * PATCH /api/todos/:id/toggle - Toggle todo completion
   * Uses mandatory validation with automatic ID extraction
   */
  @Patch('/:id/toggle')
  async toggleTodo(@ValidatedToggleTodoCommand() command: ToggleTodoCommand): Promise<any> {
    await this.toggleTodoUseCase.execute(command);

    return {
      success: true,
      message: 'Todo toggled successfully',
    };
  }

  /**
   * DELETE /api/todos/:id - Delete a todo
   * Uses mandatory validation with automatic ID extraction
   */
  @Delete('/:id')
  async deleteTodo(@ValidatedDeleteTodoCommand() command: DeleteTodoCommand): Promise<any> {
    await this.deleteTodoUseCase.execute(command);

    return {
      success: true,
      message: 'Todo deleted successfully',
    };
  }
}
