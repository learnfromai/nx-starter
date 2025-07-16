import 'reflect-metadata';
import { container } from 'tsyringe';
import { InMemoryTodoRepository } from '@/core/infrastructure/todo/persistence/InMemoryTodoRepository';
import { SqliteTodoRepository } from '@/core/infrastructure/todo/persistence/SqliteTodoRepository';
import { TypeOrmTodoRepository } from '@/core/infrastructure/todo/persistence/typeorm/TypeOrmTodoRepository';
import { MongooseTodoRepository } from '@/core/infrastructure/todo/persistence/mongoose/MongooseTodoRepository';
import { SequelizeTodoRepository } from '@/core/infrastructure/todo/persistence/sequelize/SequelizeTodoRepository';
import { 
  CreateTodoUseCase,
  UpdateTodoUseCase,
  DeleteTodoUseCase,
  ToggleTodoUseCase,
  GetAllTodosQueryHandler,
  GetActiveTodosQueryHandler,
  GetCompletedTodosQueryHandler,
  GetTodoStatsQueryHandler,
  GetTodoByIdQueryHandler
} from '@nx-starter/shared-application';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import { config } from '@/config/config';
import { TOKENS } from './tokens';
import { getTypeOrmDataSource } from '@/core/infrastructure/todo/persistence/typeorm/TypeOrmConnection';
import { connectMongoDB } from '@/core/infrastructure/todo/persistence/mongoose/MongooseConnection';
import { getSequelizeInstance } from '@/core/infrastructure/todo/persistence/sequelize/SequelizeConnection';

// Register dependencies following Clean Architecture layers
export const configureDI = async () => {
  // Infrastructure Layer - Repository (choose based on config)
  const repositoryImplementation = await getRepositoryImplementation();
  container.registerInstance<ITodoRepository>(TOKENS.TodoRepository, repositoryImplementation);

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
  container.register(TOKENS.GetActiveTodosQueryHandler, {
    useFactory: () => new GetActiveTodosQueryHandler(container.resolve<ITodoRepository>(TOKENS.TodoRepository))
  });
  container.register(TOKENS.GetCompletedTodosQueryHandler, {
    useFactory: () => new GetCompletedTodosQueryHandler(container.resolve<ITodoRepository>(TOKENS.TodoRepository))
  });
  container.register(TOKENS.GetTodoByIdQueryHandler, {
    useFactory: () => new GetTodoByIdQueryHandler(container.resolve<ITodoRepository>(TOKENS.TodoRepository))
  });
  container.register(TOKENS.GetTodoStatsQueryHandler, {
    useFactory: () => new GetTodoStatsQueryHandler(container.resolve<ITodoRepository>(TOKENS.TodoRepository))
  });
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
      console.log(`📦 No native support for ${dbType}, falling back to TypeORM`);
      const dataSource = await getTypeOrmDataSource();
      return new TypeOrmTodoRepository(dataSource);
    }
  }
}

// Export container and tokens for use in controllers
export { container, TOKENS };
