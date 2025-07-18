import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataSource } from 'typeorm';

vi.mock('typeorm', () => ({
  DataSource: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
    synchronize: vi.fn().mockResolvedValue(undefined),
    isInitialized: true,
  })),
  Entity: vi.fn(),
  PrimaryGeneratedColumn: vi.fn(),
  Column: vi.fn(),
  CreateDateColumn: vi.fn(),
  UpdateDateColumn: vi.fn(),
}));

describe('TypeOrmConnection', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  const MockedDataSource = vi.mocked(DataSource);

  beforeEach(async () => {
    originalEnv = { ...process.env };
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('getTypeOrmDataSource', () => {
    it('should create and initialize DataSource with PostgreSQL configuration', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
      process.env.DB_TYPE = 'postgres';

      const { getTypeOrmDataSource } = await import('./TypeOrmConnection');
      const dataSource = await getTypeOrmDataSource();

      expect(MockedDataSource).toHaveBeenCalledWith({
        type: 'postgres',
        url: 'postgresql://user:pass@localhost:5432/testdb',
        entities: [expect.any(Function)],
        synchronize: true,
        logging: false,
      });

      expect(dataSource.initialize).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('📦 TypeORM connected successfully');
    });

    it('should create and initialize DataSource with SQLite configuration', async () => {
      process.env.DATABASE_URL = undefined;
      process.env.DB_TYPE = 'sqlite';

      const { getTypeOrmDataSource } = await import('./TypeOrmConnection');
      const dataSource = await getTypeOrmDataSource();

      expect(MockedDataSource).toHaveBeenCalledWith({
        type: 'sqlite',
        database: ':memory:',
        entities: [expect.any(Function)],
        synchronize: true,
        logging: false,
      });

      expect(dataSource.initialize).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('📦 TypeORM connected successfully');
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      MockedDataSource.mockImplementation(() => ({
        initialize: vi.fn().mockRejectedValue(error),
        destroy: vi.fn().mockResolvedValue(undefined),
        synchronize: vi.fn().mockResolvedValue(undefined),
        isInitialized: false,
      }));

      const { getTypeOrmDataSource } = await import('./TypeOrmConnection');

      await expect(getTypeOrmDataSource()).rejects.toThrow('Connection failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to connect to database:', error);
    });

    it('should return existing DataSource if already initialized', async () => {
      const { getTypeOrmDataSource } = await import('./TypeOrmConnection');
      
      const dataSource1 = await getTypeOrmDataSource();
      const dataSource2 = await getTypeOrmDataSource();

      expect(dataSource1).toBe(dataSource2);
    });
  });

  describe('closeTypeOrmConnection', () => {
    it('should close the DataSource connection', async () => {
      const { getTypeOrmDataSource, closeTypeOrmConnection } = await import('./TypeOrmConnection');
      
      const dataSource = await getTypeOrmDataSource();
      await closeTypeOrmConnection();

      expect(dataSource.destroy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('📦 TypeORM connection closed');
    });

    it('should handle closing errors', async () => {
      const error = new Error('Close failed');
      MockedDataSource.mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockRejectedValue(error),
        synchronize: vi.fn().mockResolvedValue(undefined),
        isInitialized: true,
      }));

      const { getTypeOrmDataSource, closeTypeOrmConnection } = await import('./TypeOrmConnection');
      
      await getTypeOrmDataSource();
      
      await expect(closeTypeOrmConnection()).rejects.toThrow('Close failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error closing TypeORM connection:', error);
    });
  });
});