import { Todo, TodoPriorityLevel } from '@task-app-nx/shared-domain';
import type { TodoDto, CreateTodoDto } from '../dto/TodoDto';

export class TodoMapper {
  static toDto(todo: Todo): TodoDto {
    return {
      id: todo.id?.value.toString() || '',
      title: todo.title.value,
      completed: todo.completed,
      priority: todo.priority.toString(),
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.createdAt.toISOString() // Using createdAt since Todo doesn't have updatedAt
    };
  }

  static toDtoArray(todos: Todo[]): TodoDto[] {
    return todos.map(this.toDto);
  }

  static toDomain(dto: TodoDto): Todo {
    return new Todo(
      dto.title,
      dto.completed,
      new Date(dto.createdAt),
      dto.id || undefined,
      dto.priority as TodoPriorityLevel
    );
  }

  static createToDomain(dto: CreateTodoDto): Todo {
    return new Todo(
      dto.title,
      false,
      new Date(),
      undefined,
      dto.priority as TodoPriorityLevel
    );
  }
}
