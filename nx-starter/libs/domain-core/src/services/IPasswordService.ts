import { Password } from '../value-objects/Password';
import { HashedPassword } from '../value-objects/HashedPassword';

/**
 * Domain service interface for password operations
 * Abstracts password hashing and verification logic
 */
export interface IPasswordService {
  /**
   * Hashes a plain text password
   * @param password - The plain text password to hash
   * @returns Promise<HashedPassword> - The hashed password
   */
  hashPassword(password: Password): Promise<HashedPassword>;

  /**
   * Verifies a plain text password against a hashed password
   * @param password - The plain text password to verify
   * @param hashedPassword - The hashed password to verify against
   * @returns Promise<boolean> - True if passwords match, false otherwise
   */
  verifyPassword(password: Password, hashedPassword: HashedPassword): Promise<boolean>;
}