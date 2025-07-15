// Shared types for Task App
export type TodoPriorityLevel = 'low' | 'medium' | 'high';

export interface TodoDTO {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  priority: TodoPriorityLevel;
  dueDate?: string;
}

export interface CreateTodoRequest {
  title: string;
  priority?: TodoPriorityLevel;
  dueDate?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  completed?: boolean;
  priority?: TodoPriorityLevel;
  dueDate?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Filter and Query types
export interface TodoFilters {
  completed?: boolean;
  priority?: TodoPriorityLevel;
  search?: string;
  dueAfter?: string;
  dueBefore?: string;
}

export interface TodoQuery {
  filters?: TodoFilters;
  sort?: 'createdAt' | 'priority' | 'dueDate' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}