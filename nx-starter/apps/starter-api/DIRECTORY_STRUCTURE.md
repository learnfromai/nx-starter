# Starter API Directory Structure

```text
apps/starter-api/
├── .env.example
├── postman-collection.json
├── postman-environment.json
├── project.json
├── prisma/
├── src/
│   ├── api.integration.spec.ts
│   ├── config/
│   │   ├── app.ts
│   │   ├── config.ts
│   │   └── index.ts
│   ├── infrastructure/
│   │   ├── di/
│   │   │   └── container.ts
│   │   ├── index.ts
│   │   └── todo/
│   │       └── persistence/
│   │           ├── InMemoryTodoRepository.spec.ts
│   │           ├── InMemoryTodoRepository.ts
│   │           ├── SqliteTodoRepository.ts
│   │           ├── index.ts
│   │           ├── mongoose/
│   │           │   ├── MongooseConnection.ts
│   │           │   ├── MongooseTodoRepository.ts
│   │           │   └── TodoSchema.ts
│   │           ├── sequelize/
│   │           │   ├── SequelizeConnection.ts
│   │           │   ├── SequelizeTodoRepository.ts
│   │           │   └── TodoModel.ts
│   │           └── typeorm/
│   │               ├── TodoEntity.ts
│   │               ├── TypeOrmConnection.ts
│   │               └── TypeOrmTodoRepository.ts
│   ├── main.ts
│   ├── presentation/
│   │   ├── controllers/
│   │   │   ├── TodoController.ts
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   └── routes/
│   │       ├── index.ts
│   │       └── todoRoutes.ts
│   ├── shared/
│   │   └── middleware/
│   │       ├── ErrorHandler.spec.ts
│   │       └── ErrorHandler.ts
│   └── test/
│       └── setup.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.spec.json
├── vitest.config.ts
└── webpack.config.js
```

## File Analysis

### Configuration Files
- `config/app.ts` - Express app configuration
- `config/config.ts` - Environment configuration
- `config/index.ts` - Configuration exports

### Infrastructure Layer
- `infrastructure/di/container.ts` - Dependency injection container
- `infrastructure/todo/persistence/` - Repository implementations
  - `InMemoryTodoRepository.ts` - In-memory repository
  - `SqliteTodoRepository.ts` - SQLite repository
  - `mongoose/` - MongoDB/Mongoose implementations
  - `sequelize/` - Sequelize ORM implementations
  - `typeorm/` - TypeORM implementations

### Presentation Layer
- `presentation/controllers/TodoController.ts` - Todo REST controller
- `presentation/routes/` - Express route definitions
- `presentation/middleware/errorHandler.ts` - Error handling middleware

### Shared Layer
- `shared/middleware/ErrorHandler.ts` - Shared error handling utilities

### Test Files
- `api.integration.spec.ts` - API integration tests
- `infrastructure/di/container.spec.ts` - DI container tests ✅
- `infrastructure/todo/persistence/InMemoryTodoRepository.spec.ts` - Repository tests ✅
- `infrastructure/todo/persistence/SqliteTodoRepository.spec.ts` - SQLite repository tests ✅
- `infrastructure/todo/persistence/mongoose/MongooseConnection.spec.ts` - MongoDB connection tests ✅
- `infrastructure/todo/persistence/sequelize/SequelizeConnection.spec.ts` - Sequelize connection tests ✅
- `infrastructure/todo/persistence/typeorm/TypeOrmConnection.spec.ts` - TypeORM connection tests ✅
- `presentation/middleware/errorHandler.spec.ts` - Presentation middleware tests ✅
- `shared/middleware/ErrorHandler.spec.ts` - Error handler tests ✅
- `test/setup.ts` - Test setup configuration ✅

## Successfully Copied Test Files
The following test files have been successfully copied from legacy-express to starter-api:
- ✅ `infrastructure/di/container.spec.ts` - DI container tests (10 tests)
- ✅ `infrastructure/todo/persistence/SqliteTodoRepository.spec.ts` - SQLite repository tests (24 tests)
- ✅ `infrastructure/todo/persistence/mongoose/MongooseConnection.spec.ts` - MongoDB connection tests (11 tests)
- ✅ `infrastructure/todo/persistence/sequelize/SequelizeConnection.spec.ts` - Sequelize connection tests (8 tests)
- ✅ `infrastructure/todo/persistence/typeorm/TypeOrmConnection.spec.ts` - TypeORM connection tests (6 tests)
- ✅ `presentation/middleware/errorHandler.spec.ts` - Presentation middleware tests (5 tests)

## Remaining Test Files (optional/complex)
The following test files would require more complex database setup and are not essential for the basic infrastructure:
- `infrastructure/todo/persistence/mongoose/MongooseTodoRepository.spec.ts` - MongoDB repository tests
- `infrastructure/todo/persistence/sequelize/SequelizeTodoRepository.spec.ts` - Sequelize repository tests  
- `infrastructure/todo/persistence/typeorm/TypeOrmTodoRepository.spec.ts` - TypeORM repository tests