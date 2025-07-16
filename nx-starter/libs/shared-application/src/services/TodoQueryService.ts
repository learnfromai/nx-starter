import type { Todo } from '@nx-starter/shared-domain';
import type { ITodoQueryService } from '../interfaces/ITodoService';
import type { 
  GetFilteredTodosQuery, 
  GetTodoByIdQuery 
} from '../dto/TodoQueries';
import { 
  GetAllTodosQueryHandler,
  GetFilteredTodosQueryHandler,
  GetTodoStatsQueryHandler,
  GetTodoByIdQueryHandler
} from '../use-cases/queries/TodoQueryHandlers';

/**
 * Query Service implementing Query Responsibility Segregation
 * Handles all read operations (Queries)
 * Follows Single Responsibility Principle
 */
export class TodoQueryService implements ITodoQueryService {
  constructor(
    private getAllTodosHandler: GetAllTodosQueryHandler,
    private getFilteredTodosHandler: GetFilteredTodosQueryHandler,
    private getTodoStatsHandler: GetTodoStatsQueryHandler,
    private getTodoByIdHandler: GetTodoByIdQueryHandler
  ) {}

  async getAllTodos(): Promise<Todo[]> {
    return await this.getAllTodosHandler.handle();
  }

  async getActiveTodos(): Promise<Todo[]> {
    const query: GetFilteredTodosQuery = { filter: 'active' as const };
    return await this.getFilteredTodosHandler.handle(query);
  }

  async getCompletedTodos(): Promise<Todo[]> {
    const query: GetFilteredTodosQuery = { filter: 'completed' as const };
    return await this.getFilteredTodosHandler.handle(query);
  }

  async getTodoById(id: string): Promise<Todo | null> {
    const query: GetTodoByIdQuery = { id };
    return await this.getTodoByIdHandler.handle(query);
  }

  async getFilteredTodos(
    filter: 'all' | 'active' | 'completed',
    sortBy?: 'priority' | 'createdAt' | 'urgency'
  ): Promise<Todo[]> {
    const query: GetFilteredTodosQuery = { filter, sortBy };
    return await this.getFilteredTodosHandler.handle(query);
  }

  async getTodoStats(): Promise<{ total: number; active: number; completed: number }> {
    const stats = await this.getTodoStatsHandler.handle();
    
    // Return in expected format for backward compatibility
    return {
      total: stats.total,
      active: stats.active,
      completed: stats.completed
    };
  }
}