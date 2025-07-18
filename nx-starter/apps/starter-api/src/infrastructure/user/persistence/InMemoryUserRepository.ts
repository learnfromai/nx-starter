import { injectable } from 'tsyringe';
import { User, UserPassword } from '@nx-starter/shared-domain';
import type { IUserRepository } from '@nx-starter/shared-domain';
import { generateId } from '@nx-starter/shared-utils';

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
      user.password,
      user.createdAt,
      user.updatedAt,
      id
    );

    this.users.set(id, userWithId);
    return id;
  }

  async getById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.hasEmail(email)) {
        return user;
      }
    }
    return undefined;
  }

  async update(id: string, changes: Partial<User>): Promise<void> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    // Create updated user with changes
    const updatedUser = new User(
      changes.firstName !== undefined
        ? (changes.firstName as any).value
        : existingUser.firstName.value,
      changes.lastName !== undefined
        ? (changes.lastName as any).value
        : existingUser.lastName.value,
      changes.email !== undefined
        ? (changes.email as any).value
        : existingUser.email.value,
      changes.password !== undefined
        ? (changes.password as any)
        : existingUser.password,
      existingUser.createdAt,
      changes.updatedAt || new Date(),
      id
    );

    this.users.set(id, updatedUser);
  }

  async delete(id: string): Promise<void> {
    if (!this.users.has(id)) {
      throw new Error(`User with ID ${id} not found`);
    }
    this.users.delete(id);
  }

  async exists(email: string): Promise<boolean> {
    return (await this.getByEmail(email)) !== undefined;
  }

  // Helper method for testing
  async clear(): Promise<void> {
    this.users.clear();
  }

  // Helper method for testing
  async count(): Promise<number> {
    return this.users.size;
  }
}