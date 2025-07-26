import { ValueObject } from './ValueObject';

export class Name extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value) {
      throw new Error('Name cannot be empty');
    }

    if (value.length < 1) {
      throw new Error('Name must have at least 1 character');
    }

    if (value.length > 50) {
      throw new Error('Name cannot exceed 50 characters');
    }

    // Allow letters (including accented characters), spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\u00C0-\u017F\u0100-\u024F\s'-]+$/;
    if (!nameRegex.test(value)) {
      throw new Error('Names can only contain letters, spaces, hyphens, and apostrophes');
    }
  }

  public static create(value: string): Name {
    return new Name(value.trim());
  }
}