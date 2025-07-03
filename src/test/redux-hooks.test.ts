import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '../presentation/hooks/redux';
import todosReducer, { setFilter } from '../core/application/todos/slice';
import React, { type ReactNode } from 'react';

// Create a test store
const createTestStore = () => configureStore({
  reducer: {
    todos: todosReducer,
  },
});

// Wrapper component for testing hooks
const createWrapper = (store: ReturnType<typeof createTestStore>) => {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return React.createElement(Provider, { store, children });
  };
  return Wrapper;
};

describe('Redux Hooks', () => {
  describe('useAppDispatch', () => {
    it('should return dispatch function', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAppDispatch(), { wrapper });

      expect(typeof result.current).toBe('function');
    });

    it('should dispatch actions correctly', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAppDispatch(), { wrapper });
      
      // Dispatch an action
      result.current(setFilter('active'));
      
      // Check that the store state was updated
      expect(store.getState().todos.filter).toBe('active');
    });
  });

  describe('useAppSelector', () => {
    it('should select state correctly', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () => useAppSelector(state => state.todos.filter),
        { wrapper }
      );

      expect(result.current).toBe('all');
    });

    it('should update when state changes', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () => useAppSelector(state => state.todos.filter),
        { wrapper }
      );

      expect(result.current).toBe('all');

      // Dispatch an action to change state
      act(() => {
        store.dispatch(setFilter('completed'));
      });

      expect(result.current).toBe('completed');
    });

    it('should have correct type safety', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () => useAppSelector(state => {
          // This should have full type safety
          const todosState = state.todos;
          return {
            todos: todosState.todos,
            filter: todosState.filter,
            status: todosState.status,
            error: todosState.error,
          };
        }),
        { wrapper }
      );

      expect(result.current).toEqual({
        todos: [],
        filter: 'all',
        status: 'idle',
        error: null,
      });
    });
  });
});