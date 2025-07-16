/**
 * Command DTOs for CQRS pattern
 * Unified commands that support both frontend and backend environments
 */

// Priority type to support both literal strings and domain types
export type TodoPriorityLevel = 'low' | 'medium' | 'high';

/**
 * Command for creating a new todo
 */
export interface CreateTodoCommand {
  title: string;
  priority?: TodoPriorityLevel;
  dueDate?: Date;
}

/**
 * Command for updating an existing todo
 */
export interface UpdateTodoCommand {
  id: string;
  title?: string;
  completed?: boolean;
  priority?: TodoPriorityLevel;
  dueDate?: Date;
}

/**
 * Command for deleting a todo
 */
export interface DeleteTodoCommand {
  id: string;
}

/**
 * Command for toggling todo completion status
 */
export interface ToggleTodoCommand {
  id: string;
}