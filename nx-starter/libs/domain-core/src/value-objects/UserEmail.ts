/**
 * Value object for User Email
 * Ensures type safety and encapsulates validation logic
 */
export class UserEmail {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value.toLowerCase().trim();
  }

  get value(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }

    if (value.length > 320) {
      throw new Error('Email is too long');
    }
  }

  equals(other: UserEmail): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}