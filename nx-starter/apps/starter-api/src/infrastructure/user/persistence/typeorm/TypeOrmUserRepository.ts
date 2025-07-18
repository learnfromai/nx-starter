import { injectable } from 'tsyringe';
import { Repository, DataSource } from 'typeorm';
import { User } from '@nx-starter/shared-domain';
import type { IUserRepository } from '@nx-starter/shared-domain';
import { UserEntity } from './UserEntity';
import { generateUUID } from '@nx-starter/shared-utils';

/**
 * TypeORM implementation of IUserRepository
 * Handles user persistence operations with TypeORM
 */
@injectable()
export class TypeOrmUserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(UserEntity);
  }

  async create(user: User): Promise<string> {
    const id = generateUUID();
    const entity = this.repository.create({
      id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailValue,
      password: user.password.value,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    await this.repository.save(entity);
    return id;
  }

  async getById(id: string): Promise<User | undefined> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : undefined;
  }

  async getByEmail(email: string): Promise<User | undefined> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : undefined;
  }

  async update(id: string, changes: Partial<User>): Promise<void> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updateData: Partial<UserEntity> = {};

    if (changes.firstName !== undefined) {
      updateData.firstName = changes.firstName;
    }
    if (changes.lastName !== undefined) {
      updateData.lastName = changes.lastName;
    }
    if (changes.password !== undefined) {
      updateData.password = typeof changes.password === 'string'
        ? changes.password
        : (changes.password as any).value;
    }

    updateData.updatedAt = new Date();

    await this.repository.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new Error(`User with ID ${id} not found`);
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  /**
   * Converts TypeORM entity to domain object
   */
  private toDomain(entity: UserEntity): User {
    return new User(
      entity.firstName,
      entity.lastName,
      entity.email,
      entity.password,
      entity.id,
      entity.createdAt,
      entity.updatedAt
    );
  }
}