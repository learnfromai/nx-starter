import { injectable, inject } from 'tsyringe';
import { User } from '@nx-starter/shared-domain';
import type { IUserRepository } from '@nx-starter/shared-domain';
import { TOKENS } from '../../di/tokens';

/**
 * Use case for getting user profile
 * Handles retrieving user information
 */
@injectable()
export class GetUserProfileUseCase {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}