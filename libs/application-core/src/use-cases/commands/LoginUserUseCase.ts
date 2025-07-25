import { injectable, inject } from 'tsyringe';
import { User, IUserRepository } from '@nx-starter/domain-core';
import { LoginUserCommand } from '../../dto/UserCommands';
import { IPasswordHashingService } from '../../services/PasswordHashingService';
import { IJwtTokenService, TokenPayload } from '../../services/JwtTokenService';
import { 
  InvalidCredentialsException,
  AuthenticationFailedException,
  UserNotFoundException
} from '@nx-starter/domain-core';
import { TOKENS } from '../../di/tokens';

/**
 * Authentication result containing token and user info
 */
export interface AuthenticationResult {
  token: string;
  user: User;
}

/**
 * Login User Use Case
 * Handles user authentication following Clean Architecture principles
 * 
 * Core Authentication:
 * - Validates credentials against database
 * - Supports both email and username login
 * - Returns JWT token with 24-hour expiration
 * - Logs authentication attempts with security information
 */
@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository)
    private userRepository: IUserRepository,
    @inject(TOKENS.PasswordHashingService)
    private passwordHashingService: IPasswordHashingService,
    @inject(TOKENS.JwtTokenService)
    private jwtTokenService: IJwtTokenService
  ) {}

  /**
   * Executes user authentication
   * 1. Find user by email or username
   * 2. Verify password using bcrypt (minimum 12 rounds)
   * 3. Generate JWT token with user claims
   * 4. Log authentication attempt
   * 5. Return token and user profile
   */
  async execute(command: LoginUserCommand): Promise<AuthenticationResult> {
    // Log authentication attempt (IP and timestamp would be added by middleware)
    const timestamp = new Date().toISOString();
    console.log(`Authentication attempt for identifier: ${command.identifier} at ${timestamp}`);

    try {
      // 1. Find user by email or username
      const user = await this.findUserByIdentifier(command.identifier);
      
      if (!user) {
        // Log failed attempt
        console.log(`Authentication failed - user not found: ${command.identifier} at ${timestamp}`);
        throw new InvalidCredentialsException();
      }

      // 2. Verify password using bcrypt comparison
      const isPasswordValid = await this.passwordHashingService.compare(
        command.password,
        user.hashedPassword.value
      );

      if (!isPasswordValid) {
        // Log failed attempt
        console.log(`Authentication failed - invalid password for: ${command.identifier} at ${timestamp}`);
        throw new InvalidCredentialsException();
      }

      // 3. Generate JWT token with user claims (24-hour expiration)
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email.value,
        username: user.username.value,
        role: 'user' // Default role, could be extended later
      };

      const token = this.jwtTokenService.generateToken(tokenPayload);

      // Log successful authentication
      console.log(`Authentication successful for: ${command.identifier} at ${timestamp}`);

      // 4. Return authentication result
      return {
        token,
        user
      };

    } catch (error) {
      // Log authentication failure with reason
      if (error instanceof InvalidCredentialsException) {
        // Already logged above, just re-throw
        throw error;
      }
      
      console.log(`Authentication error for: ${command.identifier} at ${timestamp}:`, error);
      throw new AuthenticationFailedException('Internal authentication error');
    }
  }

  /**
   * Finds user by email or username identifier
   * Supports both login methods as required
   */
  private async findUserByIdentifier(identifier: string): Promise<User | undefined> {
    // Try to find by email first (if identifier contains @)
    if (identifier.includes('@')) {
      return await this.userRepository.getByEmail(identifier);
    }
    
    // Otherwise treat as username
    return await this.userRepository.getByUsername(identifier);
  }
}