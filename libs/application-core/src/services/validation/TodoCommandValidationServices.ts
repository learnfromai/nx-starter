import { injectable } from 'tsyringe';
import { BaseValidationService } from './BaseValidationService';
import { 
  CreateTodoCommandSchema, 
  UpdateTodoCommandSchema, 
  DeleteTodoCommandSchema, 
  ToggleTodoCommandSchema,
  CreateTodoCommand,
  UpdateTodoCommand,
  DeleteTodoCommand,
  ToggleTodoCommand
} from './TodoCommandSchemas';

/**
 * Validation service for CreateTodoCommand
 * Implements OOP approach with dependency injection
 */
@injectable()
export class CreateTodoCommandValidationService extends BaseValidationService<unknown, CreateTodoCommand> {
  validate(data: unknown): CreateTodoCommand {
    return CreateTodoCommandSchema.parse(data);
  }
}

/**
 * Validation service for UpdateTodoCommand
 * Handles ID merging for route parameters
 */
@injectable()
export class UpdateTodoCommandValidationService extends BaseValidationService<unknown, UpdateTodoCommand> {
  validate(data: unknown): UpdateTodoCommand {
    return UpdateTodoCommandSchema.parse(data);
  }

  /**
   * Validates data with ID from route parameter
   * @param data - Body data
   * @param id - ID from route parameter
   * @returns Validated command with merged ID
   */
  validateWithId(data: unknown, id: string): UpdateTodoCommand {
    const mergedData = { ...data as object, id };
    return UpdateTodoCommandSchema.parse(mergedData);
  }
}

/**
 * Validation service for DeleteTodoCommand
 */
@injectable()
export class DeleteTodoCommandValidationService extends BaseValidationService<unknown, DeleteTodoCommand> {
  validate(data: unknown): DeleteTodoCommand {
    return DeleteTodoCommandSchema.parse(data);
  }

  /**
   * Validates ID from route parameter
   * @param id - ID from route parameter
   * @returns Validated command
   */
  validateId(id: string): DeleteTodoCommand {
    return DeleteTodoCommandSchema.parse({ id });
  }
}

/**
 * Validation service for ToggleTodoCommand
 */
@injectable()
export class ToggleTodoCommandValidationService extends BaseValidationService<unknown, ToggleTodoCommand> {
  validate(data: unknown): ToggleTodoCommand {
    return ToggleTodoCommandSchema.parse(data);
  }

  /**
   * Validates ID from route parameter
   * @param id - ID from route parameter  
   * @returns Validated command
   */
  validateId(id: string): ToggleTodoCommand {
    return ToggleTodoCommandSchema.parse({ id });
  }
}