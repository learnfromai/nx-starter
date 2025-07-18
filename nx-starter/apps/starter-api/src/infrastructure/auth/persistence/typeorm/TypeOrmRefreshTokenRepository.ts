import { injectable } from 'tsyringe';
import { Repository, DataSource } from 'typeorm';
import { RefreshToken, UserId } from '@nx-starter/shared-domain';
import type { IRefreshTokenRepository } from '@nx-starter/shared-domain';
import { RefreshTokenEntity } from './RefreshTokenEntity';
import { generateUUID } from '@nx-starter/shared-utils';

@injectable()
export class TypeOrmRefreshTokenRepository implements IRefreshTokenRepository {
  private repository: Repository<RefreshTokenEntity>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(RefreshTokenEntity);
  }

  async create(token: RefreshToken): Promise<string> {
    const id = generateUUID();
    const entity = this.repository.create({
      id,
      userId: token.userIdValue,
      token: token.token,
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
      isRevoked: token.isRevoked,
    });

    await this.repository.save(entity);
    return id;
  }

  async getByToken(token: string): Promise<RefreshToken | undefined> {
    const entity = await this.repository.findOne({ where: { token } });
    return entity ? this.toDomain(entity) : undefined;
  }

  async getByUserId(userId: UserId): Promise<RefreshToken[]> {
    const entities = await this.repository.find({
      where: { userId: userId.value },
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async revoke(token: string): Promise<void> {
    const result = await this.repository.update(
      { token },
      { isRevoked: true }
    );
    if (result.affected === 0) {
      throw new Error(`Refresh token not found: ${token}`);
    }
  }

  async revokeAllForUser(userId: UserId): Promise<void> {
    await this.repository.update(
      { userId: userId.value },
      { isRevoked: true }
    );
  }

  async deleteExpired(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .from(RefreshTokenEntity)
      .where('expires_at < :now', { now: new Date() })
      .execute();
  }

  async delete(token: string): Promise<void> {
    const result = await this.repository.delete({ token });
    if (result.affected === 0) {
      throw new Error(`Refresh token not found: ${token}`);
    }
  }

  /**
   * Converts TypeORM entity to domain object
   */
  private toDomain(entity: RefreshTokenEntity): RefreshToken {
    return new RefreshToken(
      new UserId(entity.userId),
      entity.token,
      entity.expiresAt,
      entity.createdAt,
      entity.isRevoked,
      entity.id
    );
  }
}