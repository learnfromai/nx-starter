import { injectable } from 'tsyringe';
import { Repository, DataSource } from 'typeorm';
import { User, Email, HashedPassword, PersonName, UserId } from '@nx-starter/shared-domain';
import type { IUserRepository } from '@nx-starter/shared-domain';
import { UserEntity } from './UserEntity';
import { generateUUID } from '@nx-starter/shared-utils';

@injectable()
export class TypeOrmUserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(UserEntity);
  }

  async getAll(): Promise<User[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async create(user: User): Promise<string> {
    const id = generateUUID();
    const entity = this.repository.create({
      id,
      firstName: user.firstName.value,
      lastName: user.lastName.value,
      email: user.email.value,
      password: user.password.value,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    await this.repository.save(entity);
    return id;
  }

  async update(id: string, changes: Partial<User>): Promise<void> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updateData: Partial<UserEntity> = {};

    if (changes.firstName !== undefined) {
      updateData.firstName = 
        typeof changes.firstName === 'string'
          ? changes.firstName
          : (changes.firstName as any).value;
    }
    if (changes.lastName !== undefined) {
      updateData.lastName = 
        typeof changes.lastName === 'string'
          ? changes.lastName
          : (changes.lastName as any).value;
    }
    if (changes.password !== undefined) {
      updateData.password = (changes.password as any).value;
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

  async getById(id: string): Promise<User | undefined> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : undefined;
  }

  async getByEmail(email: string | Email): Promise<User | undefined> {
    const emailValue = email instanceof Email ? email.value : email;
    const entity = await this.repository.findOne({ where: { email: emailValue } });
    return entity ? this.toDomain(entity) : undefined;
  }

  async getByUserId(userId: UserId): Promise<User | undefined> {
    const entity = await this.repository.findOne({ where: { id: userId.value } });
    return entity ? this.toDomain(entity) : undefined;
  }

  async exists(email: string | Email): Promise<boolean> {
    const emailValue = email instanceof Email ? email.value : email;
    const count = await this.repository.count({ where: { email: emailValue } });
    return count > 0;
  }

  /**
   * Converts TypeORM entity to domain object
   */
  private toDomain(entity: UserEntity): User {
    return new User(
      new PersonName(entity.firstName),
      new PersonName(entity.lastName),
      new Email(entity.email),
      new HashedPassword(entity.password),
      entity.createdAt,
      entity.updatedAt,
      new UserId(entity.id)
    );
  }
}