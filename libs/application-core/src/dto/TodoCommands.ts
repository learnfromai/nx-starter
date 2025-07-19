// Command DTOs for CQRS pattern
// Updated to use Zod-inferred types and required validation

import type { TodoPriorityLevel } from '@nx-starter/domain-core';

// Re-export the Zod-inferred types and schemas from validation services
export {
  CreateTodoCommand,
  UpdateTodoCommand,
  DeleteTodoCommand,
  ToggleTodoCommand,
  CreateTodoCommandSchema,
  UpdateTodoCommandSchema,
  DeleteTodoCommandSchema,
  ToggleTodoCommandSchema,
} from '../services/validation/TodoCommandSchemas';

// Deprecated: Remove the old optional validation approach
// This function is kept for backward compatibility but should not be used
export const createCommandValidationSchema = () => {
  console.warn('createCommandValidationSchema is deprecated. Use individual validation services instead.');
  return {};
};
