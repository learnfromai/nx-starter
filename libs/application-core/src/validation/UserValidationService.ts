import { injectable, inject } from 'tsyringe';
import { ValidationService, IValidationService } from './ValidationService';
import { RegisterUserCommandSchema, LoginUserRequestSchema, LoginUserCommandSchema } from './UserValidationSchemas';
import { RegisterUserCommand, LoginUserCommand } from '../dto/UserCommands';
import { LoginUserRequestDto } from '../dto/UserRequestDtos';
import { TOKENS } from '../di/tokens';

/**
 * Validation service for RegisterUserCommand
 * Encapsulates validation logic for user registration
 */
@injectable()
export class RegisterUserValidationService extends ValidationService<unknown, RegisterUserCommand> {
  protected schema = RegisterUserCommandSchema;
}

/**
 * Validation service for LoginUserRequestDto (from API)
 * Validates and transforms login request data from API to command
 */
@injectable()
export class LoginUserRequestValidationService extends ValidationService<unknown, LoginUserRequestDto> {
  protected schema = LoginUserRequestSchema;
}

/**
 * Validation service for LoginUserCommand
 * Encapsulates validation logic for user login commands
 */
@injectable()
export class LoginUserValidationService extends ValidationService<unknown, LoginUserCommand> {
  protected schema = LoginUserCommandSchema;
}


/**
 * Composite validation service that provides all User validation operations
 * Follows the Facade pattern to provide a unified interface for User validation
 */
@injectable()
export class UserValidationService {
  constructor(
    @inject(TOKENS.RegisterUserValidationService)
    private registerValidator: RegisterUserValidationService,
    @inject(TOKENS.LoginUserRequestValidationService)
    private loginRequestValidator: LoginUserRequestValidationService,
    @inject(TOKENS.LoginUserValidationService)
    private loginValidator: LoginUserValidationService
  ) {}

  /**
   * Validates data for registering a new user
   */
  validateRegisterCommand(data: unknown): RegisterUserCommand {
    return this.registerValidator.validate(data);
  }

  /**
   * Validates login request data from API and transforms it to command
   */
  validateLoginRequest(data: unknown): LoginUserCommand {
    // First validate the request data
    const validatedRequest = this.loginRequestValidator.validate(data);
    
    // Transform to command format
    const identifier = validatedRequest.email || validatedRequest.username;
    if (!identifier) {
      throw new Error('Email or username is required');
    }
    
    return {
      identifier,
      password: validatedRequest.password,
    };
  }

  /**
   * Validates login command data  
   */
  validateLoginCommand(data: unknown): LoginUserCommand {
    return this.loginValidator.validate(data);
  }

  /**
   * Safe validation methods that don't throw exceptions
   */
  safeValidateRegisterCommand(data: unknown) {
    return this.registerValidator.safeParse(data);
  }

  safeValidateLoginRequest(data: unknown) {
    return this.loginRequestValidator.safeParse(data);
  }

  safeValidateLoginCommand(data: unknown) {
    return this.loginValidator.safeParse(data);
  }
}

// Export interfaces for dependency injection
export type IRegisterUserValidationService = IValidationService<unknown, RegisterUserCommand>;
export type ILoginUserRequestValidationService = IValidationService<unknown, LoginUserRequestDto>;
export type ILoginUserValidationService = IValidationService<unknown, LoginUserCommand>;

