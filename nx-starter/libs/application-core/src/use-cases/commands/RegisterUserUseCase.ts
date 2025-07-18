import { injectable, inject } from 'tsyringe';
import { User, Password } from '@nx-starter/shared-domain';
import type { IUserRepository, IPasswordService } from '@nx-starter/shared-domain';
import type { RegisterUserCommand } from '../../dto/UserCommands';
import { TOKENS } from '../../di/tokens';

/**
 * Use case for registering a new user
 * Handles all business logic and validation for user registration
 */
@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.PasswordService) private passwordService: IPasswordService
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.getByEmail(command.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate and hash password
    const password = new Password(command.password);
    const hashedPassword = await this.passwordService.hashPassword(password);

    // Create user entity with domain logic
    const user = new User(
      command.firstName,
      command.lastName,
      command.email,
      hashedPassword,
      undefined, // no ID yet
      new Date(),
      new Date()
    );

    // Validate business invariants
    user.validate();

    // Persist using repository
    const id = await this.userRepository.create(user);

    // Return the created user with ID
    return new User(
      user.firstName,
      user.lastName,
      user.email,
      user.password,
      id,
      user.createdAt,
      user.updatedAt
    );
  }
}