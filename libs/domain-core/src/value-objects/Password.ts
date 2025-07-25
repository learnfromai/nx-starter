import { ValueObject } from './ValueObject';
import { InvalidPasswordException } from '../exceptions/DomainExceptions';

/**
 * Password value object - ensures password meets security requirements
 */
export class Password extends ValueObject<string> {
  private static readonly MIN_LENGTH = 8;
  private static readonly HAS_UPPERCASE = /[A-Z]/;
  private static readonly HAS_LOWERCASE = /[a-z]/;
  private static readonly HAS_NUMBER = /[0-9]/;

  constructor(value: string) {
    super(value);
    this.validate();
  }

  protected validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new InvalidPasswordException('Password is required');
    }

    if (this.value.length < Password.MIN_LENGTH) {
      throw new InvalidPasswordException(`Password must be at least ${Password.MIN_LENGTH} characters long`);
    }

    if (!Password.HAS_UPPERCASE.test(this.value)) {
      throw new InvalidPasswordException('Password must contain at least one uppercase letter');
    }

    if (!Password.HAS_LOWERCASE.test(this.value)) {
      throw new InvalidPasswordException('Password must contain at least one lowercase letter');
    }

    if (!Password.HAS_NUMBER.test(this.value)) {
      throw new InvalidPasswordException('Password must contain at least one number');
    }
  }

  /**
   * Returns true if password meets all security requirements
   */
  public static isValidPassword(value: string): boolean {
    try {
      new Password(value);
      return true;
    } catch {
      return false;
    }
  }
}