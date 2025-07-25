import { injectable, inject } from 'tsyringe';
import {
  Controller,
  Post,
  Body,
  HttpCode,
} from 'routing-controllers';
import {
  RegisterUserUseCase,
  LoginUserUseCase,
  TOKENS,
  UserValidationService,
  RegisterUserRequestDto,
  LoginUserRequestDto,
  UserMapper,
} from '@nx-starter/application-core';
import { ApiResponseBuilder } from '../dto/ApiResponse';

/**
 * Authentication Controller
 * Handles user authentication and registration
 */
@Controller('/auth')
@injectable()
export class AuthController {
  constructor(
    @inject(TOKENS.RegisterUserUseCase)
    private registerUserUseCase: RegisterUserUseCase,
    @inject(TOKENS.LoginUserUseCase)
    private loginUserUseCase: LoginUserUseCase,
    @inject(TOKENS.UserValidationService)
    private validationService: UserValidationService
  ) {}

  /**
   * POST /api/auth/register - Register a new user
   * 
   * Core Registration Processing:
   * WHEN a client sends POST request to /api/auth/register with firstName, lastName, email, and password 
   * THE SYSTEM SHALL validate all required fields, generate username from email prefix, create user account, and return HTTP 201 with user ID
   */
  @Post('/register')
  @HttpCode(201)
  async register(@Body() body: RegisterUserRequestDto) {
    // Validate request data
    const validatedCommand = this.validationService.validateRegisterCommand(body);

    // Execute registration use case
    const user = await this.registerUserUseCase.execute(validatedCommand);

    // Map to response DTO and return success
    const userResponseDto = UserMapper.toRegisterResponseDto(user);
    return ApiResponseBuilder.success(userResponseDto);
  }

  /**
   * POST /api/auth/login - Authenticate user
   * 
   * Core Authentication:
   * WHEN a client sends POST request to /api/auth/login with valid email and password in JSON format 
   * THE SYSTEM SHALL authenticate the credentials and return HTTP 200 with JWT token and user profile
   * 
   * WHEN a client sends POST request to /api/auth/login with valid username and password in JSON format
   * THE SYSTEM SHALL authenticate the credentials and return HTTP 200 with JWT token and user profile
   * 
   * WHEN a client sends authentication request with valid credentials 
   * THE SYSTEM SHALL generate JWT token with 24-hour expiration and include user ID, email, and role claims
   * 
   * Request Validation & Error Handling:
   * - Missing email/username: HTTP 400 with AUTH_MISSING_IDENTIFIER
   * - Missing password: HTTP 400 with AUTH_MISSING_PASSWORD  
   * - Invalid email format: HTTP 400 with AUTH_INVALID_EMAIL
   * - Invalid credentials: HTTP 401 with AUTH_INVALID_CREDENTIALS
   * - Failed attempts logged with IP address and timestamp
   */
  @Post('/login')
  @HttpCode(200)
  async login(@Body() body: LoginUserRequestDto) {
    // Validate and transform request data to command
    const validatedCommand = this.validationService.validateLoginRequest(body);

    // Execute authentication use case
    const authResult = await this.loginUserUseCase.execute(validatedCommand);

    // Map to response DTO and return success
    const loginResponseDto = UserMapper.toLoginResponseDto(authResult.user, authResult.token);
    return ApiResponseBuilder.success(loginResponseDto);
  }

}