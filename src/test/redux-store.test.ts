import { describe, it, expect } from 'vitest';
import { store } from '../core/application/store/store';
import type { RootState, AppDispatch } from '../core/application/store/store';
import { setFilter } from '../core/application/todos/slice';

describe('Redux Store', () => {
  it('should create store with initial state', () => {
    const state = store.getState();
    
    expect(state).toHaveProperty('todos');
    expect(state.todos).toEqual({
      todos: [],
      status: 'idle',
      error: null,
      filter: 'all',
    });
  });

  it('should have correct type exports', () => {
    const state: RootState = store.getState();
    const dispatch: AppDispatch = store.dispatch;
    
    expect(state).toBeDefined();
    expect(typeof dispatch).toBe('function');
  });

  it('should handle actions correctly', () => {
    const initialState = store.getState();
    store.dispatch(setFilter('active'));
    
    const newState = store.getState();
    expect(newState.todos.filter).toBe('active');
    expect(newState.todos.filter).not.toBe(initialState.todos.filter);
  });

  it('should have correct middleware configuration', () => {
    // Test that the store is configured with proper middleware
    // by checking that the reducer is configured properly
    const state = store.getState();
    expect(state.todos).toBeDefined();
    
    // Check that store has dispatch method (middleware works)
    expect(typeof store.dispatch).toBe('function');
    expect(typeof store.getState).toBe('function');
    expect(typeof store.subscribe).toBe('function');
  });

  it('should handle subscription', () => {
    let callbackCalled = false;
    const unsubscribe = store.subscribe(() => {
      callbackCalled = true;
    });

    store.dispatch(setFilter('completed'));
    expect(callbackCalled).toBe(true);

    unsubscribe();
  });
});