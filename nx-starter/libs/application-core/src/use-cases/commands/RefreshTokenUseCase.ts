import { injectable, inject } from 'tsyringe';
import { 
  IUserRepository,
  IRefreshTokenRepository,
  AuthenticationDomainService,
  InvalidTokenException,
  TokenExpiredException,
  TokenRevokedException,
  UserId
} from '@nx-starter/shared-domain';
import type { RefreshTokenCommand } from '../../dto/AuthCommands';
import type { RefreshTokenDto } from '../../dto/AuthDto';
import type { IJwtService } from '../../interfaces/IJwtService';
import { TOKENS } from '../../di/tokens';

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.RefreshTokenRepository) private refreshTokenRepository: IRefreshTokenRepository,
    @inject(TOKENS.JwtService) private jwtService: IJwtService
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenDto> {
    // Verify refresh token
    let tokenPayload;
    try {
      tokenPayload = this.jwtService.verifyRefreshToken(command.refreshToken);
    } catch (error) {
      throw new InvalidTokenException('Invalid refresh token');
    }

    // Find refresh token in database
    const refreshToken = await this.refreshTokenRepository.getByToken(command.refreshToken);
    if (!refreshToken) {
      throw new InvalidTokenException('Refresh token not found');
    }

    // Validate refresh token using domain service
    const validation = AuthenticationDomainService.validateRefreshToken(refreshToken);
    if (!validation.isValid) {
      if (validation.reason === 'Token has expired') {
        throw new TokenExpiredException();
      }
      if (validation.reason === 'Token has been revoked') {
        throw new TokenRevokedException();
      }
      throw new InvalidTokenException(validation.reason || 'Invalid token');
    }

    // Find user
    const user = await this.userRepository.getById(tokenPayload.userId);
    if (!user) {
      throw new InvalidTokenException('User not found');
    }

    // Generate new tokens
    const newTokenPayload = {
      userId: user.stringId!,
      email: user.email.value
    };

    const newTokens = this.jwtService.generateTokens(newTokenPayload);

    // Store new refresh token
    const newRefreshToken = AuthenticationDomainService.createRefreshToken(
      new UserId(user.stringId!),
      newTokens.refreshToken,
      7 * 24 * 60 * 60 // 7 days in seconds
    );

    await this.refreshTokenRepository.create(newRefreshToken);

    // Revoke old refresh token
    await this.refreshTokenRepository.revoke(command.refreshToken);

    // Return new tokens
    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    };
  }
}