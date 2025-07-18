# Enhanced AsyncHandler and Response Standardization

## Overview

The Enhanced AsyncHandler provides a standardized way to handle both success and error responses in Express controllers while maintaining backward compatibility with the existing error handling system.

## Features

1. **Consistent Response Structure**: All responses follow the same format
2. **Multiple Response Patterns**: Support for both helper methods and return values
3. **Type Safety**: Full TypeScript support with proper types
4. **Error Handling**: Integrates with existing error handling system
5. **Backward Compatibility**: Existing controllers continue to work unchanged

## Response Types

### Success Responses

```typescript
// Success with data
{
  success: true,
  data: any
}

// Success with message
{
  success: true,
  message: string
}
```

### Error Responses

```typescript
{
  success: false,
  error: string,
  code?: string,
  details?: any
}
```

## Usage Patterns

### Pattern 1: Using Response Helper Methods

```typescript
import { enhancedAsyncHandler, EnhancedRequest } from '../shared/middleware/ErrorHandler';

export const myMethod = enhancedAsyncHandler(
  async (req: EnhancedRequest): Promise<void> => {
    const data = await someService.getData();
    
    // Send success response with data
    req.respond.successData(data);
    
    // Or send success response with message
    req.respond.successMessage('Operation completed successfully');
    
    // Or send error response
    req.respond.error('Something went wrong', 500, 'ERROR_CODE');
  }
);
```

### Pattern 2: Using Return Values

```typescript
import { enhancedAsyncHandler, createResponse } from '../shared/middleware/ErrorHandler';

export const myMethod = enhancedAsyncHandler(
  async (req: EnhancedRequest) => {
    const data = await someService.getData();
    
    // Return success response with data
    return createResponse.data(data);
    
    // Or return success response with message
    return createResponse.message('Operation completed successfully');
    
    // Or return error response
    return createResponse.error('Something went wrong', 'ERROR_CODE');
  }
);
```

## Migration Examples

### Before (Traditional AsyncHandler)

```typescript
export const getAllTodos = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const todos = await this.getAllTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);

    res.json({
      success: true,
      data: todoDtos,
    });
  }
);
```

### After (Enhanced AsyncHandler - Helper Method)

```typescript
export const getAllTodos = enhancedAsyncHandler(
  async (req: EnhancedRequest): Promise<void> => {
    const todos = await this.getAllTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);
    
    req.respond.successData(todoDtos);
  }
);
```

### After (Enhanced AsyncHandler - Return Value)

```typescript
export const getAllTodos = enhancedAsyncHandler(
  async (req: EnhancedRequest) => {
    const todos = await this.getAllTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);
    
    return createResponse.data(todoDtos);
  }
);
```

## Status Codes

By default, the enhanced async handler uses these status codes:
- `200` for success responses
- `400` for returned error responses
- Existing error handler status codes for thrown exceptions

You can specify custom status codes:

```typescript
// Custom status code for creation
req.respond.successData(newTodo, 201);

// Custom status code for error
req.respond.error('Bad request', 400);
```

## Benefits

1. **Reduced Boilerplate**: No need to manually construct response objects
2. **Consistency**: All responses follow the same structure
3. **Type Safety**: TypeScript ensures correct response format
4. **Flexibility**: Multiple ways to send responses
5. **Backward Compatibility**: Existing controllers continue to work
6. **Easy Testing**: Response helpers are easily mockable

## Integration with Existing Error Handling

The enhanced async handler integrates seamlessly with the existing error handling system:

- Thrown exceptions are caught and handled by `handleControllerError`
- DomainExceptions, ZodErrors, and other error types work as before
- Error logging and status code mapping remain unchanged

## Best Practices

1. **Use Type Annotations**: Always use `EnhancedRequest` type for the request parameter
2. **Consistent Pattern**: Choose either helper methods or return values and stick with it
3. **Status Codes**: Use appropriate HTTP status codes for different operations
4. **Error Handling**: Let exceptions bubble up for centralized error handling
5. **Testing**: Test both success and error scenarios