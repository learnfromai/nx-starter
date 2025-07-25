/**
 * User Command DTOs
 * Commands for user-related operations following CQRS pattern
 */

export interface RegisterUserCommand {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginUserCommand {
  email?: string;
  username?: string;
  password: string;
}