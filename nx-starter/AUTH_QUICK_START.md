# Quick Start Guide for Authentication

## Setup

1. **Install dependencies** (already done):
   ```bash
   npm install jsonwebtoken bcryptjs @types/jsonwebtoken @types/bcryptjs
   ```

2. **Configure environment variables**:
   ```bash
   cp apps/starter-api/.env.example apps/starter-api/.env
   ```
   Update `.env` with your JWT secret:
   ```
   JWT_SECRET=your-super-secret-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   ```

3. **Build the project**:
   ```bash
   npx nx build starter-api
   ```

4. **Run the server**:
   ```bash
   npx nx serve starter-api
   ```

## Testing with Postman

1. Import the collection: `apps/starter-api/postman-collection.json`
2. Run the "Authentication" folder tests
3. The happy path tests will automatically set auth tokens for subsequent requests

## Testing with curl

### Register a new user:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

### Login:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

### Use the token for protected routes:
```bash
curl -X GET http://localhost:4000/api/protected-endpoint \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Code Examples

### Protecting a route with authentication:
```typescript
import { authMiddleware } from '../middleware/authMiddleware';

router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user // User object is available after authMiddleware
    }
  });
});
```

### Optional authentication (user info if available):
```typescript
import { optionalAuthMiddleware } from '../middleware/authMiddleware';

router.get('/public-with-user-info', optionalAuthMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      isAuthenticated: !!req.user,
      user: req.user || null
    }
  });
});
```

## Error Responses

### Validation Error (400):
```json
{
  "success": false,
  "error": "Invalid email format"
}
```

### Authentication Error (401):
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### Duplicate User (409):
```json
{
  "success": false,
  "error": "User with email john.doe@example.com already exists"
}
```

## Database Schema

The User table is already defined in `apps/starter-api/prisma/schema.prisma`:
```prisma
model User {
  id        String   @id @default(cuid())
  firstName String
  lastName  String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

## Architecture Benefits

- **Clean Architecture**: Domain logic is isolated and testable
- **Dependency Injection**: Easy to swap implementations
- **Type Safety**: Full TypeScript support
- **Validation**: Domain-driven validation with proper error messages
- **Security**: Best practices for password hashing and JWT handling
- **Testability**: All layers can be unit tested independently

## Troubleshooting

1. **Build errors**: Run `npx nx build starter-api` and check for TypeScript errors
2. **Authentication not working**: Check JWT_SECRET in environment variables
3. **Database errors**: Ensure database is running and schema is up to date
4. **CORS issues**: Check CORS_ORIGIN in environment variables

## Next Steps for Development

1. Add password reset functionality
2. Implement email verification
3. Add user profile management endpoints
4. Implement role-based access control
5. Add audit logging for security events