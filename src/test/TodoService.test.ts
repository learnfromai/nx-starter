import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoService } from '../core/application/services/TodoService';
import { Todo } from '../core/domain/entities/Todo';
import type { ITodoRepository } from '../core/domain/repositories/ITodoRepository';

// Create a mock repository
const createMockRepository = (): ITodoRepository => ({
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getById: vi.fn(),
  getActive: vi.fn(),
  getCompleted: vi.fn(),
});

describe('TodoService', () => {
  let todoService: TodoService;
  let mockRepository: ITodoRepository;

  beforeEach(() => {
    mockRepository = createMockRepository();
    todoService = new TodoService(mockRepository);
  });

  describe('getAllTodos', () => {
    it('should return all todos from repository', async () => {
      const mockTodos = [
        new Todo('Test Todo 1', false, new Date(), 1),
        new Todo('Test Todo 2', true, new Date(), 2),
      ];
      (mockRepository.getAll as any).mockResolvedValue(mockTodos);

      const result = await todoService.getAllTodos();

      expect(result).toEqual(mockTodos);
      expect(mockRepository.getAll).toHaveBeenCalledOnce();
    });
  });

  describe('createTodo', () => {
    it('should create a todo with valid title', async () => {
      const title = 'New Todo';
      const todoId = 1;
      (mockRepository.create as any).mockResolvedValue(todoId);

      const result = await todoService.createTodo(title);

      expect(result.title).toBe(title);
      expect(result.id).toBe(todoId);
      expect(result.completed).toBe(false);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ title, completed: false })
      );
    });

    it('should trim whitespace from title', async () => {
      const title = '  Trimmed Todo  ';
      const todoId = 1;
      (mockRepository.create as any).mockResolvedValue(todoId);

      const result = await todoService.createTodo(title);

      expect(result.title).toBe('Trimmed Todo');
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Trimmed Todo' })
      );
    });

    it('should throw error for empty title', async () => {
      await expect(todoService.createTodo('')).rejects.toThrow('Todo title cannot be empty');
      await expect(todoService.createTodo('   ')).rejects.toThrow('Todo title cannot be empty');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateTodo', () => {
    it('should update an existing todo', async () => {
      const todoId = 1;
      const existingTodo = new Todo('Original Title', false, new Date(), todoId);
      const updatedTodo = new Todo('Updated Title', false, new Date(), todoId);
      const changes = { title: 'Updated Title' };

      (mockRepository.getById as any).mockResolvedValue(existingTodo);
      (mockRepository.update as any).mockResolvedValue(undefined);
      (mockRepository.getById as any).mockResolvedValueOnce(existingTodo).mockResolvedValueOnce(updatedTodo);

      const result = await todoService.updateTodo(todoId, changes);

      expect(result).toEqual(updatedTodo);
      expect(mockRepository.update).toHaveBeenCalledWith(todoId, changes);
    });

    it('should throw error if todo not found', async () => {
      const todoId = 999;
      (mockRepository.getById as any).mockResolvedValue(undefined);

      await expect(todoService.updateTodo(todoId, { title: 'New Title' }))
        .rejects.toThrow('Todo not found');
      
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error for empty title update', async () => {
      const todoId = 1;
      const existingTodo = new Todo('Original Title', false, new Date(), todoId);
      (mockRepository.getById as any).mockResolvedValue(existingTodo);

      await expect(todoService.updateTodo(todoId, { title: '' }))
        .rejects.toThrow('Todo title cannot be empty');
      await expect(todoService.updateTodo(todoId, { title: '   ' }))
        .rejects.toThrow('Todo title cannot be empty');
      
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if todo not found after update', async () => {
      const todoId = 1;
      const existingTodo = new Todo('Original Title', false, new Date(), todoId);
      (mockRepository.getById as any).mockResolvedValueOnce(existingTodo).mockResolvedValueOnce(undefined);
      (mockRepository.update as any).mockResolvedValue(undefined);

      await expect(todoService.updateTodo(todoId, { title: 'New Title' }))
        .rejects.toThrow('Todo not found after update');
    });
  });

  describe('deleteTodo', () => {
    it('should delete an existing todo', async () => {
      const todoId = 1;
      const existingTodo = new Todo('Todo to delete', false, new Date(), todoId);
      (mockRepository.getById as any).mockResolvedValue(existingTodo);
      (mockRepository.delete as any).mockResolvedValue(undefined);

      await todoService.deleteTodo(todoId);

      expect(mockRepository.delete).toHaveBeenCalledWith(todoId);
    });

    it('should throw error if todo not found', async () => {
      const todoId = 999;
      (mockRepository.getById as any).mockResolvedValue(undefined);

      await expect(todoService.deleteTodo(todoId)).rejects.toThrow('Todo not found');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('toggleTodo', () => {
    it('should toggle todo completion status', async () => {
      const todoId = 1;
      const originalTodo = new Todo('Toggle me', false, new Date(), todoId);
      (mockRepository.getById as any).mockResolvedValue(originalTodo);
      (mockRepository.update as any).mockResolvedValue(undefined);

      const result = await todoService.toggleTodo(todoId);

      expect(result.completed).toBe(true);
      expect(result.title).toBe(originalTodo.title);
      expect(result.id).toBe(todoId);
      expect(mockRepository.update).toHaveBeenCalledWith(todoId, { completed: true });
    });

    it('should throw error if todo not found', async () => {
      const todoId = 999;
      (mockRepository.getById as any).mockResolvedValue(undefined);

      await expect(todoService.toggleTodo(todoId)).rejects.toThrow('Todo not found');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('getActiveTodos', () => {
    it('should return active todos from repository', async () => {
      const activeTodos = [
        new Todo('Active Todo 1', false, new Date(), 1),
        new Todo('Active Todo 2', false, new Date(), 2),
      ];
      (mockRepository.getActive as any).mockResolvedValue(activeTodos);

      const result = await todoService.getActiveTodos();

      expect(result).toEqual(activeTodos);
      expect(mockRepository.getActive).toHaveBeenCalledOnce();
    });
  });

  describe('getCompletedTodos', () => {
    it('should return completed todos from repository', async () => {
      const completedTodos = [
        new Todo('Completed Todo 1', true, new Date(), 1),
        new Todo('Completed Todo 2', true, new Date(), 2),
      ];
      (mockRepository.getCompleted as any).mockResolvedValue(completedTodos);

      const result = await todoService.getCompletedTodos();

      expect(result).toEqual(completedTodos);
      expect(mockRepository.getCompleted).toHaveBeenCalledOnce();
    });
  });

  describe('getTodoStats', () => {
    it('should return correct statistics', async () => {
      const allTodos = [
        new Todo('Todo 1', false, new Date(), 1),
        new Todo('Todo 2', true, new Date(), 2),
        new Todo('Todo 3', false, new Date(), 3),
      ];
      const activeTodos = [allTodos[0], allTodos[2]];
      const completedTodos = [allTodos[1]];

      (mockRepository.getAll as any).mockResolvedValue(allTodos);
      (mockRepository.getActive as any).mockResolvedValue(activeTodos);
      (mockRepository.getCompleted as any).mockResolvedValue(completedTodos);

      const result = await todoService.getTodoStats();

      expect(result).toEqual({
        total: 3,
        active: 2,
        completed: 1,
      });
    });

    it('should handle empty todo list', async () => {
      (mockRepository.getAll as any).mockResolvedValue([]);
      (mockRepository.getActive as any).mockResolvedValue([]);
      (mockRepository.getCompleted as any).mockResolvedValue([]);

      const result = await todoService.getTodoStats();

      expect(result).toEqual({
        total: 0,
        active: 0,
        completed: 0,
      });
    });
  });
});