import { User } from '../entities/User';

/**
 * User repository interface following the same patterns as ITodoRepository
 * Defines the contract for user persistence operations
 */
export interface IUserRepository {
  /**
   * Creates a new user in the repository
   * @param user - The user entity to create
   * @returns Promise<string> - The generated user ID
   */
  create(user: User): Promise<string>;

  /**
   * Finds a user by their ID
   * @param id - The user ID to search for
   * @returns Promise<User | undefined> - The user if found, undefined otherwise
   */
  getById(id: string): Promise<User | undefined>;

  /**
   * Finds a user by their email address
   * @param email - The email address to search for
   * @returns Promise<User | undefined> - The user if found, undefined otherwise
   */
  getByEmail(email: string): Promise<User | undefined>;

  /**
   * Updates a user's information
   * @param id - The user ID to update
   * @param changes - Partial user data to update
   * @returns Promise<void>
   */
  update(id: string, changes: Partial<User>): Promise<void>;

  /**
   * Deletes a user from the repository
   * @param id - The user ID to delete
   * @returns Promise<void>
   */
  delete(id: string): Promise<void>;

  /**
   * Checks if a user exists with the given email
   * @param email - The email address to check
   * @returns Promise<boolean> - True if user exists, false otherwise
   */
  existsByEmail(email: string): Promise<boolean>;
}