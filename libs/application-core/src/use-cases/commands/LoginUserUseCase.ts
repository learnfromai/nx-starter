import { injectable, inject } from 'tsyringe';
import { User, IUserRepository } from '@nx-starter/domain-core';
import { 
  InvalidCredentialsException,
  MissingIdentifierException,
  MissingPasswordException,
  InvalidEmailFormatException 
} from '@nx-starter/domain-core';
import { LoginUserCommand } from '../../dto/UserCommands';
import { IPasswordHashingService } from '../../services/PasswordHashingService';
import { IJwtTokenService, JwtPayload } from '../../services/JwtTokenService';
import { TOKENS } from '../../di/tokens';

/**
 * Login User Use Case
 * Handles user authentication following Clean Architecture principles
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
   * 1. Validate request data
   * 2. Find user by email or username
   * 3. Verify password
   * 4. Generate JWT token with user claims
   * 5. Return token and user profile
   */
  async execute(command: LoginUserCommand): Promise<{ token: string; user: User }> {
    // 1. Validate request data
    this.validateLoginCommand(command);

    // 2. Find user by email or username
    const user = await this.findUserByIdentifier(command);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // 3. Verify password
    const isPasswordValid = await this.passwordHashingService.compare(
      command.password,
      user.hashedPassword.value
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // 4. Generate JWT token with user claims
    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email.value,
      username: user.username.value,
      role: 'user', // Default role - can be extended later
    };
    const token = this.jwtTokenService.generateToken(tokenPayload);

    // 5. Return token and user profile
    return { token, user };
  }

  /**
   * Validates the login command data
   */
  private validateLoginCommand(command: LoginUserCommand): void {
    // Check if either email or username is provided
    if (!command.email && !command.username) {
      throw new MissingIdentifierException();
    }

    // Check if password is provided
    if (!command.password || command.password.trim() === '') {
      throw new MissingPasswordException();
    }

    // If email is provided, validate format
    if (command.email && !this.isValidEmail(command.email)) {
      throw new InvalidEmailFormatException();
    }
  }

  /**
   * Finds user by email or username identifier
   */
  private async findUserByIdentifier(command: LoginUserCommand): Promise<User | undefined> {
    if (command.email) {
      return await this.userRepository.getByEmail(command.email);
    } else if (command.username) {
      return await this.userRepository.getByUsername(command.username);
    }
    return undefined;
  }

  /**
   * Basic email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}