/**
 * Value object for User Name
 * Ensures type safety and encapsulates validation logic
 */
export class UserName {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }

    if (value.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    if (value.trim().length > 100) {
      throw new Error('Name is too long');
    }

    // Allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(value)) {
      throw new Error('Name contains invalid characters');
    }
  }

  equals(other: UserName): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}