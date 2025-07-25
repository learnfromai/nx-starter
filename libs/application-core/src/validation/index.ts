// Validation schemas and types
export * from './TodoValidationSchemas';
export * from './UserValidationSchemas';

// Base validation service and utilities
export * from './ValidationService';

// Concrete validation service implementations
export * from './TodoValidationService';
export * from './UserValidationService';

// Note: Custom decorators for routing-controllers were removed in favor of manual validation

// Re-export commonly used validation schemas for convenience
export {
  CreateTodoCommandSchema,
  UpdateTodoCommandSchema,
  DeleteTodoCommandSchema,
  ToggleTodoCommandSchema,
  TodoIdSchema,
  TodoValidationSchemas,
} from './TodoValidationSchemas';

export {
  RegisterUserCommandSchema,
  UserIdSchema,
} from './UserValidationSchemas';

// Re-export validation service tokens
export { VALIDATION_TOKENS } from './TodoValidationService';
export { USER_VALIDATION_TOKENS } from './UserValidationService';