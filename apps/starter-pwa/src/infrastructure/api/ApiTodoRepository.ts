import { injectable, inject } from 'tsyringe';
import {
  Todo,
  TodoPriorityLevel,
  Specification,
  ITodoRepository,
} from '@nx-starter/domain-core';
import {
  TodoListResponse,
  TodoResponse,
  TodoDto,
  CreateTodoRequestDto,
  UpdateTodoRequestDto,
} from '@nx-starter/application-core';
import { IHttpClient } from './http/IHttpClient';
import { ApiError } from './errors/ApiError';
import { getApiConfig } from './config/ApiConfig';

/**
 * API-based TodoRepository implementation
 * Follows Clean Architecture and SOLID principles
 * Uses dependency injection for HTTP client abstraction
 */
@injectable()
export class ApiTodoRepository implements ITodoRepository {
  private readonly apiConfig = getApiConfig();

  constructor(@inject('IHttpClient') private readonly httpClient: IHttpClient) {}

  async getAll(): Promise<Todo[]> {
    try {
      const response = await this.httpClient.get<TodoListResponse>(
        this.apiConfig.endpoints.todos.all
      );

      if (!response.data.success) {
        throw new ApiError('Failed to fetch todos', response.status);
      }

      return response.data.data.map((dto) => this.mapDtoToTodo(dto));
    } catch (error) {
      this.handleError(error, 'Failed to fetch todos');
      throw error; // Re-throw after handling
    }
  }

  async create(todo: Todo): Promise<string> {
    try {
      const todoData: CreateTodoRequestDto = {
        title: todo.titleValue,
        priority: todo.priority.level,
        dueDate: todo.dueDate?.toISOString(),
      };

      const response = await this.httpClient.post<TodoResponse>(
        this.apiConfig.endpoints.todos.base,
        todoData
      );

      if (!response.data.success) {
        throw new ApiError('Failed to create todo', response.status);
      }

      return response.data.data.id;
    } catch (error) {
      this.handleError(error, 'Failed to create todo');
      throw error;
    }
  }

  async update(id: string, changes: Partial<Todo>): Promise<void> {
    try {
      const updateData: UpdateTodoRequestDto = {};

      if (changes.title) {
        updateData.title =
          changes.title instanceof Object && 'value' in changes.title
            ? changes.title.value
            : changes.title;
      }
      if (changes.completed !== undefined) {
        updateData.completed = changes.completed;
      }
      if (changes.priority) {
        updateData.priority =
          changes.priority instanceof Object && 'level' in changes.priority
            ? changes.priority.level
            : changes.priority;
      }
      if ('dueDate' in changes) {
        updateData.dueDate = changes.dueDate?.toISOString();
      }

      await this.httpClient.put(
        this.apiConfig.endpoints.todos.byId(id),
        updateData
      );
    } catch (error) {
      this.handleError(error, 'Failed to update todo');
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.httpClient.delete(this.apiConfig.endpoints.todos.byId(id));
    } catch (error) {
      this.handleError(error, 'Failed to delete todo');
      throw error;
    }
  }

  async getById(id: string): Promise<Todo | undefined> {
    try {
      const response = await this.httpClient.get<TodoResponse>(
        this.apiConfig.endpoints.todos.byId(id)
      );

      if (!response.data.success) {
        throw new ApiError('Failed to fetch todo', response.status);
      }

      return this.mapDtoToTodo(response.data.data);
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) {
        return undefined;
      }
      this.handleError(error, 'Failed to fetch todo');
      throw error;
    }
  }

  async getActive(): Promise<Todo[]> {
    try {
      const response = await this.httpClient.get<TodoListResponse>(
        this.apiConfig.endpoints.todos.active
      );

      if (!response.data.success) {
        throw new ApiError('Failed to fetch active todos', response.status);
      }

      return response.data.data.map((dto) => this.mapDtoToTodo(dto));
    } catch (error) {
      this.handleError(error, 'Failed to fetch active todos');
      throw error;
    }
  }

  async getCompleted(): Promise<Todo[]> {
    try {
      const response = await this.httpClient.get<TodoListResponse>(
        this.apiConfig.endpoints.todos.completed
      );

      if (!response.data.success) {
        throw new ApiError('Failed to fetch completed todos', response.status);
      }

      return response.data.data.map((dto: TodoDto) => this.mapDtoToTodo(dto));
    } catch (error) {
      this.handleError(error, 'Failed to fetch completed todos');
      throw error;
    }
  }

  async findBySpecification(
    specification: Specification<Todo>
  ): Promise<Todo[]> {
    // For API-based repository, we'll fetch all todos and filter client-side
    // In a production app, you might want to send the specification to the server
    const allTodos = await this.getAll();
    return allTodos.filter((todo) => specification.isSatisfiedBy(todo));
  }

  /**
   * Maps a DTO from the API to a Todo entity
   */
  private mapDtoToTodo(dto: TodoDto): Todo {
    return new Todo(
      dto.title,
      dto.completed,
      new Date(dto.createdAt),
      dto.id,
      (dto.priority || 'medium') as TodoPriorityLevel,
      dto.dueDate ? new Date(dto.dueDate) : undefined
    );
  }

  /**
   * Centralized error handling for API operations
   * Provides consistent logging and error transformation
   */
  private handleError(error: unknown, context: string): void {
    // Log error for debugging (could be replaced with proper logging service)
    console.error(`${context}:`, error);

    // Convert non-ApiError instances to ApiError for consistency
    if (!(error instanceof ApiError)) {
      const message = error instanceof Error ? error.message : context;
      throw new ApiError(
        message,
        0,
        { originalError: error }
      );
    }
  }
}
