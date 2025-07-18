import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Sequelize } from 'sequelize';

vi.mock('sequelize', () => ({
  Sequelize: vi.fn().mockImplementation(() => ({
    authenticate: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    sync: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue(undefined),
    getDialect: vi.fn().mockReturnValue('sqlite'),
  })),
}));

vi.mock('./TodoModel', () => ({
  initTodoModel: vi.fn(),
}));

describe('SequelizeConnection', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  const MockedSequelize = vi.mocked(Sequelize);

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

  describe('getSequelizeInstance', () => {
    it('should create and authenticate Sequelize instance with PostgreSQL', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
      process.env.DB_TYPE = 'postgres';

      const { getSequelizeInstance } = await import('./SequelizeConnection');
      const sequelize = await getSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledWith('postgresql://user:pass@localhost:5432/testdb', {
        dialect: 'postgres',
        logging: false,
      });
      expect(sequelize.authenticate).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('📦 Sequelize connected successfully');
    });

    it('should create and authenticate Sequelize instance with SQLite', async () => {
      process.env.DATABASE_URL = undefined;
      process.env.DB_TYPE = 'sqlite';

      const { getSequelizeInstance } = await import('./SequelizeConnection');
      const sequelize = await getSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledWith({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
      });
      expect(sequelize.authenticate).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('📦 Sequelize connected successfully');
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      MockedSequelize.mockImplementation(() => ({
        authenticate: vi.fn().mockRejectedValue(error),
        close: vi.fn().mockResolvedValue(undefined),
        sync: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockResolvedValue(undefined),
        getDialect: vi.fn().mockReturnValue('sqlite'),
      }));

      const { getSequelizeInstance } = await import('./SequelizeConnection');

      await expect(getSequelizeInstance()).rejects.toThrow('Connection failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to connect to database:', error);
    });

    it('should return existing instance if already initialized', async () => {
      const { getSequelizeInstance } = await import('./SequelizeConnection');
      
      const sequelize1 = await getSequelizeInstance();
      const sequelize2 = await getSequelizeInstance();

      expect(sequelize1).toBe(sequelize2);
    });
  });

  describe('closeSequelizeConnection', () => {
    it('should close the Sequelize connection', async () => {
      const { getSequelizeInstance, closeSequelizeConnection } = await import('./SequelizeConnection');
      
      const sequelize = await getSequelizeInstance();
      await closeSequelizeConnection();

      expect(sequelize.close).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('📦 Sequelize connection closed');
    });

    it('should handle closing errors', async () => {
      const error = new Error('Close failed');
      MockedSequelize.mockImplementation(() => ({
        authenticate: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockRejectedValue(error),
        sync: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockResolvedValue(undefined),
        getDialect: vi.fn().mockReturnValue('sqlite'),
      }));

      const { getSequelizeInstance, closeSequelizeConnection } = await import('./SequelizeConnection');
      
      await getSequelizeInstance();
      
      await expect(closeSequelizeConnection()).rejects.toThrow('Close failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error closing Sequelize connection:', error);
    });
  });
});