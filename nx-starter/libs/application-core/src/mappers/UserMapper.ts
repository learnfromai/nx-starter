import { User } from '@nx-starter/shared-domain';
import type { UserDto } from '../dto/UserDto';

/**
 * Mapper for User entity to DTO conversions
 * Handles transformation between domain entities and API DTOs
 */
export class UserMapper {
  /**
   * Convert User entity to DTO
   */
  static toDto(user: User): UserDto {
    return {
      id: user.stringId!,
      firstName: user.firstNameValue,
      lastName: user.lastNameValue,
      email: user.emailValue,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Convert array of User entities to DTOs
   */
  static toDtoArray(users: User[]): UserDto[] {
    return users.map(user => this.toDto(user));
  }

  /**
   * Create a public user DTO (without sensitive information)
   */
  static toPublicDto(user: User): Omit<UserDto, 'email'> {
    return {
      id: user.stringId!,
      firstName: user.firstNameValue,
      lastName: user.lastNameValue,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}