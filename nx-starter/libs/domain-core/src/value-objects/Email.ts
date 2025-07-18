import { ValueObject } from './ValueObject';

export class Email extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }

    if (value.length > 254) {
      throw new Error('Email is too long');
    }
  }

  public get domain(): string {
    return this._value.split('@')[1];
  }

  public get localPart(): string {
    return this._value.split('@')[0];
  }
}