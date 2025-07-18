import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { container } from 'tsyringe';
import { configureDI, TOKENS } from './container';
import type { ITodoRepository } from '@nx-starter/domain-core';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    DB_TYPE: 'memory',
    ORM_TYPE: 'native'
  }
}));

// Mock all repository implementations
vi.mock('../todo/persistence/InMemoryTodoRepository', () => ({
  InMemoryTodoRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn(),
    getActive: vi.fn(),
    getCompleted: vi.fn(),
    count: vi.fn(),
    countActive: vi.fn(),
    countCompleted: vi.fn(),
    findBySpecification: vi.fn()
  }))
}));

vi.mock('../todo/persistence/SqliteTodoRepository', () => ({
  SqliteTodoRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn(),
    getActive: vi.fn(),
    getCompleted: vi.fn(),
    count: vi.fn(),
    countActive: vi.fn(),
    countCompleted: vi.fn(),
    findBySpecification: vi.fn()
  }))
}));

vi.mock('../todo/persistence/typeorm/TypeOrmTodoRepository', () => ({
  TypeOrmTodoRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn(),
    getActive: vi.fn(),
    getCompleted: vi.fn(),
    count: vi.fn(),
    countActive: vi.fn(),
    countCompleted: vi.fn(),
    findBySpecification: vi.fn()
  }))
}));

vi.mock('../todo/persistence/mongoose/MongooseTodoRepository', () => ({
  MongooseTodoRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn(),
    getActive: vi.fn(),
    getCompleted: vi.fn(),
    count: vi.fn(),
    countActive: vi.fn(),
    countCompleted: vi.fn(),
    findBySpecification: vi.fn()
  }))
}));

vi.mock('../todo/persistence/sequelize/SequelizeTodoRepository', () => ({
  SequelizeTodoRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn(),
    getActive: vi.fn(),
    getCompleted: vi.fn(),
    count: vi.fn(),
    countActive: vi.fn(),
    countCompleted: vi.fn(),
    findBySpecification: vi.fn()
  }))
}));

// Mock the connection modules
vi.mock('../todo/persistence/typeorm/TypeOrmConnection', () => ({
  getTypeOrmDataSource: vi.fn().mockResolvedValue({ isInitialized: true })
}));

vi.mock('../todo/persistence/mongoose/MongooseConnection', () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../todo/persistence/sequelize/SequelizeConnection', () => ({
  getSequelizeInstance: vi.fn().mockResolvedValue({ authenticate: vi.fn() })
}));

// Mock use cases from application-core
vi.mock('@nx-starter/application-core', async () => {
  const actual = await vi.importActual('@nx-starter/application-core');
  return {
    ...actual,
    CreateTodoUseCase: vi.fn(),
    UpdateTodoUseCase: vi.fn(),
    DeleteTodoUseCase: vi.fn(),
    ToggleTodoUseCase: vi.fn(),
    GetAllTodosQueryHandler: vi.fn(),
    GetActiveTodosQueryHandler: vi.fn(),
    GetCompletedTodosQueryHandler: vi.fn(),
    GetTodoByIdQueryHandler: vi.fn(),
    GetTodoStatsQueryHandler: vi.fn()
  };
});

