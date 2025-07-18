import { ValueObject } from './ValueObject';

export class HashedPassword extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Hashed password cannot be empty');
    }
    
    // Basic validation for bcrypt hash format
    if (!value.startsWith('$2') || value.length < 60) {
      throw new Error('Invalid hashed password format');
    }
  }

  public static fromPlainPassword(plainPassword: string): HashedPassword {
    if (!plainPassword || plainPassword.trim().length === 0) {
      throw new Error('Plain password cannot be empty');
    }
    
    if (plainPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    if (plainPassword.length > 128) {
      throw new Error('Password is too long');
    }
    
    // This will be implemented in the infrastructure layer
    // For now, we'll throw to indicate this needs to be handled elsewhere
    throw new Error('Password hashing must be handled in infrastructure layer');
  }
}