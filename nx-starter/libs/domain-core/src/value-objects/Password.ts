import { ValueObject } from './ValueObject';

/**
 * Plain text password value object for validation
 * This is only used during registration/login before hashing
 */
export class Password extends ValueObject<string> {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;

  constructor(value: string) {
    super(value);
  }

  protected validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    if (value.length < Password.MIN_LENGTH) {
      throw new Error(`Password must be at least ${Password.MIN_LENGTH} characters long`);
    }

    if (value.length > Password.MAX_LENGTH) {
      throw new Error(`Password must be less than ${Password.MAX_LENGTH} characters long`);
    }

    // Check for at least one uppercase, one lowercase, and one digit
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one digit');
    }
  }

  static isValid(password: string): boolean {
    try {
      new Password(password);
      return true;
    } catch {
      return false;
    }
  }
}