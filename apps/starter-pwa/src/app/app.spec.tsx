import { render } from '@testing-library/react';
import { vi } from 'vitest';

import App from './app';

// Mock the TodoStore
const mockTodoStore = {
  todos: [],
  filter: 'all' as const,
  status: 'idle' as const,
  error: null,
  getFilteredTodos: () => [],
  getStats: () => ({ total: 0, active: 0, completed: 0 }),
  getIsLoading: () => false,
  getIsIdle: () => true,
  getHasError: () => false,
  loadTodos: vi.fn().mockResolvedValue(undefined),
  createTodo: vi.fn().mockResolvedValue(undefined),
  updateTodo: vi.fn().mockResolvedValue(undefined),
  deleteTodo: vi.fn().mockResolvedValue(undefined),
  toggleTodo: vi.fn().mockResolvedValue(undefined),
  setFilter: vi.fn(),
  clearError: vi.fn(),
};

vi.mock('../infrastructure/state/TodoStore', () => ({
  useTodoStore: () => mockTodoStore,
}));

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should have todo app as the title', () => {
    const { getByText } = render(<App />);
    expect(getByText('Todo App')).toBeInTheDocument();
  });
});
