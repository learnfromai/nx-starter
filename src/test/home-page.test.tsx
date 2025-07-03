import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomePage } from '../presentation/pages/HomePage';
import { Todo } from '../core/domain/entities/Todo';
import React from 'react';

// Mock the view model hook
const mockUseTodoViewModel = vi.fn();
vi.mock('../presentation/view-models/useTodoViewModel', () => ({
  useTodoViewModel: () => mockUseTodoViewModel(),
}));

describe('HomePage', () => {
  const defaultViewModel = {
    todos: [],
    filter: 'all' as const,
    stats: { total: 0, active: 0, completed: 0 },
    isLoading: false,
    hasError: false,
    error: null,
    createTodo: vi.fn().mockResolvedValue(undefined),
    updateTodo: vi.fn().mockResolvedValue(undefined),
    deleteTodo: vi.fn().mockResolvedValue(undefined),
    toggleTodo: vi.fn().mockResolvedValue(undefined),
    changeFilter: vi.fn(),
    dismissError: vi.fn(),
    refreshTodos: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTodoViewModel.mockReturnValue(defaultViewModel);
  });

  it('should render without error', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Todo App')).toBeDefined();
    expect(screen.getByText('Built with Clean Architecture & MVVM')).toBeDefined();
  });

  it('should render TodoForm component', () => {
    render(<HomePage />);
    
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Add Todo' })).toBeDefined();
  });

  it('should render TodoStats component with correct props', () => {
    const stats = { total: 5, active: 3, completed: 2 };
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      stats,
      filter: 'active',
    });

    render(<HomePage />);
    
    expect(screen.getByText('Total: 5')).toBeDefined();
    expect(screen.getByText('Active: 3')).toBeDefined();
    expect(screen.getByText('Completed: 2')).toBeDefined();
    
    // Check that filter buttons are rendered
    expect(screen.getByRole('button', { name: 'All' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Active' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Completed' })).toBeDefined();
  });

  it('should render TodoList component with todos', () => {
    const todos = [
      new Todo('Todo 1', false, new Date(), 1),
      new Todo('Todo 2', true, new Date(), 2),
    ];

    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      todos,
    });

    render(<HomePage />);
    
    expect(screen.getByText('Todo 1')).toBeDefined();
    expect(screen.getByText('Todo 2')).toBeDefined();
  });

  it('should handle form submission', async () => {
    const user = userEvent.setup();
    const createTodoMock = vi.fn().mockResolvedValue(undefined);
    
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      createTodo: createTodoMock,
    });

    render(<HomePage />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.type(input, 'New todo');
    await user.click(button);
    
    expect(createTodoMock).toHaveBeenCalledWith('New todo');
  });

  it('should handle filter changes', async () => {
    const user = userEvent.setup();
    const changeFilterMock = vi.fn();
    
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      changeFilter: changeFilterMock,
    });

    render(<HomePage />);
    
    const activeButton = screen.getByRole('button', { name: 'Active' });
    await user.click(activeButton);
    
    expect(changeFilterMock).toHaveBeenCalledWith('active');
  });

  it('should display error message when there is an error', () => {
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      hasError: true,
      error: 'Network error occurred',
    });

    render(<HomePage />);
    
    expect(screen.getByText('Error')).toBeDefined();
    expect(screen.getByText('Network error occurred')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeDefined();
  });

  it('should handle error retry action', async () => {
    const user = userEvent.setup();
    const refreshTodosMock = vi.fn();
    
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      hasError: true,
      error: 'Network error',
      refreshTodos: refreshTodosMock,
    });

    render(<HomePage />);
    
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    await user.click(retryButton);
    
    expect(refreshTodosMock).toHaveBeenCalled();
  });

  it('should handle error dismiss action', async () => {
    const user = userEvent.setup();
    const dismissErrorMock = vi.fn();
    
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      hasError: true,
      error: 'Network error',
      dismissError: dismissErrorMock,
    });

    render(<HomePage />);
    
    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    await user.click(dismissButton);
    
    expect(dismissErrorMock).toHaveBeenCalled();
  });

  it('should not display error section when there is no error', () => {
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      hasError: false,
      error: null,
    });

    render(<HomePage />);
    
    expect(screen.queryByText('Error')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
  });

  it('should pass loading state to components', () => {
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      isLoading: true,
    });

    render(<HomePage />);
    
    // Form should be disabled when loading
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    expect(input).toHaveProperty('disabled', true);
    expect(button).toHaveProperty('disabled', true);
  });

  it('should pass correct handlers to TodoList', async () => {
    const user = userEvent.setup();
    const toggleTodoMock = vi.fn().mockResolvedValue(undefined);
    const deleteTodoMock = vi.fn().mockResolvedValue(undefined);
    const updateTodoMock = vi.fn().mockResolvedValue(undefined);
    
    const todos = [new Todo('Test todo', false, new Date(), 1)];
    
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      todos,
      toggleTodo: toggleTodoMock,
      deleteTodo: deleteTodoMock,
      updateTodo: updateTodoMock,
    });

    render(<HomePage />);
    
    // Test toggle functionality
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(toggleTodoMock).toHaveBeenCalledWith(1);
    
    // Test delete functionality
    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteButton);
    expect(deleteTodoMock).toHaveBeenCalledWith(1);
  });

  it('should render with empty state when no todos', () => {
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      todos: [],
      stats: { total: 0, active: 0, completed: 0 },
    });

    render(<HomePage />);
    
    expect(screen.getByText('No todos yet')).toBeDefined();
    expect(screen.getByText('Add your first todo to get started!')).toBeDefined();
  });

  it('should show loading state in TodoList', () => {
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      isLoading: true,
      todos: [],
    });

    render(<HomePage />);
    
    expect(screen.getByText('Loading todos...')).toBeDefined();
  });

  it('should use MainLayout component', () => {
    render(<HomePage />);
    
    // Check that MainLayout is used by verifying its structure
    expect(screen.getByText('Todo App')).toBeDefined();
    expect(screen.getByText('Built with Clean Architecture & MVVM')).toBeDefined();
    
    // Check that the main content area exists
    const container = screen.getByText('Todo App').closest('.container');
    expect(container).toBeDefined();
  });

  it('should handle multiple simultaneous user interactions', async () => {
    const user = userEvent.setup();
    const createTodoMock = vi.fn().mockResolvedValue(undefined);
    const changeFilterMock = vi.fn();
    
    const todos = [new Todo('Existing todo', false, new Date(), 1)];
    
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      todos,
      createTodo: createTodoMock,
      changeFilter: changeFilterMock,
      stats: { total: 1, active: 1, completed: 0 },
    });

    render(<HomePage />);
    
    // Create a new todo
    const input = screen.getByPlaceholderText('What needs to be done?');
    const addButton = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.type(input, 'Another todo');
    await user.click(addButton);
    
    // Change filter
    const activeButton = screen.getByRole('button', { name: 'Active' });
    await user.click(activeButton);
    
    expect(createTodoMock).toHaveBeenCalledWith('Another todo');
    expect(changeFilterMock).toHaveBeenCalledWith('active');
  });
});