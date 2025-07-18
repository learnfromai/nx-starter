import { User } from '../entities/User';

export interface IUserRepository {
  create(user: User): Promise<string>;
  getById(id: string): Promise<User | undefined>;
  getByEmail(email: string): Promise<User | undefined>;
  update(id: string, changes: Partial<User>): Promise<void>;
  delete(id: string): Promise<void>;
  exists(email: string): Promise<boolean>;
}