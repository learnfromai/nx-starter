import { User } from '@nx-starter/shared-domain';
import { UserDto, AuthenticationDto, TokenDto } from '../dto/UserDto';
import { TokenData } from '@nx-starter/shared-domain';

/**
 * User mapper for converting between domain entities and DTOs
 */
export class UserMapper {
  /**
   * Maps a User domain entity to a UserDto
   */
  static toDto(user: User): UserDto {
    return {
      id: user.stringId!,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailValue,
      fullName: user.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Maps a User and token data to an AuthenticationDto
   */
  static toAuthenticationDto(user: User, tokenData: TokenData): AuthenticationDto {
    return {
      user: this.toDto(user),
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresIn: tokenData.expiresIn,
    };
  }

  /**
   * Maps token data to a TokenDto
   */
  static toTokenDto(tokenData: TokenData): TokenDto {
    return {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresIn: tokenData.expiresIn,
    };
  }
}