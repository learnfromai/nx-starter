import * as bcrypt from 'bcryptjs';
import { injectable } from 'tsyringe';
import type { IPasswordHashingService } from '@nx-starter/shared-application';

@injectable()
export class PasswordHashingService implements IPasswordHashingService {
  private readonly saltRounds = 12;

  async hashPassword(plainPassword: string): Promise<string> {
    if (!plainPassword) {
      throw new Error('Password cannot be empty');
    }

    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    if (!plainPassword || !hashedPassword) {
      return false;
    }

    return bcrypt.compare(plainPassword, hashedPassword);
  }
}