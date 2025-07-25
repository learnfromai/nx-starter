import { User } from '@nx-starter/domain-core';
import { UserDto, UserRegistrationDto } from '../dto/UserDto';

/**
 * Mapper for converting between User domain entities and DTOs
 * Follows the pattern of single responsibility for data transformation
 */
export class UserMapper {
  /**
   * Converts a User domain entity to a UserDto
   */
  static toDto(user: User): UserDto {
    return {
      id: user.stringId || '',
      firstName: user.firstNameValue,
      lastName: user.lastNameValue,
      email: user.emailValue,
      username: user.usernameValue,
      fullName: user.fullName,
      createdAt: user.createdAt.toISOString(),
    };
  }

  /**
   * Converts a User domain entity to a UserRegistrationDto
   * Same as UserDto but semantically different for registration response
   */
  static toRegistrationDto(user: User): UserRegistrationDto {
    return {
      id: user.stringId || '',
      firstName: user.firstNameValue,
      lastName: user.lastNameValue,
      email: user.emailValue,
      username: user.usernameValue,
      fullName: user.fullName,
      createdAt: user.createdAt.toISOString(),
    };
  }

  /**
   * Converts an array of User domain entities to UserDto array
   */
  static toDtoArray(users: User[]): UserDto[] {
    return users.map(user => UserMapper.toDto(user));
  }
}