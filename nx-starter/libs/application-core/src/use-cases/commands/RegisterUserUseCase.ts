import { injectable, inject } from 'tsyringe';
import { User } from '@nx-starter/shared-domain';
import { AuthService } from '../../services/AuthService';
import type { RegisterUserCommand } from '../../dto/UserCommands';
import type { AuthResponseDto } from '../../dto/UserDto';
import { TOKENS } from '../../di/tokens';

/**
 * Use case for registering a new user
 * Handles all business logic and validation for user registration
 */
@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TOKENS.AuthService) private authService: AuthService
  ) {}

  async execute(command: RegisterUserCommand): Promise<AuthResponseDto> {
    return await this.authService.register(
      command.firstName,
      command.lastName,
      command.email,
      command.password
    );
  }
}