import { injectable, inject } from 'tsyringe';
import type { IUserRepository, ITokenService, TokenData } from '@nx-starter/shared-domain';
import type { RefreshTokenCommand } from '../../dto/UserCommands';
import { TOKENS } from '../../di/tokens';

/**
 * Use case for refreshing access tokens
 * Handles token refresh logic
 */
@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.TokenService) private tokenService: ITokenService
  ) {}

  async execute(command: RefreshTokenCommand): Promise<TokenData> {
    // Verify refresh token
    const tokenPayload = await this.tokenService.verifyRefreshToken(command.refreshToken);

    // Ensure user still exists
    const user = await this.userRepository.getById(tokenPayload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    const newTokenPayload = {
      userId: user.stringId!,
      email: user.emailValue,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return await this.tokenService.generateTokens(newTokenPayload);
  }
}