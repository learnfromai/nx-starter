import { Sequelize } from 'sequelize';
import { config } from '@/config/config';
import { initTodoModel } from './TodoModel';

/**
 * Sequelize connection management
 * Supports multiple SQL databases
 */
export const createSequelizeInstance = (): Sequelize => {
  const dbConfig = config.database;

  let sequelize: Sequelize;

  if (dbConfig.url) {
    // Use connection URL if provided
    sequelize = new Sequelize(dbConfig.url, {
      logging: config.nodeEnv === 'development' ? console.log : false,
      dialectOptions:
        dbConfig.type === 'sqlite'
          ? {
              // SQLite specific options
            }
          : dbConfig.type === 'postgresql'
            ? {
                // PostgreSQL specific options
                ssl:
                  config.nodeEnv === 'production'
                    ? {
                        require: true,
                        rejectUnauthorized: false,
                      }
                    : false,
                // Enable UUID extension for PostgreSQL
                prependSearchPath: false,
              }
            : {
                // MySQL specific options
                ssl:
                  config.nodeEnv === 'production'
                    ? {
                        require: true,
                        rejectUnauthorized: false,
                      }
                    : false,
              },
    });
  } else {
    // Use individual connection parameters
    const dialectMap = {
      mysql: 'mysql',
      postgresql: 'postgres',
      sqlite: 'sqlite',
    } as const;

    const dialect = dialectMap[dbConfig.type as keyof typeof dialectMap] || 'sqlite';

    if (dialect === 'sqlite') {
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './data/todos.db',
        logging: config.nodeEnv === 'development' ? console.log : false,
      });
    } else {
      const dialectOptions: any = {};

      if (dialect === 'postgres') {
        dialectOptions.prependSearchPath = false;
        if (config.nodeEnv === 'production') {
          dialectOptions.ssl = {
            require: true,
            rejectUnauthorized: false,
          };
        }
      } else if (config.nodeEnv === 'production') {
        dialectOptions.ssl = {
          require: true,
          rejectUnauthorized: false,
        };
      }

      sequelize = new Sequelize({
        dialect: dialect as any,
        host: dbConfig.host || 'localhost',
        port: dbConfig.port || (dialect === 'mysql' ? 3306 : 5432),
        username: dbConfig.username!,
        password: dbConfig.password!,
        database: dbConfig.database || 'task_app',
        logging: config.nodeEnv === 'development' ? console.log : false,
        dialectOptions,
      });
    }
  }

  // Initialize models
  initTodoModel(sequelize);

  return sequelize;
};

// Singleton instance
let sequelize: Sequelize | null = null;

export const getSequelizeInstance = async (): Promise<Sequelize> => {
  if (!sequelize) {
    sequelize = createSequelizeInstance();

    try {
      await sequelize.authenticate();
      console.log('📦 Sequelize connection established successfully');

      // For PostgreSQL, ensure UUID extension is available and create ENUM type
      const dialect = sequelize.getDialect();
      if (dialect === 'postgres') {
        try {
          // Enable UUID extension
          await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
          console.log('📦 PostgreSQL UUID extension enabled');

          // Create ENUM type if it doesn't exist
          await sequelize.query(`
            DO $$ BEGIN
              CREATE TYPE todo_priority AS ENUM ('low', 'medium', 'high');
            EXCEPTION
              WHEN duplicate_object THEN null;
            END $$;
          `);
          console.log('📦 PostgreSQL ENUM type created/verified');
        } catch (error) {
          console.warn('⚠️  PostgreSQL setup warning:', (error as Error).message);
        }
      }

      // Sync models (create tables if they don't exist)
      if (config.nodeEnv === 'development') {
        await sequelize.sync({ alter: true });
        console.log('📦 Sequelize models synchronized');
      }
    } catch (error) {
      console.error('Unable to connect to database via Sequelize:', error);
      throw error;
    }
  }

  return sequelize;
};

export const closeSequelizeConnection = async (): Promise<void> => {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
    console.log('📦 Sequelize connection closed');
  }
};
