/**
 * User Data Transfer Objects
 * For transferring user data between application layers
 */

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  createdAt: Date;
}

export interface RegisterUserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  createdAt: Date;
}

export interface LoginUserResponseDto {
  token: string;
  user: UserProfileDto;
}

export interface UserProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}