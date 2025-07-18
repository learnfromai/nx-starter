import { ValueObject } from './ValueObject';

export class UserId extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
    if (value.length < 1 || value.length > 100) {
      throw new Error('User ID must be between 1 and 100 characters');
    }
  }

  public static generate(): UserId {
    return new UserId(crypto.randomUUID());
  }
}