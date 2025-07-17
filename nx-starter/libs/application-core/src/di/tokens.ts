// DI Container tokens following Clean Architecture layers
export const TOKENS = {
  // Infrastructure Layer - Repositories
  TodoRepository: 'ITodoRepository',
  UserRepository: 'IUserRepository',

  // Application Layer - CQRS Services (Interface-based for cleaner injection)
  TodoCommandService: 'ITodoCommandService',
  TodoQueryService: 'ITodoQueryService',

  // Application Layer - Use Cases (Commands)
  CreateTodoUseCase: 'CreateTodoUseCase',
  UpdateTodoUseCase: 'UpdateTodoUseCase',
  DeleteTodoUseCase: 'DeleteTodoUseCase',
  ToggleTodoUseCase: 'ToggleTodoUseCase',

  // User Use Cases
  RegisterUserUseCase: 'RegisterUserUseCase',
  LoginUseCase: 'LoginUseCase',
  RefreshTokenUseCase: 'RefreshTokenUseCase',
  ChangePasswordUseCase: 'ChangePasswordUseCase',
  UpdateUserProfileUseCase: 'UpdateUserProfileUseCase',
  GetUserProfileUseCase: 'GetUserProfileUseCase',

  // Application Layer - Use Cases (Queries)
  GetAllTodosQueryHandler: 'GetAllTodosQueryHandler',
  GetFilteredTodosQueryHandler: 'GetFilteredTodosQueryHandler',
  GetActiveTodosQueryHandler: 'GetActiveTodosQueryHandler',
  GetCompletedTodosQueryHandler: 'GetCompletedTodosQueryHandler',
  GetTodoStatsQueryHandler: 'GetTodoStatsQueryHandler',
  GetTodoByIdQueryHandler: 'GetTodoByIdQueryHandler',

  // Domain Layer - Services
  TodoDomainService: 'TodoDomainService',
  PasswordService: 'IPasswordService',
  TokenService: 'ITokenService',
} as const;

// Type-safe token keys
export type TokenKey = keyof typeof TOKENS;
