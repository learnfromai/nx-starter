import { injectable, inject } from 'tsyringe';
import { 
  User, 
  IUserRepository,
  IRefreshTokenRepository,
  AuthenticationDomainService,
  InvalidCredentialsException,
  UserId
} from '@nx-starter/shared-domain';
import type { LoginCommand } from '../../dto/AuthCommands';
import type { AuthenticationDto } from '../../dto/AuthDto';
import type { IPasswordHashingService } from '../../interfaces/IPasswordHashingService';
import type { IJwtService } from '../../interfaces/IJwtService';
import { TOKENS } from '../../di/tokens';

@injectable()
export class LoginUseCase {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.RefreshTokenRepository) private refreshTokenRepository: IRefreshTokenRepository,
    @inject(TOKENS.PasswordHashingService) private passwordHashingService: IPasswordHashingService,
    @inject(TOKENS.JwtService) private jwtService: IJwtService
  ) {}

  async execute(command: LoginCommand): Promise<AuthenticationDto> {
    // Validate command using domain service
    const validation = AuthenticationDomainService.validateLogin(
      command.email,
      command.password
    );

    if (!validation.isValid) {
      throw new InvalidCredentialsException();
    }

    // Find user by email
    const user = await this.userRepository.getByEmail(command.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Verify password
    const isValidPassword = await this.passwordHashingService.comparePassword(
      command.password,
      user.password.value
    );

    if (!isValidPassword) {
      throw new InvalidCredentialsException();
    }

    // Generate JWT tokens
    const tokenPayload = {
      userId: user.stringId!,
      email: user.email.value
    };

    const tokens = this.jwtService.generateTokens(tokenPayload);

    // Store refresh token
    const refreshToken = AuthenticationDomainService.createRefreshToken(
      new UserId(user.stringId!),
      tokens.refreshToken,
      7 * 24 * 60 * 60 // 7 days in seconds
    );

    await this.refreshTokenRepository.create(refreshToken);

    // Return authentication DTO
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.stringId!,
        firstName: user.firstName.value,
        lastName: user.lastName.value,
        email: user.email.value,
        fullName: user.fullName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      expiresIn: 15 * 60 // 15 minutes in seconds
    };
  }
}