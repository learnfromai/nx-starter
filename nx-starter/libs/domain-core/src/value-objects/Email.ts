import { ValueObject } from './ValueObject';

/**
 * Email value object ensuring valid email format
 */
export class Email extends ValueObject<string> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(value: string) {
    super(value);
  }

  protected validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('Email must be a non-empty string');
    }

    if (!Email.EMAIL_REGEX.test(value)) {
      throw new Error('Email must be a valid email address');
    }

    if (value.length > 254) {
      throw new Error('Email must be less than 254 characters');
    }
  }

  get domain(): string {
    return this.value.split('@')[1];
  }

  get localPart(): string {
    return this.value.split('@')[0];
  }

  static isValid(email: string): boolean {
    try {
      new Email(email);
      return true;
    } catch {
      return false;
    }
  }
}