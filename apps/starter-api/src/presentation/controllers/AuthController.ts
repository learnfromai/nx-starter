import { injectable, inject } from 'tsyringe';
import {
  Controller,
  Post,
  Body,
  HttpCode,
} from 'routing-controllers';
import {
  RegisterUserUseCase,
  TOKENS,
  UserValidationService,
  USER_VALIDATION_TOKENS,
  UserMapper,
} from '@nx-starter/application-core';
import {
  RegisterUserRequestDto,
  UserRegistrationDto,
} from '@nx-starter/application-core';
import { ApiResponseBuilder } from '../dto/ApiResponse';

/**
 * REST API Controller for Authentication operations
 * Follows Clean Architecture - Controllers are part of the presentation layer
 */
@Controller('/auth')
@injectable()
export class AuthController {
  constructor(
    @inject(TOKENS.RegisterUserUseCase)
    private registerUserUseCase: RegisterUserUseCase,
    @inject(USER_VALIDATION_TOKENS.UserValidationService)
    private validationService: UserValidationService
  ) {}

  /**
   * POST /api/auth/register - Register a new user
   */
  @Post('/register')
  @HttpCode(201)
  async register(@Body() body: RegisterUserRequestDto): Promise<{
    success: boolean;
    data: UserRegistrationDto;
  }> {
    const validatedData = this.validationService.validateRegisterCommand(body);
    const user = await this.registerUserUseCase.execute(validatedData);
    const userDto = UserMapper.toRegistrationDto(user);

    return ApiResponseBuilder.success(userDto);
  }
}