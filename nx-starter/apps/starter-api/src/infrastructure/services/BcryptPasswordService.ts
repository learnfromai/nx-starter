import { injectable } from 'tsyringe';
import * as bcrypt from 'bcryptjs';
import { Password, HashedPassword } from '@nx-starter/shared-domain';
import type { IPasswordService } from '@nx-starter/shared-domain';

/**
 * Bcrypt implementation of IPasswordService
 * Handles password hashing and verification using bcrypt
 */
@injectable()
export class BcryptPasswordService implements IPasswordService {
  private readonly saltRounds = 12;

  async hashPassword(password: Password): Promise<HashedPassword> {
    const hashedValue = await bcrypt.hash(password.value, this.saltRounds);
    return new HashedPassword(hashedValue);
  }

  async verifyPassword(password: Password, hashedPassword: HashedPassword): Promise<boolean> {
    return await bcrypt.compare(password.value, hashedPassword.value);
  }
}