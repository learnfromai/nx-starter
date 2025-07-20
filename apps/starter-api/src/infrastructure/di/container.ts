import 'reflect-metadata';

import {
  CreateTodoUseCase,
  CreateTodoValidationService,
  DeleteTodoUseCase,
  DeleteTodoValidationService,
  GetActiveTodosQueryHandler,
  GetAllTodosQueryHandler,
  GetCompletedTodosQueryHandler,
  GetTodoByIdQueryHandler,
  GetTodoStatsQueryHandler,
  TodoValidationService,
  ToggleTodoUseCase,
  ToggleTodoValidationService,
  TOKENS,
  UpdateTodoUseCase,
  UpdateTodoValidationService,
  VALIDATION_TOKENS,
} from '@nx-starter/application-core';
import type { ITodoRepository } from '@nx-starter/domain-core';
import { container } from 'tsyringe';

import { config } from '../../config/config';
import { InMemoryTodoRepository } from '../todo/persistence/InMemoryTodoRepository';
import { connectMongoDB } from '../todo/persistence/mongoose/MongooseConnection';
import { MongooseTodoRepository } from '../todo/persistence/mongoose/MongooseTodoRepository';
import { getSequelizeInstance } from '../todo/persistence/sequelize/SequelizeConnection';
import { SequelizeTodoRepository } from '../todo/persistence/sequelize/SequelizeTodoRepository';
import { SqliteTodoRepository } from '../todo/persistence/SqliteTodoRepository';
import { getTypeOrmDataSource } from '../todo/persistence/typeorm/TypeOrmConnection';
import { TypeOrmTodoRepository } from '../todo/persistence/typeorm/TypeOrmTodoRepository';

// Register dependencies following Clean Architecture layers
export const configureDI = async () => {
  // Infrastructure Layer - Repository (choose based on config)
  const repositoryImplementation = await getRepositoryImplementation();
  container.registerInstance<ITodoRepository>(
    TOKENS.TodoRepository,
    repositoryImplementation
  );

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
    TOKENS.GetActiveTodosQueryHandler,
    GetActiveTodosQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetCompletedTodosQueryHandler,
    GetCompletedTodosQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetTodoByIdQueryHandler,
    GetTodoByIdQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetTodoStatsQueryHandler,
    GetTodoStatsQueryHandler
  );

  // Application Layer - Validation Services
  container.registerSingleton(
    VALIDATION_TOKENS.CreateTodoValidationService,
    CreateTodoValidationService
  );
  container.registerSingleton(
    VALIDATION_TOKENS.UpdateTodoValidationService,
    UpdateTodoValidationService
  );
  container.registerSingleton(
    VALIDATION_TOKENS.DeleteTodoValidationService,
    DeleteTodoValidationService
  );
  container.registerSingleton(
    VALIDATION_TOKENS.ToggleTodoValidationService,
    ToggleTodoValidationService
  );
  container.registerSingleton(
    VALIDATION_TOKENS.TodoValidationService,
    TodoValidationService
  );
};

async function getRepositoryImplementation(): Promise<ITodoRepository> {
  const dbType = config.database.type;
  const ormType = config.database.orm || 'native';

  console.log(`📦 Using ${ormType} ORM with ${dbType} database`);

  // Handle memory database (always uses in-memory repository)
  if (dbType === 'memory') {
    console.log('📦 Using in-memory repository');
    return new InMemoryTodoRepository();
  }

  // Handle MongoDB (always uses Mongoose)
  if (dbType === 'mongodb') {
    await connectMongoDB();
    console.log('📦 Using Mongoose repository with MongoDB');
    return new MongooseTodoRepository();
  }

  // Handle SQL databases with different ORMs
  switch (ormType) {
    case 'typeorm': {
      const dataSource = await getTypeOrmDataSource();
      console.log(`📦 Using TypeORM repository with ${dbType}`);
      return new TypeOrmTodoRepository(dataSource);
    }

    case 'sequelize': {
      const sequelize = await getSequelizeInstance();
      console.log(`📦 Using Sequelize repository with ${dbType}`);
      return new SequelizeTodoRepository();
    }

    case 'native':
    default: {
      if (dbType === 'sqlite') {
        console.log('📦 Using native SQLite repository');
        return new SqliteTodoRepository();
      }

      // For other databases without native support, default to TypeORM
      console.log(
        `📦 No native support for ${dbType}, falling back to TypeORM`
      );
      const dataSource = await getTypeOrmDataSource();
      return new TypeOrmTodoRepository(dataSource);
    }
  }
}

// Export container and tokens for use in controllers
export { container, TOKENS };
