import bcrypt from 'bcryptjs';

/**
 * Value object for User Password
 * Ensures type safety and encapsulates validation logic
 */
export class UserPassword {
  private readonly _hashedValue: string;

  constructor(value: string, isHashed = false) {
    if (isHashed) {
      this._hashedValue = value;
    } else {
      this.validate(value);
      this._hashedValue = bcrypt.hashSync(value, 12);
    }
  }

  get hashedValue(): string {
    return this._hashedValue;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }

    if (value.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (value.length > 128) {
      throw new Error('Password is too long');
    }

    // At least one uppercase, one lowercase, one number, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(value)) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
  }

  /**
   * Verify if the provided plain text password matches the hashed password
   */
  verify(plainTextPassword: string): boolean {
    return bcrypt.compareSync(plainTextPassword, this._hashedValue);
  }

  equals(other: UserPassword): boolean {
    return this._hashedValue === other._hashedValue;
  }

  toString(): string {
    return '[PROTECTED]';
  }
}