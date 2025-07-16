import { Todo } from '@nx-starter/shared-domain';
import type { TodoDto, CreateTodoDto } from '../dto/TodoDto';
import { type TodoPriorityLevel } from '../dto/TodoCommands';

/**
 * Unified mapper for converting between Todo entities and DTOs
 * Supports both frontend and backend mapping requirements
 */
export class TodoMapper {
  /**
   * Maps a Todo entity to a TodoDto
   * Supports both frontend and backend DTO requirements
   */
  static toDto(todo: Todo): TodoDto {
    return {
      id: todo.id?.value?.toString() || todo.stringId || '',
      title: todo.title?.value || todo.titleValue,
      completed: todo.completed,
      priority: todo.priority?.level || todo.priority?.toString() || 'medium',
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.createdAt.toISOString(), // Fallback for frontend compatibility
      dueDate: todo.dueDate?.toISOString(), // Support backend dueDate feature
    };
  }

  /**
   * Maps an array of Todo entities to TodoDtos
   */
  static toDtoArray(todos: Todo[]): TodoDto[] {
    return todos.map(todo => this.toDto(todo));
  }

  /**
   * Maps a TodoDto to a Todo entity
   */
  static toDomain(dto: TodoDto): Todo {
    return new Todo(
      dto.title,
      dto.completed,
      new Date(dto.createdAt),
      dto.id || undefined,
      dto.priority as TodoPriorityLevel,
      dto.dueDate ? new Date(dto.dueDate) : undefined
    );
  }

  /**
   * Maps a CreateTodoDto to a Todo entity
   */
  static createToDomain(dto: CreateTodoDto): Todo {
    return new Todo(
      dto.title,
      false,
      new Date(),
      undefined,
      (dto.priority as TodoPriorityLevel) || 'medium',
      dto.dueDate ? new Date(dto.dueDate) : undefined
    );
  }

  /**
   * Maps a plain object from database to Todo entity
   * This method is useful for ORM mapping (backend)
   */
  static fromPlainObject(obj: {
    id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
    priority?: string;
    dueDate?: Date;
  }): Todo {
    return new Todo(
      obj.title,
      obj.completed,
      obj.createdAt,
      obj.id,
      (obj.priority as TodoPriorityLevel) || 'medium',
      obj.dueDate
    );
  }

  /**
   * Maps Todo entity to plain object for database storage
   * Useful for backend persistence (backend)
   */
  static toPlainObject(
    todo: Todo,
    id?: string
  ): {
    id?: string;
    title: string;
    completed: boolean;
    createdAt: Date;
    priority: string;
    dueDate?: Date;
  } {
    return {
      ...(id && { id }),
      title: todo.title?.value || todo.titleValue,
      completed: todo.completed,
      createdAt: todo.createdAt,
      priority: todo.priority?.level || todo.priority?.toString() || 'medium',
      dueDate: todo.dueDate,
    };
  }
}