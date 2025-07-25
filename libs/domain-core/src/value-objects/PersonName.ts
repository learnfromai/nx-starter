import { ValueObject } from './ValueObject';
import { InvalidNameException } from '../exceptions/DomainExceptions';

/**
 * PersonName value object - ensures names follow business rules
 */
export class PersonName extends ValueObject<string> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 50;
  private static readonly VALID_REGEX = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s-]+$/;

  constructor(value: string, private fieldName: string = 'Name') {
    super(value);
    this.validate();
  }

  protected validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new InvalidNameException(`${this.fieldName} is required`);
    }

    const trimmed = this.value.trim();
    if (trimmed.length < PersonName.MIN_LENGTH) {
      throw new InvalidNameException(`${this.fieldName} cannot be empty`);
    }

    if (trimmed.length > PersonName.MAX_LENGTH) {
      throw new InvalidNameException(`${this.fieldName} cannot exceed ${PersonName.MAX_LENGTH} characters`);
    }

    if (!PersonName.VALID_REGEX.test(trimmed)) {
      throw new InvalidNameException('Names can only contain letters, spaces, and hyphens');
    }
  }

  /**
   * Returns the trimmed name value
   */
  public get trimmedValue(): string {
    return this.value.trim();
  }
}

/**
 * First name value object
 */
export class FirstName extends PersonName {
  constructor(value: string) {
    super(value, 'First name');
  }
}

/**
 * Last name value object
 */
export class LastName extends PersonName {
  constructor(value: string) {
    super(value, 'Last name');
  }
}