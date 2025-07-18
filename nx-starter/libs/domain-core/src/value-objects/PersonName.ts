import { ValueObject } from './ValueObject';

export class PersonName extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
    
    if (value.length < 1 || value.length > 50) {
      throw new Error('Name must be between 1 and 50 characters');
    }
    
    // Basic name validation - allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(value)) {
      throw new Error('Name contains invalid characters');
    }
  }

  public get trimmed(): string {
    return this._value.trim();
  }
}