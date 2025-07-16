import 'reflect-metadata';
import { container } from 'tsyringe';
import { TodoRepository } from '@/core/infrastructure/todo/persistence/TodoRepository';
import { ApiTodoRepository } from '@/core/infrastructure/todo/persistence/ApiTodoRepository';
import { 
  TodoCommandService,
  TodoQueryService,
  CreateTodoUseCase,
  UpdateTodoUseCase,
  DeleteTodoUseCase,
  ToggleTodoUseCase,
  GetAllTodosQueryHandler,
  GetFilteredTodosQueryHandler,
  GetTodoStatsQueryHandler,
  GetTodoByIdQueryHandler,
  type ITodoCommandService,
  type ITodoQueryService
} from '@nx-starter/shared-application';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import { TOKENS } from './tokens';

// Check environment variable to determine data source
const useApiBackend = import.meta.env.VITE_USE_API_BACKEND === 'true';

// Register dependencies following Clean Architecture layers
export const configureDI = () => {
  // Infrastructure Layer - Repository (conditionally based on environment)
  if (useApiBackend) {
    console.log('📡 Using API backend for data storage');
    container.registerSingleton<ITodoRepository>(
      TOKENS.TodoRepository,
      ApiTodoRepository
    );
  } else {
    console.log('💾 Using local Dexie.js for data storage');
    container.registerSingleton<ITodoRepository>(
      TOKENS.TodoRepository,
      TodoRepository
    );
  }

  // Application Layer - Use Cases (Commands) - Factory registration for constructor injection
  container.register(TOKENS.CreateTodoUseCase, {
    useFactory: () => new CreateTodoUseCase(container.resolve<ITodoRepository>(TOKENS.TodoRepository))
  });
  container.register(TOKENS.UpdateTodoUseCase, {
    useFactory: () => new UpdateTodoUseCase(container.resolve<ITodoRepository>(TOKENS.TodoRepository))
  });
  container.register(TOKENS.DeleteTodoUseCase, {
    useFactory: () => new DeleteTodoUseCase(container.resolve<ITodoRepository>(TOKENS.TodoRepository))
  });
  container.register(TOKENS.ToggleTodoUseCase, {
    useFactory: () => new ToggleTodoUseCase(
      container.resolve<ITodoRepository>(TOKENS.TodoRepository),
      container.resolve(TOKENS.UpdateTodoUseCase)
    )
  });

  // Application Layer - Use Cases (Queries) - Factory registration
  container.register(TOKENS.GetAllTodosQueryHandler, {
    useFactory: () => new GetAllTodosQueryHandler(container.resolve<ITodoRepository>(TOKENS.TodoRepository))
  });
  container.register(TOKENS.GetFilteredTodosQueryHandler, {
    useFactory: () => new GetFilteredTodosQueryHandler(container.resolve<ITodoRepository>(TOKENS.TodoRepository))
  });
  container.register(TOKENS.GetTodoStatsQueryHandler, {
    useFactory: () => new GetTodoStatsQueryHandler(container.resolve<ITodoRepository>(TOKENS.TodoRepository))
  });
  container.register(TOKENS.GetTodoByIdQueryHandler, {
    useFactory: () => new GetTodoByIdQueryHandler(container.resolve<ITodoRepository>(TOKENS.TodoRepository))
  });

  // Application Layer - CQRS Services - Factory registration
  container.register<ITodoCommandService>(TOKENS.TodoCommandService, {
    useFactory: () => new TodoCommandService(
      container.resolve(TOKENS.CreateTodoUseCase),
      container.resolve(TOKENS.UpdateTodoUseCase),
      container.resolve(TOKENS.DeleteTodoUseCase),
      container.resolve(TOKENS.ToggleTodoUseCase)
    )
  });
  container.register<ITodoQueryService>(TOKENS.TodoQueryService, {
    useFactory: () => new TodoQueryService(
      container.resolve(TOKENS.GetAllTodosQueryHandler),
      container.resolve(TOKENS.GetFilteredTodosQueryHandler),
      container.resolve(TOKENS.GetTodoStatsQueryHandler),
      container.resolve(TOKENS.GetTodoByIdQueryHandler)
    )
  });
};

// Export container and tokens for use in components
export { container, TOKENS };
