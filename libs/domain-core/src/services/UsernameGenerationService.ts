import { injectable } from 'tsyringe';
import { Email } from '../value-objects/Email';
import { Username } from '../value-objects/Username';
import { IUserRepository } from '../repositories/IUserRepository';

/**
 * Domain service for generating unique usernames
 * Encapsulates the business logic for username generation from email
 */
@injectable()
export class UsernameGenerationService {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Generates a unique username from an email address
   * If the base username exists, appends incremental numbers
   */
  async generateUniqueUsername(email: Email): Promise<Username> {
    const baseUsername = this.extractBaseUsername(email);
    
    // Check if base username is available
    if (!(await this.userRepository.usernameExists(baseUsername))) {
      return new Username(baseUsername);
    }

    // Find the next available username with numeric suffix
    let counter = 1;
    let candidateUsername = `${baseUsername}${counter}`;
    
    while (await this.userRepository.usernameExists(candidateUsername)) {
      counter++;
      candidateUsername = `${baseUsername}${counter}`;
    }

    return new Username(candidateUsername);
  }

  /**
   * Extracts the base username from email (part before @)
   * Sanitizes the result to ensure it's valid for username rules
   */
  private extractBaseUsername(email: Email): string {
    let baseUsername = email.getLocalPart();
    
    // Replace invalid characters with dots to maintain readability
    // Username allows: letters, numbers, dots, underscores, hyphens
    baseUsername = baseUsername.replace(/[^a-zA-Z0-9._-]/g, '.');
    
    // Remove consecutive dots
    baseUsername = baseUsername.replace(/\.+/g, '.');
    
    // Remove leading/trailing dots
    baseUsername = baseUsername.replace(/^\.+|\.+$/g, '');
    
    // Ensure minimum length
    if (baseUsername.length === 0) {
      baseUsername = 'user';
    }

    return baseUsername;
  }
}