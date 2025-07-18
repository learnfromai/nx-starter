import 'reflect-metadata';
import { container } from 'tsyringe';
import { InMemoryTodoRepository } from '../todo/persistence/InMemoryTodoRepository';
import { SqliteTodoRepository } from '../todo/persistence/SqliteTodoRepository';
import { TypeOrmTodoRepository } from '../todo/persistence/typeorm/TypeOrmTodoRepository';
import { MongooseTodoRepository } from '../todo/persistence/mongoose/MongooseTodoRepository';
import { SequelizeTodoRepository } from '../todo/persistence/sequelize/SequelizeTodoRepository';
import {
  CreateTodoUseCase,
  UpdateTodoUseCase,
  DeleteTodoUseCase,
  ToggleTodoUseCase,
  GetAllTodosQueryHandler,
  GetActiveTodosQueryHandler,
  GetCompletedTodosQueryHandler,
  GetTodoByIdQueryHandler,
  GetTodoStatsQueryHandler,
  RegisterUserUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  GetUserProfileUseCase,
  TOKENS,
} from '@nx-starter/shared-application';
import type { 
  ITodoRepository, 
  IUserRepository, 
  IRefreshTokenRepository 
} from '@nx-starter/shared-domain';
import type { 
  IPasswordHashingService, 
  IJwtService 
} from '@nx-starter/shared-application';
import { getTypeOrmDataSource } from '../todo/persistence/typeorm/TypeOrmConnection';
import { connectMongoDB } from '../todo/persistence/mongoose/MongooseConnection';
import { getSequelizeInstance } from '../todo/persistence/sequelize/SequelizeConnection';
import { 
  TypeOrmUserRepository, 
  TypeOrmRefreshTokenRepository 
} from '../auth/persistence/typeorm';
import { 
  PasswordHashingService, 
  JwtService 
} from '../auth/services';

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

  // Authentication Infrastructure - Services
  container.registerSingleton<IPasswordHashingService>(
    TOKENS.PasswordHashingService,
    PasswordHashingService
  );
  container.registerSingleton<IJwtService>(
    TOKENS.JwtService,
    JwtService
  );

  // Authentication Infrastructure - Repositories (using TypeORM for simplicity)
  const dataSource = await getTypeOrmDataSource();
  container.registerInstance<IUserRepository>(
    TOKENS.UserRepository,
    new TypeOrmUserRepository(dataSource)
  );
  container.registerInstance<IRefreshTokenRepository>(
    TOKENS.RefreshTokenRepository,
    new TypeOrmRefreshTokenRepository(dataSource)
  );

  // Authentication Application Layer - Use Cases
  container.registerSingleton(TOKENS.RegisterUserUseCase, RegisterUserUseCase);
  container.registerSingleton(TOKENS.LoginUseCase, LoginUseCase);
  container.registerSingleton(TOKENS.RefreshTokenUseCase, RefreshTokenUseCase);
  container.registerSingleton(TOKENS.LogoutUseCase, LogoutUseCase);
  container.registerSingleton(TOKENS.GetUserProfileUseCase, GetUserProfileUseCase);
};

async function getRepositoryImplementation(): Promise<ITodoRepository> {
  const dbType = process.env.DB_TYPE || 'memory';
  const ormType = process.env.DB_ORM || process.env.ORM_TYPE || 'native';

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
