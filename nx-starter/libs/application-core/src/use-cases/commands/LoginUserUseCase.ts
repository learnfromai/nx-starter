import { injectable, inject } from 'tsyringe';
import { AuthService } from '../../services/AuthService';
import type { LoginUserCommand } from '../../dto/UserCommands';
import type { AuthResponseDto } from '../../dto/UserDto';
import { TOKENS } from '../../di/tokens';

/**
 * Use case for user login
 * Handles all business logic and validation for user authentication
 */
@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(TOKENS.AuthService) private authService: AuthService
  ) {}

  async execute(command: LoginUserCommand): Promise<AuthResponseDto> {
    return await this.authService.login(
      command.email,
      command.password
    );
  }
}