import { v4 as uuidv4 } from 'uuid';

/**
 * Value object for User ID
 * Ensures type safety and encapsulates validation logic
 */
export class UserId {
  private readonly _value: string;

  constructor(value?: string) {
    if (value) {
      this.validate(value);
      this._value = value;
    } else {
      this._value = uuidv4();
    }
  }

  get value(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('UserId cannot be empty');
    }
  }

  equals(other: UserId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}