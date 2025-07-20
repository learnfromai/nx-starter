import type { Todo } from '@nx-starter/domain-core';
import { inject,injectable } from 'tsyringe';

import { TOKENS } from '../di/tokens';
import type {
  CreateTodoCommand,
  DeleteTodoCommand,
  ToggleTodoCommand,
  UpdateTodoCommand,
} from '../dto/TodoCommands';
import type {
  CreateTodoData,
  ITodoCommandService,
  UpdateTodoData,
} from '../interfaces/ITodoService';
import { CreateTodoUseCase } from '../use-cases/commands/CreateTodoUseCase';
import { DeleteTodoUseCase } from '../use-cases/commands/DeleteTodoUseCase';
import { ToggleTodoUseCase } from '../use-cases/commands/ToggleTodoUseCase';
import { UpdateTodoUseCase } from '../use-cases/commands/UpdateTodoUseCase';

/**
 * Command Service implementing Command Responsibility Segregation
 * Handles all write operations (Create, Update, Delete)
 * Follows Single Responsibility Principle and Clean Architecture
 */
@injectable()
export class TodoCommandService implements ITodoCommandService {
  constructor(
    @inject(TOKENS.CreateTodoUseCase)
    private createTodoUseCase: CreateTodoUseCase,
    @inject(TOKENS.UpdateTodoUseCase)
    private updateTodoUseCase: UpdateTodoUseCase,
    @inject(TOKENS.DeleteTodoUseCase)
    private deleteTodoUseCase: DeleteTodoUseCase,
    @inject(TOKENS.ToggleTodoUseCase)
    private toggleTodoUseCase: ToggleTodoUseCase
  ) {}

  async createTodo(data: CreateTodoData): Promise<Todo> {
    const command: CreateTodoCommand = {
      title: data.title,
      priority: data.priority || 'medium',
      dueDate: data.dueDate,
    };
    return await this.createTodoUseCase.execute(command);
  }

  async updateTodo(id: string, updates: UpdateTodoData): Promise<Todo> {
    const command: UpdateTodoCommand = {
      id,
      title: updates.title,
      completed: updates.completed,
      priority: updates.priority,
      dueDate: updates.dueDate,
    };
    return await this.updateTodoUseCase.execute(command);
  }

  async deleteTodo(id: string): Promise<void> {
    const command: DeleteTodoCommand = { id };
    return await this.deleteTodoUseCase.execute(command);
  }

  async toggleTodo(id: string): Promise<Todo> {
    const command: ToggleTodoCommand = { id };
    return await this.toggleTodoUseCase.execute(command);
  }
}
