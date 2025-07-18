import { injectable, inject } from 'tsyringe';
import { User, Password } from '@nx-starter/shared-domain';
import type { IUserRepository, IPasswordService, ITokenService, TokenData } from '@nx-starter/shared-domain';
import type { LoginCommand } from '../../dto/UserCommands';
import { TOKENS } from '../../di/tokens';

/**
 * Use case for user login
 * Handles authentication logic and token generation
 */
@injectable()
export class LoginUseCase {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.PasswordService) private passwordService: IPasswordService,
    @inject(TOKENS.TokenService) private tokenService: ITokenService
  ) {}

  async execute(command: LoginCommand): Promise<{ user: User; tokens: TokenData }> {
    // Find user by email
    const user = await this.userRepository.getByEmail(command.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const password = new Password(command.password);
    const isPasswordValid = await this.passwordService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.stringId!,
      email: user.emailValue,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const tokens = await this.tokenService.generateTokens(tokenPayload);

    return {
      user,
      tokens,
    };
  }
}