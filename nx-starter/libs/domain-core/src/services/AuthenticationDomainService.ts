import { User } from '../entities/User';
import { RefreshToken } from '../entities/RefreshToken';
import { Email } from '../value-objects/Email';
import { PersonName } from '../value-objects/PersonName';
import { HashedPassword } from '../value-objects/HashedPassword';
import { UserId } from '../value-objects/UserId';
import { 
  UserAlreadyExistsException, 
  InvalidCredentialsException,
  TokenExpiredException,
  TokenRevokedException
} from '../exceptions/DomainExceptions';

/**
 * Domain Service for Authentication Business Logic
 * Contains business rules that don't naturally fit in a single entity
 */
export class AuthenticationDomainService {
  /**
   * Validates user registration data
   */
  static validateRegistration(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      new PersonName(firstName);
    } catch (error) {
      errors.push(`First name: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
      new PersonName(lastName);
    } catch (error) {
      errors.push(`Last name: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
      new Email(email);
    } catch (error) {
      errors.push(`Email: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Password validation (plain text validation before hashing)
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password && password.length > 128) {
      errors.push('Password is too long (max 128 characters)');
    }

    if (password && !/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (password && !/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (password && !/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Creates a new user for registration
   */
  static createUser(
    firstName: string,
    lastName: string,
    email: string,
    hashedPassword: HashedPassword
  ): User {
    return new User(
      firstName,
      lastName,
      email,
      hashedPassword,
      new Date(),
      new Date(),
      UserId.generate()
    );
  }

  /**
   * Validates if a user can be created with the given email
   */
  static canCreateUser(email: string, existingUsers: User[]): boolean {
    const emailValue = new Email(email);
    return !existingUsers.some(user => user.hasEmail(emailValue));
  }

  /**
   * Validates login credentials
   */
  static validateLogin(email: string, password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      new Email(email);
    } catch (error) {
      errors.push('Invalid email format');
    }

    if (!password || password.length === 0) {
      errors.push('Password is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Creates a refresh token for a user
   */
  static createRefreshToken(userId: UserId, token: string, expiresIn: number): RefreshToken {
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + expiresIn * 1000);

    return new RefreshToken(userId, token, expiresAt);
  }

  /**
   * Validates if a refresh token is still valid
   */
  static validateRefreshToken(token: RefreshToken): { isValid: boolean; reason?: string } {
    if (token.isRevoked) {
      return { isValid: false, reason: 'Token has been revoked' };
    }

    if (token.isExpired()) {
      return { isValid: false, reason: 'Token has expired' };
    }

    return { isValid: true };
  }

  /**
   * Cleans up expired refresh tokens
   */
  static filterExpiredTokens(tokens: RefreshToken[]): RefreshToken[] {
    return tokens.filter(token => !token.isExpired());
  }

  /**
   * Validates password strength
   */
  static validatePasswordStrength(password: string): { isStrong: boolean; score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    else feedback.push('Use at least 8 characters');

    if (password.length >= 12) score++;
    else feedback.push('Use 12 or more characters for better security');

    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score++;
    else feedback.push('Add numbers');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push('Add special characters');

    // Common patterns check
    if (!/(.)\1{2,}/.test(password)) score++;
    else feedback.push('Avoid repeating characters');

    return {
      isStrong: score >= 4,
      score,
      feedback
    };
  }

  /**
   * Validates user profile update
   */
  static validateProfileUpdate(
    firstName?: string,
    lastName?: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (firstName !== undefined) {
      try {
        new PersonName(firstName);
      } catch (error) {
        errors.push(`First name: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (lastName !== undefined) {
      try {
        new PersonName(lastName);
      } catch (error) {
        errors.push(`Last name: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}