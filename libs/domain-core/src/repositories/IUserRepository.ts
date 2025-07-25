import { User } from '../entities/User';

export interface IUserRepository {
  create(user: User): Promise<string>;
  getById(id: string): Promise<User | undefined>;
  getByEmail(email: string): Promise<User | undefined>;
  getByUsername(username: string): Promise<User | undefined>;
  emailExists(email: string): Promise<boolean>;
  usernameExists(username: string): Promise<boolean>;
}