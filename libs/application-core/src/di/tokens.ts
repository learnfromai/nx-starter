// DI Container tokens following Clean Architecture layers
export const TOKENS = {
  // Infrastructure Layer - Repositories
  TodoRepository: 'ITodoRepository',

  // Application Layer - CQRS Services (Interface-based for cleaner injection)
  TodoCommandService: 'ITodoCommandService',
  TodoQueryService: 'ITodoQueryService',

  // Application Layer - Validation Services
  CreateTodoCommandValidationService: 'CreateTodoCommandValidationService',
  UpdateTodoCommandValidationService: 'UpdateTodoCommandValidationService',
  DeleteTodoCommandValidationService: 'DeleteTodoCommandValidationService',
  ToggleTodoCommandValidationService: 'ToggleTodoCommandValidationService',

  // Application Layer - Use Cases (Commands)
  CreateTodoUseCase: 'CreateTodoUseCase',
  UpdateTodoUseCase: 'UpdateTodoUseCase',
  DeleteTodoUseCase: 'DeleteTodoUseCase',
  ToggleTodoUseCase: 'ToggleTodoUseCase',

  // Application Layer - Use Cases (Queries)
  GetAllTodosQueryHandler: 'GetAllTodosQueryHandler',
  GetFilteredTodosQueryHandler: 'GetFilteredTodosQueryHandler',
  GetActiveTodosQueryHandler: 'GetActiveTodosQueryHandler',
  GetCompletedTodosQueryHandler: 'GetCompletedTodosQueryHandler',
  GetTodoStatsQueryHandler: 'GetTodoStatsQueryHandler',
  GetTodoByIdQueryHandler: 'GetTodoByIdQueryHandler',

  // Domain Layer - Services
  TodoDomainService: 'TodoDomainService',
} as const;

// Type-safe token keys
export type TokenKey = keyof typeof TOKENS;
