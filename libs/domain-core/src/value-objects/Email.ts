import { ValueObject } from './ValueObject';
import { InvalidEmailException } from '../exceptions/DomainExceptions';

/**
 * Email value object - ensures email is valid format
 */
export class Email extends ValueObject<string> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(value: string) {
    super(value);
    this.validate();
  }

  protected validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new InvalidEmailException('Email cannot be empty');
    }

    if (!Email.EMAIL_REGEX.test(this.value)) {
      throw new InvalidEmailException('Please provide a valid email address');
    }
  }

  /**
   * Extracts the username part (before @) from the email
   */
  public getLocalPart(): string {
    return this.value.split('@')[0];
  }

  /**
   * Extracts the domain part (after @) from the email
   */
  public getDomain(): string {
    return this.value.split('@')[1];
  }
}