import { ValueObject } from './ValueObject';
import { InvalidUserIdException } from '../exceptions/DomainExceptions';

/**
 * User ID value object - ensures user ID is valid UUID
 */
export class UserId extends ValueObject<string> {
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  constructor(value: string) {
    super(value);
    this.validate();
  }

  protected validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new InvalidUserIdException('User ID cannot be empty');
    }

    if (!UserId.UUID_REGEX.test(this.value)) {
      throw new InvalidUserIdException('User ID must be a valid UUID');
    }
  }

  /**
   * Creates a UserId from a UUID string, if valid
   */
  public static fromString(value: string): UserId {
    return new UserId(value);
  }

  /**
   * Generates a new random UUID
   */
  public static generate(): UserId {
    // Simple UUID v4 generation
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return new UserId(uuid);
  }
}