import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from '../presentation/components/Todo/TodoForm';
import { TodoStats } from '../presentation/components/Todo/TodoStats';
import { TodoList } from '../presentation/components/Todo/TodoList';
import { TodoItem } from '../presentation/components/Todo/TodoItem';
import { Todo } from '../core/domain/entities/Todo';
import React from 'react';

describe('Todo Components', () => {
  describe('TodoForm', () => {
    let mockOnSubmit: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    });

    it('should render form elements', () => {
      render(<TodoForm onSubmit={mockOnSubmit} />);
      
      expect(screen.getByPlaceholderText('What needs to be done?')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Add Todo' })).toBeDefined();
    });

    it('should handle form submission with valid input', async () => {
      const user = userEvent.setup();
      render(<TodoForm onSubmit={mockOnSubmit} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const button = screen.getByRole('button', { name: 'Add Todo' });
      
      await user.type(input, 'New todo item');
      await user.click(button);
      
      expect(mockOnSubmit).toHaveBeenCalledWith('New todo item');
    });

    it('should trim whitespace from input', async () => {
      const user = userEvent.setup();
      render(<TodoForm onSubmit={mockOnSubmit} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const button = screen.getByRole('button', { name: 'Add Todo' });
      
      await user.type(input, '  Trimmed todo  ');
      await user.click(button);
      
      expect(mockOnSubmit).toHaveBeenCalledWith('Trimmed todo');
    });

    it('should clear form after successful submission', async () => {
      const user = userEvent.setup();
      render(<TodoForm onSubmit={mockOnSubmit} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?') as HTMLInputElement;
      const button = screen.getByRole('button', { name: 'Add Todo' });
      
      await user.type(input, 'Test todo');
      await user.click(button);
      
      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should not submit empty form', async () => {
      const user = userEvent.setup();
      render(<TodoForm onSubmit={mockOnSubmit} />);
      
      const button = screen.getByRole('button', { name: 'Add Todo' });
      await user.click(button);
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show validation error for empty input', async () => {
      const user = userEvent.setup();
      render(<TodoForm onSubmit={mockOnSubmit} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const button = screen.getByRole('button', { name: 'Add Todo' });
      
      await user.click(input);
      await user.click(button);
      
      expect(screen.getByText('Title is required')).toBeDefined();
    });

    it('should disable form when loading', () => {
      render(<TodoForm onSubmit={mockOnSubmit} isLoading={true} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const button = screen.getByRole('button', { name: 'Add Todo' });
      
      expect(input).toHaveProperty('disabled', true);
      expect(button).toHaveProperty('disabled', true);
    });

    it('should show loading state during submission', async () => {
      let resolveSubmit: (value: void) => void;
      const slowSubmit = vi.fn(() => new Promise<void>(resolve => {
        resolveSubmit = resolve;
      }));
      
      const user = userEvent.setup();
      render(<TodoForm onSubmit={slowSubmit} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const button = screen.getByRole('button', { name: 'Add Todo' });
      
      await user.type(input, 'Test todo');
      await user.click(button);
      
      expect(screen.getByText('Adding...')).toBeDefined();
      
      // Resolve the promise
      resolveSubmit!();
      await waitFor(() => {
        expect(screen.getByText('Add Todo')).toBeDefined();
      });
    });
  });

  describe('TodoStats', () => {
    const mockOnFilterChange = vi.fn();

    beforeEach(() => {
      mockOnFilterChange.mockClear();
    });

    it('should display correct statistics', () => {
      render(
        <TodoStats
          total={5}
          active={3}
          completed={2}
          filter="all"
          onFilterChange={mockOnFilterChange}
        />
      );
      
      expect(screen.getByText('Total: 5')).toBeDefined();
      expect(screen.getByText('Active: 3')).toBeDefined();
      expect(screen.getByText('Completed: 2')).toBeDefined();
    });

    it('should highlight active filter button', () => {
      render(
        <TodoStats
          total={5}
          active={3}
          completed={2}
          filter="active"
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const allButton = screen.getByRole('button', { name: 'All' });
      const activeButton = screen.getByRole('button', { name: 'Active' });
      const completedButton = screen.getByRole('button', { name: 'Completed' });
      
      // Active button should have default variant styling
      expect(activeButton.className).toContain('bg-primary');
      // Others should have outline variant
      expect(allButton.className).toContain('border');
      expect(completedButton.className).toContain('border');
    });

    it('should call onFilterChange when filter buttons are clicked', async () => {
      const user = userEvent.setup();
      render(
        <TodoStats
          total={5}
          active={3}
          completed={2}
          filter="all"
          onFilterChange={mockOnFilterChange}
        />
      );
      
      await user.click(screen.getByRole('button', { name: 'Active' }));
      expect(mockOnFilterChange).toHaveBeenCalledWith('active');
      
      await user.click(screen.getByRole('button', { name: 'Completed' }));
      expect(mockOnFilterChange).toHaveBeenCalledWith('completed');
      
      await user.click(screen.getByRole('button', { name: 'All' }));
      expect(mockOnFilterChange).toHaveBeenCalledWith('all');
    });

    it('should handle zero statistics', () => {
      render(
        <TodoStats
          total={0}
          active={0}
          completed={0}
          filter="all"
          onFilterChange={mockOnFilterChange}
        />
      );
      
      expect(screen.getByText('Total: 0')).toBeDefined();
      expect(screen.getByText('Active: 0')).toBeDefined();
      expect(screen.getByText('Completed: 0')).toBeDefined();
    });
  });

  describe('TodoList', () => {
    const mockTodos = [
      new Todo('Todo 1', false, new Date(), 1),
      new Todo('Todo 2', true, new Date(), 2),
      new Todo('Todo 3', false, new Date(), 3),
    ];

    const mockHandlers = {
      onToggle: vi.fn().mockResolvedValue(undefined),
      onDelete: vi.fn().mockResolvedValue(undefined),
      onUpdate: vi.fn().mockResolvedValue(undefined),
    };

    beforeEach(() => {
      Object.values(mockHandlers).forEach(mock => mock.mockClear());
    });

    it('should render list of todos', () => {
      render(<TodoList todos={mockTodos} {...mockHandlers} />);
      
      expect(screen.getByText('Todo 1')).toBeDefined();
      expect(screen.getByText('Todo 2')).toBeDefined();
      expect(screen.getByText('Todo 3')).toBeDefined();
    });

    it('should show loading state', () => {
      render(<TodoList todos={[]} {...mockHandlers} isLoading={true} />);
      
      expect(screen.getByText('Loading todos...')).toBeDefined();
    });

    it('should show empty state when no todos', () => {
      render(<TodoList todos={[]} {...mockHandlers} />);
      
      expect(screen.getByText('No todos yet')).toBeDefined();
      expect(screen.getByText('Add your first todo to get started!')).toBeDefined();
    });

    it('should render TodoItem components for each todo', () => {
      render(<TodoList todos={mockTodos} {...mockHandlers} />);
      
      // Should render checkboxes for each todo
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    it('should pass handlers to TodoItem components', async () => {
      const user = userEvent.setup();
      render(<TodoList todos={[mockTodos[0]]} {...mockHandlers} />);
      
      // Test toggle
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      expect(mockHandlers.onToggle).toHaveBeenCalledWith(1);
      
      // Test delete
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(deleteButton);
      expect(mockHandlers.onDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('TodoItem', () => {
    const mockTodo = new Todo('Test todo', false, new Date(), 1);
    const mockHandlers = {
      onToggle: vi.fn().mockResolvedValue(undefined),
      onDelete: vi.fn().mockResolvedValue(undefined),
      onUpdate: vi.fn().mockResolvedValue(undefined),
    };

    beforeEach(() => {
      Object.values(mockHandlers).forEach(mock => mock.mockClear());
    });

    it('should render todo item', () => {
      render(<TodoItem todo={mockTodo} {...mockHandlers} />);
      
      expect(screen.getByText('Test todo')).toBeDefined();
      expect(screen.getByRole('checkbox')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Edit' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeDefined();
    });

    it('should show completed todo with strikethrough', () => {
      const completedTodo = new Todo('Completed todo', true, new Date(), 1);
      render(<TodoItem todo={completedTodo} {...mockHandlers} />);
      
      const todoText = screen.getByText('Completed todo');
      expect(todoText.className).toContain('line-through');
    });

    it('should toggle todo when checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockHandlers} />);
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      expect(mockHandlers.onToggle).toHaveBeenCalledWith(1);
    });

    it('should delete todo when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockHandlers} />);
      
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(deleteButton);
      
      expect(mockHandlers.onDelete).toHaveBeenCalledWith(1);
    });

    it('should enter edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockHandlers} />);
      
      const editButton = screen.getByRole('button', { name: 'Edit' });
      await user.click(editButton);
      
      expect(screen.getByDisplayValue('Test todo')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Save' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDefined();
    });

    it('should enter edit mode when todo text is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockHandlers} />);
      
      const todoText = screen.getByText('Test todo');
      await user.click(todoText);
      
      expect(screen.getByDisplayValue('Test todo')).toBeDefined();
    });

    it('should save changes when save button is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockHandlers} />);
      
      // Enter edit mode
      const editButton = screen.getByRole('button', { name: 'Edit' });
      await user.click(editButton);
      
      // Edit the text
      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);
      await user.type(input, 'Updated todo');
      
      // Save changes
      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
      
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith(1, { title: 'Updated todo' });
    });

    it('should cancel editing when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockHandlers} />);
      
      // Enter edit mode
      const editButton = screen.getByRole('button', { name: 'Edit' });
      await user.click(editButton);
      
      // Edit the text
      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);
      await user.type(input, 'Changed text');
      
      // Cancel editing
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);
      
      // Should return to view mode with original text
      expect(screen.getByText('Test todo')).toBeDefined();
      expect(mockHandlers.onUpdate).not.toHaveBeenCalled();
    });

    it('should save on Enter key and cancel on Escape key', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockHandlers} />);
      
      // Enter edit mode
      const editButton = screen.getByRole('button', { name: 'Edit' });
      await user.click(editButton);
      
      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);
      await user.type(input, 'Updated todo');
      
      // Press Enter to save
      await user.keyboard('{Enter}');
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith(1, { title: 'Updated todo' });
      
      // Reset and test Escape with a fresh component
      mockHandlers.onUpdate.mockClear();
    });

    it('should cancel editing with Escape key', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockHandlers} />);
      
      // Enter edit mode
      const editButton = screen.getByRole('button', { name: 'Edit' });
      await user.click(editButton);
      
      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);
      await user.type(input, 'Another change');
      
      // Press Escape to cancel
      await user.keyboard('{Escape}');
      expect(mockHandlers.onUpdate).not.toHaveBeenCalled();
      expect(screen.getByText('Test todo')).toBeDefined();
    });

    it('should display creation date', () => {
      const dateStr = new Date().toLocaleDateString();
      render(<TodoItem todo={mockTodo} {...mockHandlers} />);
      
      expect(screen.getByText(new RegExp(dateStr))).toBeDefined();
    });

    it('should show overdue indicator for overdue todos', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 8); // 8 days ago
      const overdueTodo = new Todo('Overdue todo', false, oldDate, 1);
      
      render(<TodoItem todo={overdueTodo} {...mockHandlers} />);
      
      expect(screen.getByText('• Overdue')).toBeDefined();
    });

    it('should not save empty title', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} {...mockHandlers} />);
      
      // Enter edit mode
      const editButton = screen.getByRole('button', { name: 'Edit' });
      await user.click(editButton);
      
      // Clear the input
      const input = screen.getByDisplayValue('Test todo');
      await user.clear(input);
      
      // Try to save empty title
      const saveButton = screen.getByRole('button', { name: 'Save' });
      expect(saveButton).toHaveProperty('disabled', true);
    });
  });
});