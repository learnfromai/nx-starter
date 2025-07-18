import { User } from '../entities/User';
import { Email } from '../value-objects/Email';
import { UserId } from '../value-objects/UserId';

export interface IUserRepository {
  getAll(): Promise<User[]>;
  create(user: User): Promise<string>;
  update(id: string, changes: Partial<User>): Promise<void>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<User | undefined>;
  getByEmail(email: string | Email): Promise<User | undefined>;
  getByUserId(userId: UserId): Promise<User | undefined>;
  exists(email: string | Email): Promise<boolean>;
}