import { createParamDecorator, BadRequestError } from 'routing-controllers';
import { ZodError } from 'zod';
import {
  CreateTodoCommandValidationService,
  UpdateTodoCommandValidationService,
  DeleteTodoCommandValidationService,
  ToggleTodoCommandValidationService,
  CreateTodoCommand,
  UpdateTodoCommand,
  DeleteTodoCommand,
  ToggleTodoCommand
} from '@nx-starter/application-core';

/**
 * Custom parameter decorator for validating CreateTodoCommand
 * Automatically validates request body using Zod schema
 */
export function ValidatedCreateTodoCommand() {
  return createParamDecorator({
    value: (action) => {
      try {
        const validationService = new CreateTodoCommandValidationService();
        return validationService.validate(action.request.body);
      } catch (error) {
        if (error instanceof ZodError) {
          throw new BadRequestError(formatZodError(error));
        }
        throw error;
      }
    }
  });
}

/**
 * Custom parameter decorator for validating UpdateTodoCommand
 * Merges route parameter ID with request body and validates
 */
export function ValidatedUpdateTodoCommand() {
  return createParamDecorator({
    value: (action) => {
      try {
        const validationService = new UpdateTodoCommandValidationService();
        const id = action.request.params.id;
        return validationService.validateWithId(action.request.body, id);
      } catch (error) {
        if (error instanceof ZodError) {
          throw new BadRequestError(formatZodError(error));
        }
        throw error;
      }
    }
  });
}

/**
 * Custom parameter decorator for validating DeleteTodoCommand
 * Validates route parameter ID
 */
export function ValidatedDeleteTodoCommand() {
  return createParamDecorator({
    value: (action) => {
      try {
        const validationService = new DeleteTodoCommandValidationService();
        const id = action.request.params.id;
        return validationService.validateId(id);
      } catch (error) {
        if (error instanceof ZodError) {
          throw new BadRequestError(formatZodError(error));
        }
        throw error;
      }
    }
  });
}

/**
 * Custom parameter decorator for validating ToggleTodoCommand
 * Validates route parameter ID
 */
export function ValidatedToggleTodoCommand() {
  return createParamDecorator({
    value: (action) => {
      try {
        const validationService = new ToggleTodoCommandValidationService();
        const id = action.request.params.id;
        return validationService.validateId(id);
      } catch (error) {
        if (error instanceof ZodError) {
          throw new BadRequestError(formatZodError(error));
        }
        throw error;
      }
    }
  });
}

/**
 * Formats Zod validation errors into user-friendly message
 * @param error - ZodError instance
 * @returns Formatted error message
 */
function formatZodError(error: ZodError): string {
  if (!error.issues || !Array.isArray(error.issues)) {
    return `Validation failed: ${error.message || 'Unknown validation error'}`;
  }

  const messages = error.issues.map(issue => {
    const path = issue.path && issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `${path}${issue.message}`;
  });
  
  return `Validation failed: ${messages.join(', ')}`;
}

// Export types for better TypeScript experience
export type {
  CreateTodoCommand,
  UpdateTodoCommand,
  DeleteTodoCommand,
  ToggleTodoCommand
};