describe('DI Container Configuration', () => {
  beforeEach(() => {
    container.clearInstances();
    vi.clearAllMocks();
  });

  afterEach(() => {
    container.clearInstances();
  });

  describe('configureDI', () => {
    it('should configure all dependencies successfully', async () => {
      await configureDI();

      // Verify repository is registered
      expect(container.isRegistered(TOKENS.TodoRepository)).toBe(true);
      
      // Verify use cases are registered
      expect(container.isRegistered(TOKENS.CreateTodoUseCase)).toBe(true);
      expect(container.isRegistered(TOKENS.UpdateTodoUseCase)).toBe(true);
      expect(container.isRegistered(TOKENS.DeleteTodoUseCase)).toBe(true);
      expect(container.isRegistered(TOKENS.ToggleTodoUseCase)).toBe(true);
      
      // Verify query handlers are registered
      expect(container.isRegistered(TOKENS.GetAllTodosQueryHandler)).toBe(true);
      expect(container.isRegistered(TOKENS.GetActiveTodosQueryHandler)).toBe(true);
      expect(container.isRegistered(TOKENS.GetCompletedTodosQueryHandler)).toBe(true);
      expect(container.isRegistered(TOKENS.GetTodoByIdQueryHandler)).toBe(true);
      expect(container.isRegistered(TOKENS.GetTodoStatsQueryHandler)).toBe(true);
    });

    it('should register repository instance as ITodoRepository', async () => {
      await configureDI();
      
      const repository = container.resolve<ITodoRepository>(TOKENS.TodoRepository);
      expect(repository).toBeDefined();
      expect(typeof repository.getAll).toBe('function');
      expect(typeof repository.create).toBe('function');
      expect(typeof repository.update).toBe('function');
      expect(typeof repository.delete).toBe('function');
    });
  });

  describe('getRepositoryImplementation - Memory Database', () => {
    it('should return InMemoryTodoRepository for memory database', async () => {
      vi.stubEnv('DB_TYPE', 'memory');
      vi.stubEnv('ORM_TYPE', 'native');
      
      await configureDI();
      
      const repository = container.resolve<ITodoRepository>(TOKENS.TodoRepository);
      expect(repository).toBeDefined();
    });
  });

  describe('getRepositoryImplementation - MongoDB', () => {
    it('should return MongooseTodoRepository for mongodb database', async () => {
      const { connectMongoDB } = await import('../todo/persistence/mongoose/MongooseConnection');
      
      vi.stubEnv('DB_TYPE', 'mongodb');
      vi.stubEnv('ORM_TYPE', 'native');
      
      await configureDI();
      
      expect(connectMongoDB).toHaveBeenCalled();
      const repository = container.resolve<ITodoRepository>(TOKENS.TodoRepository);
      expect(repository).toBeDefined();
    });
  });

  describe('getRepositoryImplementation - TypeORM', () => {
    it('should return TypeOrmTodoRepository for typeorm ORM', async () => {
      const { getTypeOrmDataSource } = await import('../todo/persistence/typeorm/TypeOrmConnection');
      
      vi.stubEnv('DB_TYPE', 'postgres');
      vi.stubEnv('ORM_TYPE', 'typeorm');
      
      await configureDI();
      
      expect(getTypeOrmDataSource).toHaveBeenCalled();
      const repository = container.resolve<ITodoRepository>(TOKENS.TodoRepository);
      expect(repository).toBeDefined();
    });
  });

  describe('getRepositoryImplementation - Sequelize', () => {
    it('should return SequelizeTodoRepository for sequelize ORM', async () => {
      const { getSequelizeInstance } = await import('../todo/persistence/sequelize/SequelizeConnection');
      
      vi.stubEnv('DB_TYPE', 'postgres');
      vi.stubEnv('ORM_TYPE', 'sequelize');
      
      await configureDI();
      
      expect(getSequelizeInstance).toHaveBeenCalled();
      const repository = container.resolve<ITodoRepository>(TOKENS.TodoRepository);
      expect(repository).toBeDefined();
    });
  });

  describe('getRepositoryImplementation - Native SQLite', () => {
    it('should return SqliteTodoRepository for native sqlite', async () => {
      vi.stubEnv('DB_TYPE', 'sqlite');
      vi.stubEnv('ORM_TYPE', 'native');
      
      await configureDI();
      
      const repository = container.resolve<ITodoRepository>(TOKENS.TodoRepository);
      expect(repository).toBeDefined();
    });
  });

  describe('getRepositoryImplementation - Fallback to TypeORM', () => {
    it('should fallback to TypeORM for unsupported native databases', async () => {
      const { getTypeOrmDataSource } = await import('../todo/persistence/typeorm/TypeOrmConnection');
      
      vi.stubEnv('DB_TYPE', 'mysql');
      vi.stubEnv('ORM_TYPE', 'native');
      
      await configureDI();
      
      expect(getTypeOrmDataSource).toHaveBeenCalled();
      const repository = container.resolve<ITodoRepository>(TOKENS.TodoRepository);
      expect(repository).toBeDefined();
    });

    it('should fallback to TypeORM for default case', async () => {
      const { getTypeOrmDataSource } = await import('../todo/persistence/typeorm/TypeOrmConnection');
      
      vi.stubEnv('DB_TYPE', 'postgres');
      vi.stubEnv('ORM_TYPE', 'unknown');
      
      await configureDI();
      
      expect(getTypeOrmDataSource).toHaveBeenCalled();
      const repository = container.resolve<ITodoRepository>(TOKENS.TodoRepository);
      expect(repository).toBeDefined();
    });
  });

  describe('exports', () => {
    it('should export container and TOKENS', () => {
      expect(container).toBeDefined();
      expect(TOKENS).toBeDefined();
      expect(typeof TOKENS).toBe('object');
    });
  });
});