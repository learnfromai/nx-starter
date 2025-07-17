# JWT Authentication Implementation

## Overview

This implementation adds JWT-based authentication to the nx-starter project following the existing clean architecture patterns. The authentication system includes user registration, login, token refresh, and profile management.

## Architecture

### Domain Layer (`libs/domain-core`)
- **User Entity**: Immutable user entity with business logic
- **Value Objects**: Email, UserId, Password, HashedPassword for type safety
- **Repository Interface**: IUserRepository for persistence abstraction
- **Service Interfaces**: IPasswordService, ITokenService for authentication operations

### Application Layer (`libs/application-core`)
- **Use Cases**: RegisterUserUseCase, LoginUseCase, RefreshTokenUseCase, GetUserProfileUseCase
- **DTOs**: UserDto, AuthenticationDto, TokenDto for data transfer
- **Commands**: RegisterUserCommand, LoginCommand with Zod validation
- **Mappers**: UserMapper for domain-DTO conversion

### Infrastructure Layer (`apps/starter-api/src/infrastructure`)
- **Repository**: TypeOrmUserRepository for database operations
- **Services**: BcryptPasswordService, JwtTokenService for authentication
- **Entity**: UserEntity for TypeORM mapping

### Presentation Layer (`apps/starter-api/src/presentation`)
- **Controller**: AuthController for handling HTTP requests
- **Routes**: Authentication routes (/auth/register, /auth/login, etc.)
- **Middleware**: JWT authentication middleware for protected routes

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile (protected)

### Protected Todo Endpoints
All todo endpoints now require JWT authentication:
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

## Security Features

### Password Security
- Minimum 8 characters, maximum 128 characters
- Must contain uppercase, lowercase, and digit
- Hashed using bcrypt with salt rounds of 12

### JWT Security
- Access tokens expire in 15 minutes (configurable)
- Refresh tokens expire in 7 days (configurable)
- Tokens include issuer and audience claims
- Secure token verification middleware

### Database Security
- User passwords are never stored in plain text
- Email addresses are indexed and unique
- User IDs use UUID format for security

## Environment Variables

```bash
# JWT Configuration
JWT_ACCESS_SECRET=your-secret-key-access
JWT_REFRESH_SECRET=your-secret-key-refresh
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Database Configuration
DB_TYPE=sqlite
DATABASE_URL=./data/app.db
```

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

### Login User
```bash
POST /api/auth/login
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

### Access Protected Endpoint
```bash
GET /api/todos
Authorization: Bearer <access_token>
```

## Testing

### Unit Tests
- Domain entities and value objects have comprehensive tests
- Password validation and user entity tests included
- Email validation tests for various formats

### Integration Tests
- Postman collection provided with authentication flows
- Happy path and error case testing
- Token management and refresh scenarios

### Manual Testing
Run the API server and use the provided Postman collection to test all endpoints.

## Error Handling

### Validation Errors (400)
- Invalid email format
- Weak password requirements
- Missing required fields

### Authentication Errors (401)
- Invalid credentials
- Missing access token
- Expired or invalid tokens

### Authorization Errors (403)
- Invalid token signature
- Token verification failures

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `firstName` (VARCHAR(50))
- `lastName` (VARCHAR(50))
- `email` (VARCHAR(254), Unique, Indexed)
- `password` (VARCHAR(255), Hashed)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## Files Changed/Added

### Domain Layer
- `libs/domain-core/src/entities/User.ts`
- `libs/domain-core/src/value-objects/Email.ts`
- `libs/domain-core/src/value-objects/UserId.ts`
- `libs/domain-core/src/value-objects/Password.ts`
- `libs/domain-core/src/value-objects/HashedPassword.ts`
- `libs/domain-core/src/repositories/IUserRepository.ts`
- `libs/domain-core/src/services/IPasswordService.ts`
- `libs/domain-core/src/services/ITokenService.ts`

### Application Layer  
- `libs/application-core/src/dto/UserCommands.ts`
- `libs/application-core/src/dto/UserDto.ts`
- `libs/application-core/src/mappers/UserMapper.ts`
- `libs/application-core/src/use-cases/commands/RegisterUserUseCase.ts`
- `libs/application-core/src/use-cases/commands/LoginUseCase.ts`
- `libs/application-core/src/use-cases/commands/RefreshTokenUseCase.ts`
- `libs/application-core/src/use-cases/queries/GetUserProfileUseCase.ts`
- `libs/application-core/src/di/tokens.ts` (updated)

### Infrastructure Layer
- `apps/starter-api/src/infrastructure/user/persistence/typeorm/UserEntity.ts`
- `apps/starter-api/src/infrastructure/user/persistence/typeorm/TypeOrmUserRepository.ts`
- `apps/starter-api/src/infrastructure/services/BcryptPasswordService.ts`
- `apps/starter-api/src/infrastructure/services/JwtTokenService.ts`
- `apps/starter-api/src/infrastructure/di/container.ts` (updated)

### Presentation Layer
- `apps/starter-api/src/presentation/controllers/AuthController.ts`
- `apps/starter-api/src/presentation/middleware/authMiddleware.ts`
- `apps/starter-api/src/presentation/routes/authRoutes.ts`
- `apps/starter-api/src/presentation/routes/index.ts` (updated)
- `apps/starter-api/src/presentation/routes/todoRoutes.ts` (updated)

### Testing & Documentation
- `apps/starter-api/postman-collection-auth.json` (new comprehensive collection)
- `libs/domain-core/src/entities/User.spec.ts`
- `libs/domain-core/src/value-objects/Email.spec.ts`
- `libs/domain-core/src/value-objects/Password.spec.ts`

## Next Steps

1. **Deploy & Test**: Deploy to a test environment and run full integration tests
2. **Performance**: Add caching for frequently accessed user data
3. **Security**: Add rate limiting, CORS configuration, and security headers
4. **Monitoring**: Add logging and monitoring for authentication events
5. **Features**: Add password reset, email verification, and user management endpoints