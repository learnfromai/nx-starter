import { injectable, inject } from 'tsyringe';
import { 
  User, 
  IUserRepository,
  AuthenticationDomainService,
  UserAlreadyExistsException,
  HashedPassword 
} from '@nx-starter/shared-domain';
import type { RegisterUserCommand } from '../../dto/AuthCommands';
import type { UserDto } from '../../dto/AuthDto';
import type { IPasswordHashingService } from '../../interfaces/IPasswordHashingService';
import { TOKENS } from '../../di/tokens';

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.PasswordHashingService) private passwordHashingService: IPasswordHashingService
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserDto> {
    // Validate command using domain service
    const validation = AuthenticationDomainService.validateRegistration(
      command.firstName,
      command.lastName,
      command.email,
      command.password
    );

    if (!validation.isValid) {
      throw new Error(`Registration validation failed: ${validation.errors.join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await this.userRepository.getByEmail(command.email);
    if (existingUser) {
      throw new UserAlreadyExistsException(command.email);
    }

    // Hash password
    const hashedPassword = await this.passwordHashingService.hashPassword(command.password);

    // Create user entity using domain service
    const user = AuthenticationDomainService.createUser(
      command.firstName,
      command.lastName,
      command.email,
      new HashedPassword(hashedPassword)
    );

    // Validate business invariants
    user.validate();

    // Persist user
    const userId = await this.userRepository.create(user);

    // Return user DTO
    return {
      id: userId,
      firstName: user.firstName.value,
      lastName: user.lastName.value,
      email: user.email.value,
      fullName: user.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}