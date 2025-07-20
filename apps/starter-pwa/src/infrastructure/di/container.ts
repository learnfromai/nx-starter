import 'reflect-metadata';

import type {
  ITodoCommandService,
  ITodoQueryService,
} from '@nx-starter/application-core';
import {
  CreateTodoUseCase,
  DeleteTodoUseCase,
  GetActiveTodosQueryHandler,
  GetAllTodosQueryHandler,
  GetCompletedTodosQueryHandler,
  GetFilteredTodosQueryHandler,
  GetTodoByIdQueryHandler,
  GetTodoStatsQueryHandler,
  TodoCommandService,
  TodoQueryService,
  ToggleTodoUseCase,
  TOKENS,
  UpdateTodoUseCase,
} from '@nx-starter/application-core';
import type { ITodoRepository } from '@nx-starter/domain-core';
import { container } from 'tsyringe';

import { ApiTodoRepository } from '../api/ApiTodoRepository';
import { TodoRepository } from '../persistence/TodoRepository';

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

  // Application Layer - Use Cases (Commands)
  container.registerSingleton(TOKENS.CreateTodoUseCase, CreateTodoUseCase);
  container.registerSingleton(TOKENS.UpdateTodoUseCase, UpdateTodoUseCase);
  container.registerSingleton(TOKENS.DeleteTodoUseCase, DeleteTodoUseCase);
  container.registerSingleton(TOKENS.ToggleTodoUseCase, ToggleTodoUseCase);

  // Application Layer - Use Cases (Queries)
  container.registerSingleton(
    TOKENS.GetAllTodosQueryHandler,
    GetAllTodosQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetFilteredTodosQueryHandler,
    GetFilteredTodosQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetActiveTodosQueryHandler,
    GetActiveTodosQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetCompletedTodosQueryHandler,
    GetCompletedTodosQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetTodoStatsQueryHandler,
    GetTodoStatsQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetTodoByIdQueryHandler,
    GetTodoByIdQueryHandler
  );

  // Application Layer - CQRS Services
  container.registerSingleton<ITodoCommandService>(
    TOKENS.TodoCommandService,
    TodoCommandService
  );
  container.registerSingleton<ITodoQueryService>(
    TOKENS.TodoQueryService,
    TodoQueryService
  );
};

// Export container and tokens for use in components
export { container, TOKENS };
