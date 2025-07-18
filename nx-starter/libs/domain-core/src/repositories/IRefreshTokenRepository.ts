import { RefreshToken } from '../entities/RefreshToken';
import { UserId } from '../value-objects/UserId';

export interface IRefreshTokenRepository {
  create(token: RefreshToken): Promise<string>;
  getByToken(token: string): Promise<RefreshToken | undefined>;
  getByUserId(userId: UserId): Promise<RefreshToken[]>;
  revoke(token: string): Promise<void>;
  revokeAllForUser(userId: UserId): Promise<void>;
  deleteExpired(): Promise<void>;
  delete(token: string): Promise<void>;
}