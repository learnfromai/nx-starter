/**
 * User Data Transfer Objects
 * Used for transferring user data between application layers
 */

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  fullName: string;
  createdAt: string; // ISO date string
}

/**
 * User registration response DTO
 */
export interface UserRegistrationDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  fullName: string;
  createdAt: string; // ISO date string
}