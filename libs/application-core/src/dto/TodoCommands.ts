// Command DTOs for CQRS pattern
// TypeScript types are now generated from Zod schemas for consistency

import {
  CreateTodoCommandSchema,
  DeleteTodoCommandSchema,
  ToggleTodoCommandSchema,
  UpdateTodoCommandSchema,
} from '../validation/TodoValidationSchemas';

// Re-export command types from validation schemas
export type {
  CreateTodoCommand,
  DeleteTodoCommand,
  ToggleTodoCommand,
  UpdateTodoCommand,
} from '../validation/TodoValidationSchemas';

// Re-export validation schemas for backward compatibility
export {
  CreateTodoCommandSchema,
  DeleteTodoCommandSchema,
  TodoValidationSchemas,
  ToggleTodoCommandSchema,
  UpdateTodoCommandSchema,
} from '../validation/TodoValidationSchemas';

// Legacy function for backward compatibility - now returns required schemas
export const createCommandValidationSchema = () => {
  try {
    // Use proper ES6 imports since the module exists
    return {
      CreateTodoCommandSchema,
      UpdateTodoCommandSchema,
      DeleteTodoCommandSchema,
      ToggleTodoCommandSchema,
    };
  } catch {
    // Fallback in case of import issues
    return {};
  }
};
