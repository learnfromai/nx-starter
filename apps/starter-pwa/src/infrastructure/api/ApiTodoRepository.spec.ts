import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiTodoRepository } from './ApiTodoRepository';
import { IHttpClient, HttpResponse } from './http/IHttpClient';
import { ApiError } from './errors/ApiError';
import { Todo, TodoPriorityLevel } from '@nx-starter/domain-core';
import { TodoListResponse, TodoResponse } from '@nx-starter/application-core';

// Mock HTTP client
const mockHttpClient: IHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

describe('ApiTodoRepository', () => {
  let repository: ApiTodoRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new ApiTodoRepository(mockHttpClient);
  });

  describe('getAll', () => {
    it('should return todos when API call succeeds', async () => {
      const mockTodos = [
        {
          id: '550e8400e29b41d4a716446655440000',
          title: 'Test Todo',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          priority: 'medium',
        },
      ];

      const mockResponse: HttpResponse<TodoListResponse> = {
        data: {
          success: true,
          data: mockTodos,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await repository.getAll();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/todos');
      expect(result).toHaveLength(1);
      expect(result[0].titleValue).toBe('Test Todo');
      expect(result[0].completed).toBe(false);
    });

    it('should throw ApiError when API call fails', async () => {
      const mockResponse: HttpResponse<TodoListResponse> = {
        data: {
          success: false,
        },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      await expect(repository.getAll()).rejects.toThrow(ApiError);
    });

    it('should handle network errors', async () => {
      const networkError = new ApiError('Network error', 0);
      mockHttpClient.get.mockRejectedValue(networkError);

      await expect(repository.getAll()).rejects.toThrow(ApiError);
    });
  });

  describe('create', () => {
    it('should create todo and return ID', async () => {
      const todo = new Todo(
        'New Todo',
        false,
        new Date(),
        undefined,
        'high' as TodoPriorityLevel
      );

      const mockResponse: HttpResponse<TodoResponse> = {
        data: {
          success: true,
          data: {
            id: '550e8400e29b41d4a716446655440001',
            title: 'New Todo',
            completed: false,
            createdAt: '2023-01-01T00:00:00.000Z',
            priority: 'high',
          },
        },
        status: 201,
        statusText: 'Created',
        headers: {},
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await repository.create(todo);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/todos', {
        title: 'New Todo',
        priority: 'high',
        dueDate: undefined,
      });
      expect(result).toBe('550e8400e29b41d4a716446655440001');
    });
  });

  describe('update', () => {
    it('should update todo successfully', async () => {
      const mockResponse: HttpResponse<unknown> = {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
      };

      mockHttpClient.put.mockResolvedValue(mockResponse);

      await repository.update('123', { completed: true });

      expect(mockHttpClient.put).toHaveBeenCalledWith('/api/todos/123', {
        completed: true,
      });
    });
  });

  describe('delete', () => {
    it('should delete todo successfully', async () => {
      const mockResponse: HttpResponse<unknown> = {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
      };

      mockHttpClient.delete.mockResolvedValue(mockResponse);

      await repository.delete('123');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/api/todos/123');
    });
  });

  describe('getById', () => {
    it('should return todo when found', async () => {
      const mockTodo = {
        id: '550e8400e29b41d4a716446655440002',
        title: 'Test Todo',
        completed: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        priority: 'medium',
      };

      const mockResponse: HttpResponse<TodoResponse> = {
        data: {
          success: true,
          data: mockTodo,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await repository.getById('550e8400e29b41d4a716446655440002');

      expect(result).toBeDefined();
      expect(result?.titleValue).toBe('Test Todo');
    });

    it('should return undefined when todo not found', async () => {
      const notFoundError = new ApiError('Not found', 404);
      mockHttpClient.get.mockRejectedValue(notFoundError);

      const result = await repository.getById('nonexistent');

      expect(result).toBeUndefined();
    });
  });
});