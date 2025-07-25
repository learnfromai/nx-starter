import { injectable } from 'tsyringe';
import { User } from '@nx-starter/domain-core';
import type { IUserRepository } from '@nx-starter/domain-core';
import { generateId } from '@nx-starter/utils-core';

/**
 * In-memory implementation of IUserRepository
 * Useful for development and testing
 */
@injectable()
export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async create(user: User): Promise<string> {
    const id = generateId();
    const userWithId = new User(
      user.firstName,
      user.lastName,
      user.email,
      user.username,
      user.password,
      user.createdAt,
      id
    );

    this.users.set(id, userWithId);
    return id;
  }

  async getById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => 
      user.emailValue.toLowerCase() === email.toLowerCase()
    );
  }

  async getByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => 
      user.usernameValue === username
    );
  }

  async emailExists(email: string): Promise<boolean> {
    return Array.from(this.users.values()).some(user => 
      user.emailValue.toLowerCase() === email.toLowerCase()
    );
  }

  async usernameExists(username: string): Promise<boolean> {
    return Array.from(this.users.values()).some(user => 
      user.usernameValue === username
    );
  }

  // Additional utility methods for testing and development
  async count(): Promise<number> {
    return this.users.size;
  }

  async clear(): Promise<void> {
    this.users.clear();
  }

  async getAll(): Promise<User[]> {
    return Array.from(this.users.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}