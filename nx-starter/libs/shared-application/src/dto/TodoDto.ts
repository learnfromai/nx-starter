/**
 * Data Transfer Objects for Todo operations
 * Unified DTOs that support both frontend and backend environments
 */

export interface TodoDto {
  id: string;
  title: string;
  completed: boolean;
  priority: string; // Made required to match backend
  createdAt: string;
  updatedAt: string; // Include for frontend compatibility
  dueDate?: string; // Optional to support backend feature
}

export interface CreateTodoDto {
  title: string;
  priority?: string;
  dueDate?: string; // Support backend dueDate feature
}

export interface UpdateTodoDto {
  title?: string;
  completed?: boolean;
  priority?: string;
  dueDate?: string; // Support backend dueDate feature
}

export interface TodoStatsDto {
  total: number;
  active: number;
  completed: number;
  overdue?: number; // Optional for environments that don't support due dates
  highPriority?: number; // Optional for environments with different priority logic
}

export interface TodoFilterDto {
  completed?: boolean;
  priority?: string;
  search?: string;
}