import { injectable, inject } from 'tsyringe';
import { 
  User, 
  Email, 
  FirstName, 
  LastName, 
  Password,
  UsernameGenerationService,
  UserAlreadyExistsException
} from '@nx-starter/domain-core';
import type { IUserRepository } from '@nx-starter/domain-core';
import type { RegisterUserCommand } from '../../validation/UserValidationSchemas';
import { TOKENS } from '../../di/tokens';

/**
 * Use case for registering a new user
 * Handles all business logic and validation for user registration
 */
@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.UsernameGenerationService) private usernameGenerationService: UsernameGenerationService
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    // Create value objects (domain validation happens here)
    const email = new Email(command.email);
    const firstName = new FirstName(command.firstName);
    const lastName = new LastName(command.lastName);
    const password = new Password(command.password);

    // Check if email already exists (business rule)
    if (await this.userRepository.emailExists(email.value)) {
      throw new UserAlreadyExistsException(email.value);
    }

    // Generate unique username from email
    const username = await this.usernameGenerationService.generateUniqueUsername(email);

    // Create user entity with domain logic
    const user = new User(
      firstName,
      lastName,
      email,
      username,
      password,
      new Date()
    );

    // Validate business invariants
    user.validate();

    // Persist using repository
    const id = await this.userRepository.create(user);

    // Return the created user with ID
    return new User(
      firstName,
      lastName,
      email,
      username,
      password,
      user.createdAt,
      id
    );
  }
}