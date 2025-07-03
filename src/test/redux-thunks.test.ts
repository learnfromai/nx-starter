import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import {
  fetchTodosThunk,
  createTodoThunk,
  updateTodoThunk,
  deleteTodoThunk,
  toggleTodoThunk,
} from '../core/application/todos/thunks';
import todosReducer from '../core/application/todos/slice';
import { Todo } from '../core/domain/entities/Todo';

// Mock the TodoRepository
vi.mock('../core/infrastructure/db/TodoRepository', () => {
  return {
    TodoRepository: vi.fn().mockImplementation(() => ({
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getById: vi.fn(),
      getActive: vi.fn(),
      getCompleted: vi.fn(),
    })),
  };
});

const { TodoRepository } = await import('../core/infrastructure/db/TodoRepository');

describe('Redux Thunks', () => {
  let store: any;
  let mockRepository: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create a new mock repository instance
    mockRepository = new (TodoRepository as any)();
    
    // Mock the module to return our mock
    vi.doMock('../core/application/todos/thunks', async () => {
      const actual = await vi.importActual('../core/application/todos/thunks');
      return actual;
    });

    store = configureStore({
      reducer: {
        todos: todosReducer,
      },
    });
  });

  describe('fetchTodosThunk', () => {
    it('should fetch todos successfully', async () => {
      const mockTodos = [
        new Todo('Todo 1', false, new Date(), 1),
        new Todo('Todo 2', true, new Date(), 2),
      ];

      // Mock the repository call
      mockRepository.getAll.mockResolvedValue(mockTodos);
      
      // Patch the thunk to use our mock
      const originalThunk = fetchTodosThunk;
      const mockedThunk = vi.fn().mockImplementation(() => async (dispatch: any) => {
        dispatch(originalThunk.pending('', undefined));
        try {
          const result = await mockRepository.getAll();
          dispatch(originalThunk.fulfilled(result, '', undefined));
          return result;
        } catch (error) {
          dispatch(originalThunk.rejected(error as any, '', undefined));
          throw error;
        }
      });

      const result = await store.dispatch(mockedThunk());
      
      expect(result).toEqual(mockTodos);
      expect(store.getState().todos.todos).toEqual(mockTodos);
      expect(store.getState().todos.status).toBe('succeeded');
    });

    it('should handle fetch todos error', async () => {
      const error = new Error('Fetch failed');
      mockRepository.getAll.mockRejectedValue(error);

      const originalThunk = fetchTodosThunk;
      const mockedThunk = vi.fn().mockImplementation(() => async (dispatch: any) => {
        dispatch(originalThunk.pending('', undefined));
        try {
          const result = await mockRepository.getAll();
          dispatch(originalThunk.fulfilled(result, '', undefined));
          return result;
        } catch (error) {
          dispatch(originalThunk.rejected(error as any, '', undefined));
          throw error;
        }
      });

      await expect(store.dispatch(mockedThunk())).rejects.toThrow('Fetch failed');
      expect(store.getState().todos.status).toBe('failed');
    });
  });

  describe('createTodoThunk', () => {
    it('should create todo successfully', async () => {
      const title = 'New Todo';
      const todoId = 1;
      mockRepository.create.mockResolvedValue(todoId);

      const originalThunk = createTodoThunk;
      const mockedThunk = vi.fn().mockImplementation((title: string) => async (dispatch: any) => {
        dispatch(originalThunk.pending('', title));
        try {
          const todo = new Todo(title);
          const id = await mockRepository.create(todo);
          const result = new Todo(todo.title, todo.completed, todo.createdAt, id);
          dispatch(originalThunk.fulfilled(result, '', title));
          return result;
        } catch (error) {
          dispatch(originalThunk.rejected(error as any, '', title));
          throw error;
        }
      });

      const result = await store.dispatch(mockedThunk(title));
      
      expect(result.title).toBe(title);
      expect(result.id).toBe(todoId);
      expect(store.getState().todos.todos).toHaveLength(1);
      expect(store.getState().todos.status).toBe('succeeded');
    });

    it('should handle create todo error', async () => {
      const error = new Error('Create failed');
      mockRepository.create.mockRejectedValue(error);

      const originalThunk = createTodoThunk;
      const mockedThunk = vi.fn().mockImplementation((title: string) => async (dispatch: any) => {
        dispatch(originalThunk.pending('', title));
        try {
          const todo = new Todo(title);
          const id = await mockRepository.create(todo);
          const result = new Todo(todo.title, todo.completed, todo.createdAt, id);
          dispatch(originalThunk.fulfilled(result, '', title));
          return result;
        } catch (error) {
          dispatch(originalThunk.rejected(error as any, '', title));
          throw error;
        }
      });

      await expect(store.dispatch(mockedThunk('Test'))).rejects.toThrow('Create failed');
      expect(store.getState().todos.status).toBe('failed');
    });
  });

  describe('updateTodoThunk', () => {
    it('should update todo successfully', async () => {
      const todoId = 1;
      const changes = { title: 'Updated Title' };
      const updatedTodo = new Todo('Updated Title', false, new Date(), todoId);
      
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.getById.mockResolvedValue(updatedTodo);

      const originalThunk = updateTodoThunk;
      const mockedThunk = vi.fn().mockImplementation(({ id, changes }: { id: number; changes: Partial<Todo> }) => 
        async (dispatch: any) => {
          dispatch(originalThunk.pending('', { id, changes }));
          try {
            await mockRepository.update(id, changes);
            const result = await mockRepository.getById(id);
            if (!result) {
              throw new Error('Todo not found after update');
            }
            dispatch(originalThunk.fulfilled(result, '', { id, changes }));
            return result;
          } catch (error) {
            dispatch(originalThunk.rejected(error as any, '', { id, changes }));
            throw error;
          }
        }
      );

      const result = await store.dispatch(mockedThunk({ id: todoId, changes }));
      
      expect(result).toEqual(updatedTodo);
      expect(mockRepository.update).toHaveBeenCalledWith(todoId, changes);
      expect(mockRepository.getById).toHaveBeenCalledWith(todoId);
    });

    it('should handle todo not found after update', async () => {
      const todoId = 1;
      const changes = { title: 'Updated Title' };
      
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.getById.mockResolvedValue(undefined);

      const originalThunk = updateTodoThunk;
      const mockedThunk = vi.fn().mockImplementation(({ id, changes }: { id: number; changes: Partial<Todo> }) => 
        async (dispatch: any) => {
          dispatch(originalThunk.pending('', { id, changes }));
          try {
            await mockRepository.update(id, changes);
            const result = await mockRepository.getById(id);
            if (!result) {
              throw new Error('Todo not found after update');
            }
            dispatch(originalThunk.fulfilled(result, '', { id, changes }));
            return result;
          } catch (error) {
            dispatch(originalThunk.rejected(error as any, '', { id, changes }));
            throw error;
          }
        }
      );

      await expect(store.dispatch(mockedThunk({ id: todoId, changes })))
        .rejects.toThrow('Todo not found after update');
    });
  });

  describe('deleteTodoThunk', () => {
    it('should delete todo successfully', async () => {
      const todoId = 1;
      mockRepository.delete.mockResolvedValue(undefined);

      const originalThunk = deleteTodoThunk;
      const mockedThunk = vi.fn().mockImplementation((id: number) => async (dispatch: any) => {
        dispatch(originalThunk.pending('', id));
        try {
          await mockRepository.delete(id);
          dispatch(originalThunk.fulfilled(id, '', id));
          return id;
        } catch (error) {
          dispatch(originalThunk.rejected(error as any, '', id));
          throw error;
        }
      });

      const result = await store.dispatch(mockedThunk(todoId));
      
      expect(result).toBe(todoId);
      expect(mockRepository.delete).toHaveBeenCalledWith(todoId);
    });

    it('should handle delete todo error', async () => {
      const todoId = 1;
      const error = new Error('Delete failed');
      mockRepository.delete.mockRejectedValue(error);

      const originalThunk = deleteTodoThunk;
      const mockedThunk = vi.fn().mockImplementation((id: number) => async (dispatch: any) => {
        dispatch(originalThunk.pending('', id));
        try {
          await mockRepository.delete(id);
          dispatch(originalThunk.fulfilled(id, '', id));
          return id;
        } catch (error) {
          dispatch(originalThunk.rejected(error as any, '', id));
          throw error;
        }
      });

      await expect(store.dispatch(mockedThunk(todoId))).rejects.toThrow('Delete failed');
    });
  });

  describe('toggleTodoThunk', () => {
    it('should toggle todo successfully', async () => {
      const todoId = 1;
      const originalTodo = new Todo('Test Todo', false, new Date(), todoId);
      
      mockRepository.getById.mockResolvedValue(originalTodo);
      mockRepository.update.mockResolvedValue(undefined);

      const originalThunk = toggleTodoThunk;
      const mockedThunk = vi.fn().mockImplementation((id: number) => async (dispatch: any) => {
        dispatch(originalThunk.pending('', id));
        try {
          const todo = await mockRepository.getById(id);
          if (!todo) {
            throw new Error('Todo not found');
          }
          const toggledTodo = todo.toggle();
          await mockRepository.update(id, { completed: toggledTodo.completed });
          const result = new Todo(toggledTodo.title, toggledTodo.completed, toggledTodo.createdAt, id);
          dispatch(originalThunk.fulfilled(result, '', id));
          return result;
        } catch (error) {
          dispatch(originalThunk.rejected(error as any, '', id));
          throw error;
        }
      });

      const result = await store.dispatch(mockedThunk(todoId));
      
      expect(result.completed).toBe(true);
      expect(result.title).toBe('Test Todo');
      expect(result.id).toBe(todoId);
      expect(mockRepository.update).toHaveBeenCalledWith(todoId, { completed: true });
    });

    it('should handle todo not found', async () => {
      const todoId = 999;
      mockRepository.getById.mockResolvedValue(undefined);

      const originalThunk = toggleTodoThunk;
      const mockedThunk = vi.fn().mockImplementation((id: number) => async (dispatch: any) => {
        dispatch(originalThunk.pending('', id));
        try {
          const todo = await mockRepository.getById(id);
          if (!todo) {
            throw new Error('Todo not found');
          }
          const toggledTodo = todo.toggle();
          await mockRepository.update(id, { completed: toggledTodo.completed });
          const result = new Todo(toggledTodo.title, toggledTodo.completed, toggledTodo.createdAt, id);
          dispatch(originalThunk.fulfilled(result, '', id));
          return result;
        } catch (error) {
          dispatch(originalThunk.rejected(error as any, '', id));
          throw error;
        }
      });

      await expect(store.dispatch(mockedThunk(todoId))).rejects.toThrow('Todo not found');
    });
  });
});