import { injectable, inject } from 'tsyringe';
import { 
  IUserRepository,
  UserNotFoundException
} from '@nx-starter/shared-domain';
import type { UserProfileDto } from '../../dto/AuthDto';
import { TOKENS } from '../../di/tokens';

@injectable()
export class GetUserProfileUseCase {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<UserProfileDto> {
    // Find user by ID
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Return user profile DTO
    return {
      id: user.stringId!,
      firstName: user.firstName.value,
      lastName: user.lastName.value,
      email: user.email.value,
      fullName: user.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}