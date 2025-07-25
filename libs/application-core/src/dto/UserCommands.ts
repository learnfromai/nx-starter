/**
 * User-related command DTOs for CQRS pattern
 * Commands represent user intents to modify state
 */

// Register User Command
export interface RegisterUserCommand {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Request DTOs for API endpoints
 */
export interface RegisterUserRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}