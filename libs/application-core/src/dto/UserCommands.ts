/**
 * User-related command DTOs for CQRS pattern
 * Commands represent user intents to modify state
 */

/**
 * Request DTOs for API endpoints
 */
export interface RegisterUserRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}