import { injectable, inject } from 'tsyringe';
import { Todo } from '@task-app-nx/shared-domain';
import type { ITodoRepository } from '../interfaces/ITodoRepository';
import type { ToggleTodoCommand } from '../dto/TodoCommands';
import { UpdateTodoUseCase } from './UpdateTodoUseCase';


/**
 * Use Case for toggling a Todo's completion status
 * Handles business logic for todo completion/incompletion
 */
@injectable()
export class ToggleTodoUseCase {
  constructor(
    @inject("ITodoRepository") private todoRepository: ITodoRepository,
    @inject("TOKENS.UpdateTodoUseCase") private updateTodoUseCase: UpdateTodoUseCase
  ) {}

  async execute(command: ToggleTodoCommand): Promise<Todo> {
    // Business logic: Check if todo exists
    const existingTodo = await this.todoRepository.getById(command.id);
    if (!existingTodo) {
      throw new Error('Todo not found');
    }

    // Additional business logic could be added here:
    // - Check permissions
    // - Log completion event
    // - Send notifications
    // - Update completion timestamp
    // - Check dependencies (block completion if subtasks incomplete)
    // - Award points/achievements for completion

    // Delegate to UpdateTodoUseCase for consistency
    const updateCommand = {
      id: command.id,
      completed: !existingTodo.completed
    };
    
    return await this.updateTodoUseCase.execute(updateCommand);
  }
}
