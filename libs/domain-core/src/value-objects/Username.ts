import { ValueObject } from './ValueObject';
import { InvalidUsernameException } from '../exceptions/DomainExceptions';

/**
 * Username value object - ensures username follows business rules
 */
export class Username extends ValueObject<string> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 50;
  private static readonly VALID_REGEX = /^[a-zA-Z0-9._-]+$/;

  constructor(value: string) {
    super(value);
    this.validate();
  }

  protected validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new InvalidUsernameException('Username cannot be empty');
    }

    const trimmed = this.value.trim();
    if (trimmed.length < Username.MIN_LENGTH) {
      throw new InvalidUsernameException(`Username must be at least ${Username.MIN_LENGTH} characters long`);
    }

    if (trimmed.length > Username.MAX_LENGTH) {
      throw new InvalidUsernameException(`Username cannot exceed ${Username.MAX_LENGTH} characters`);
    }

    if (!Username.VALID_REGEX.test(trimmed)) {
      throw new InvalidUsernameException('Username can only contain letters, numbers, dots, underscores, and hyphens');
    }
  }

  /**
   * Creates a new username with a numeric suffix
   */
  public withSuffix(suffix: number): Username {
    return new Username(`${this.value}${suffix}`);
  }
}