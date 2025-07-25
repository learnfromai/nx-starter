import { injectable, inject } from 'tsyringe';
import { ValidationService, IValidationService } from './ValidationService';
import {
  RegisterUserCommandSchema,
  RegisterUserCommand,
} from './UserValidationSchemas';

/**
 * Validation service for RegisterUserCommand
 * Encapsulates validation logic for user registration
 */
@injectable()
export class RegisterUserValidationService extends ValidationService<unknown, RegisterUserCommand> {
  protected schema = RegisterUserCommandSchema;
}

// Token symbols for dependency injection
export const USER_VALIDATION_TOKENS = {
  RegisterUserValidationService: Symbol('RegisterUserValidationService'),
  UserValidationService: Symbol('UserValidationService'),
} as const;

/**
 * Composite validation service that provides all User validation operations
 * Follows the Facade pattern to provide a unified interface for User validation
 */
@injectable()
export class UserValidationService {
  constructor(
    @inject(USER_VALIDATION_TOKENS.RegisterUserValidationService)
    private registerValidator: RegisterUserValidationService
  ) {}

  /**
   * Validates data for registering a new user
   */
  validateRegisterCommand(data: unknown): RegisterUserCommand {
    return this.registerValidator.validate(data);
  }
}