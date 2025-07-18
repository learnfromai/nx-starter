import { ValueObject } from './ValueObject';

/**
 * User ID value object
 * Reuses the same validation strategy as TodoId but for users
 */
export class UserId extends ValueObject<string> {
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  constructor(value: string) {
    super(value);
  }

  protected validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }

    if (!UserId.UUID_REGEX.test(value)) {
      throw new Error('User ID must be a valid UUID');
    }
  }

  static isValid(id: string): boolean {
    try {
      new UserId(id);
      return true;
    } catch {
      return false;
    }
  }
}