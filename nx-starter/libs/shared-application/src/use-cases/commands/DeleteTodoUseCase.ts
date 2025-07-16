import type { ITodoRepository } from '@nx-starter/shared-domain';
import type { DeleteTodoCommand } from '../../dto/TodoCommands';

/**
 * Use Case for deleting a Todo item
 * Handles business logic and validation for todo deletion
 */
export class DeleteTodoUseCase {
  constructor(private todoRepository: ITodoRepository) {}

  async execute(command: DeleteTodoCommand): Promise<void> {
    // Business logic: Check if todo exists before deletion
    const existingTodo = await this.todoRepository.getById(command.id);
    if (!existingTodo) {
      throw new Error('Todo not found');
    }

    // Additional business logic could be added here:
    // - Check permissions
    // - Log deletion event
    // - Send notifications
    // - Archive instead of delete (soft delete)
    // - Check dependencies

    await this.todoRepository.delete(command.id);
  }
}