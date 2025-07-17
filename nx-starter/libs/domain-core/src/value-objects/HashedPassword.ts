import { ValueObject } from './ValueObject';

/**
 * Hashed password value object
 * This stores the hashed version of the password, never the plain text
 */
export class HashedPassword extends ValueObject<string> {
  private static readonly BCRYPT_REGEX = /^\$2[ayb]\$\d{2}\$[A-Za-z0-9./]{53}$/;

  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('Hashed password must be a non-empty string');
    }

    if (!HashedPassword.BCRYPT_REGEX.test(this.value)) {
      throw new Error('Hashed password must be a valid bcrypt hash');
    }
  }

  static isValid(hash: string): boolean {
    try {
      new HashedPassword(hash);
      return true;
    } catch {
      return false;
    }
  }
}