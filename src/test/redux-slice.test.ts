import { describe, it, expect } from 'vitest';
import todosReducer, { 
  setFilter, 
  clearError, 
  selectTodos, 
  selectFilteredTodos,
  type TodosState 
} from '../core/application/todos/slice';
import { 
  fetchTodosThunk, 
  createTodoThunk, 
  updateTodoThunk, 
  deleteTodoThunk,
  toggleTodoThunk
} from '../core/application/todos/thunks';
import { Todo } from '../core/domain/entities/Todo';

describe('todos slice', () => {
  const initialState: TodosState = {
    todos: [],
    status: 'idle',
    error: null,
    filter: 'all',
  };

  const mockTodos = [
    new Todo('Todo 1', false, new Date(), 1),
    new Todo('Todo 2', true, new Date(), 2),
    new Todo('Todo 3', false, new Date(), 3),
  ];

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(todosReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setFilter', () => {
      const actual = todosReducer(initialState, setFilter('active'));
      expect(actual.filter).toEqual('active');
    });

    it('should handle clearError', () => {
      const stateWithError: TodosState = {
        ...initialState,
        error: 'Some error',
      };
      const actual = todosReducer(stateWithError, clearError());
      expect(actual.error).toBeNull();
    });
  });

  describe('fetchTodosThunk', () => {
    it('should handle pending state', () => {
      const action = { type: fetchTodosThunk.pending.type };
      const actual = todosReducer(initialState, action);
      
      expect(actual.status).toBe('loading');
    });

    it('should handle fulfilled state', () => {
      const action = { 
        type: fetchTodosThunk.fulfilled.type, 
        payload: mockTodos 
      };
      const actual = todosReducer(initialState, action);
      
      expect(actual.status).toBe('succeeded');
      expect(actual.todos).toEqual(mockTodos);
    });

    it('should handle rejected state', () => {
      const action = { 
        type: fetchTodosThunk.rejected.type, 
        error: { message: 'Failed to fetch' }
      };
      const actual = todosReducer(initialState, action);
      
      expect(actual.status).toBe('failed');
      expect(actual.error).toBe('Failed to fetch');
    });

    it('should handle rejected state with default error message', () => {
      const action = { 
        type: fetchTodosThunk.rejected.type, 
        error: {}
      };
      const actual = todosReducer(initialState, action);
      
      expect(actual.status).toBe('failed');
      expect(actual.error).toBe('Failed to fetch todos');
    });
  });

  describe('createTodoThunk', () => {
    it('should handle pending state', () => {
      const action = { type: createTodoThunk.pending.type };
      const actual = todosReducer(initialState, action);
      
      expect(actual.status).toBe('loading');
    });

    it('should handle fulfilled state', () => {
      const newTodo = new Todo('New Todo', false, new Date(), 4);
      const stateWithTodos: TodosState = {
        ...initialState,
        todos: mockTodos,
      };
      const action = { 
        type: createTodoThunk.fulfilled.type, 
        payload: newTodo 
      };
      const actual = todosReducer(stateWithTodos, action);
      
      expect(actual.status).toBe('succeeded');
      expect(actual.todos[0]).toEqual(newTodo);
      expect(actual.todos.length).toBe(4);
    });

    it('should handle rejected state', () => {
      const action = { 
        type: createTodoThunk.rejected.type, 
        error: { message: 'Failed to create' }
      };
      const actual = todosReducer(initialState, action);
      
      expect(actual.status).toBe('failed');
      expect(actual.error).toBe('Failed to create');
    });

    it('should handle rejected state with default error message', () => {
      const action = { 
        type: createTodoThunk.rejected.type, 
        error: {}
      };
      const actual = todosReducer(initialState, action);
      
      expect(actual.status).toBe('failed');
      expect(actual.error).toBe('Failed to create todo');
    });
  });

  describe('updateTodoThunk', () => {
    it('should handle fulfilled state', () => {
      const updatedTodo = new Todo('Updated Todo', false, new Date(), 1);
      const stateWithTodos: TodosState = {
        ...initialState,
        todos: mockTodos,
      };
      const action = { 
        type: updateTodoThunk.fulfilled.type, 
        payload: updatedTodo 
      };
      const actual = todosReducer(stateWithTodos, action);
      
      expect(actual.todos[0]).toEqual(updatedTodo);
    });

    it('should not modify state if todo not found', () => {
      const updatedTodo = new Todo('Updated Todo', false, new Date(), 999);
      const stateWithTodos: TodosState = {
        ...initialState,
        todos: mockTodos,
      };
      const action = { 
        type: updateTodoThunk.fulfilled.type, 
        payload: updatedTodo 
      };
      const actual = todosReducer(stateWithTodos, action);
      
      expect(actual.todos).toEqual(mockTodos);
    });
  });

  describe('deleteTodoThunk', () => {
    it('should handle fulfilled state', () => {
      const stateWithTodos: TodosState = {
        ...initialState,
        todos: mockTodos,
      };
      const action = { 
        type: deleteTodoThunk.fulfilled.type, 
        payload: 1 
      };
      const actual = todosReducer(stateWithTodos, action);
      
      expect(actual.todos.length).toBe(2);
      expect(actual.todos.find(todo => todo.id === 1)).toBeUndefined();
    });
  });

  describe('toggleTodoThunk', () => {
    it('should handle fulfilled state', () => {
      const toggledTodo = new Todo('Todo 1', true, new Date(), 1);
      const stateWithTodos: TodosState = {
        ...initialState,
        todos: mockTodos,
      };
      const action = { 
        type: toggleTodoThunk.fulfilled.type, 
        payload: toggledTodo 
      };
      const actual = todosReducer(stateWithTodos, action);
      
      expect(actual.todos[0]).toEqual(toggledTodo);
    });

    it('should not modify state if todo not found', () => {
      const toggledTodo = new Todo('Todo 999', true, new Date(), 999);
      const stateWithTodos: TodosState = {
        ...initialState,
        todos: mockTodos,
      };
      const action = { 
        type: toggleTodoThunk.fulfilled.type, 
        payload: toggledTodo 
      };
      const actual = todosReducer(stateWithTodos, action);
      
      expect(actual.todos).toEqual(mockTodos);
    });
  });

  describe('selectors', () => {
    const rootState = {
      todos: {
        todos: mockTodos,
        status: 'succeeded' as const,
        error: null,
        filter: 'all' as const,
      },
    };

    it('should select todos state', () => {
      const result = selectTodos(rootState);
      expect(result).toEqual(rootState.todos);
    });

    it('should select all todos when filter is "all"', () => {
      const result = selectFilteredTodos(rootState);
      expect(result).toEqual(mockTodos);
    });

    it('should select active todos when filter is "active"', () => {
      const stateWithActiveFilter = {
        todos: {
          ...rootState.todos,
          filter: 'active' as const,
        },
      };
      const result = selectFilteredTodos(stateWithActiveFilter);
      const expectedTodos = mockTodos.filter(todo => !todo.completed);
      expect(result).toEqual(expectedTodos);
    });

    it('should select completed todos when filter is "completed"', () => {
      const stateWithCompletedFilter = {
        todos: {
          ...rootState.todos,
          filter: 'completed' as const,
        },
      };
      const result = selectFilteredTodos(stateWithCompletedFilter);
      const expectedTodos = mockTodos.filter(todo => todo.completed);
      expect(result).toEqual(expectedTodos);
    });
  });
});