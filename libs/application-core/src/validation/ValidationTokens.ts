/**
 * Token symbols for dependency injection of validation services
 */
export const VALIDATION_TOKENS = {
  CreateTodoValidationService: Symbol('CreateTodoValidationService'),
  UpdateTodoValidationService: Symbol('UpdateTodoValidationService'),
  DeleteTodoValidationService: Symbol('DeleteTodoValidationService'),
  ToggleTodoValidationService: Symbol('ToggleTodoValidationService'),
  TodoValidationService: Symbol('TodoValidationService'),
} as const;