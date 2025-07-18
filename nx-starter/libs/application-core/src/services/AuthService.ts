import { injectable, inject } from 'tsyringe';
import { User } from '@nx-starter/shared-domain';
import type { IUserRepository } from '@nx-starter/shared-domain';
import { 
  UserNotFoundException, 
  InvalidCredentialsException, 
  UserAlreadyExistsException 
} from '@nx-starter/shared-domain';
import { JwtService } from './JwtService';
import { TOKENS } from '../di/tokens';
import type { AuthResponseDto } from '../dto/UserDto';

@injectable()
export class AuthService {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.JwtService) private jwtService: JwtService
  ) {}

  /**
   * Register a new user
   */
  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.getByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsException(email);
    }

    // Create new user
    const user = new User(
      firstName,
      lastName,
      email,
      password,
      new Date(),
      new Date()
    );

    // Validate user
    user.validate();

    // Save user
    const userId = await this.userRepository.create(user);

    // Create user with ID
    const createdUser = new User(
      user.firstName,
      user.lastName,
      user.email,
      user.password,
      user.createdAt,
      user.updatedAt,
      userId
    );

    // Generate JWT token
    const token = this.jwtService.generateToken({
      userId: createdUser.stringId!,
      email: createdUser.emailValue,
    });

    return {
      user: {
        id: createdUser.stringId!,
        firstName: createdUser.firstNameValue,
        lastName: createdUser.lastNameValue,
        email: createdUser.emailValue,
        createdAt: createdUser.createdAt.toISOString(),
        updatedAt: createdUser.updatedAt.toISOString(),
      },
      token,
      expiresIn: this.jwtService.getExpirationTime(),
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userRepository.getByEmail(email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Verify password
    if (!user.verifyPassword(password)) {
      throw new InvalidCredentialsException();
    }

    // Generate JWT token
    const token = this.jwtService.generateToken({
      userId: user.stringId!,
      email: user.emailValue,
    });

    return {
      user: {
        id: user.stringId!,
        firstName: user.firstNameValue,
        lastName: user.lastNameValue,
        email: user.emailValue,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      token,
      expiresIn: this.jwtService.getExpirationTime(),
    };
  }

  /**
   * Verify JWT token and return user
   */
  async verifyToken(token: string): Promise<User> {
    const payload = this.jwtService.verifyToken(token);
    
    const user = await this.userRepository.getById(payload.userId);
    if (!user) {
      throw new UserNotFoundException(payload.userId);
    }

    return user;
  }
}