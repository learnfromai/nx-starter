import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { HashedPassword } from '../value-objects/HashedPassword';

interface IUser {
  id?: UserId;
  firstName: string;
  lastName: string;
  email: Email;
  password: HashedPassword;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User entity following the same immutable patterns as Todo
 * Represents a user in the system with authentication capabilities
 */
export class User implements IUser {
  private readonly _id?: UserId;
  private readonly _firstName: string;
  private readonly _lastName: string;
  private readonly _email: Email;
  private readonly _password: HashedPassword;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    firstName: string,
    lastName: string,
    email: string | Email,
    password: string | HashedPassword,
    id?: string | UserId,
    createdAt = new Date(),
    updatedAt = new Date()
  ) {
    this._firstName = firstName;
    this._lastName = lastName;
    this._email = email instanceof Email ? email : new Email(email);
    this._password = password instanceof HashedPassword ? password : new HashedPassword(password);
    this._id = id instanceof UserId ? id : id ? new UserId(id) : undefined;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): UserId | undefined {
    return this._id;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get email(): Email {
    return this._email;
  }

  get password(): HashedPassword {
    return this._password;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // For backwards compatibility with existing code that expects string ID
  get stringId(): string | undefined {
    return this._id?.value;
  }

  get emailValue(): string {
    return this._email.value;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  /**
   * Updates user profile information
   * Creates a new instance with updated data (immutable pattern)
   */
  updateProfile(firstName?: string, lastName?: string): User {
    return new User(
      firstName ?? this._firstName,
      lastName ?? this._lastName,
      this._email,
      this._password,
      this._id,
      this._createdAt,
      new Date() // updated timestamp
    );
  }

  /**
   * Updates user password
   * Creates a new instance with updated password (immutable pattern)
   */
  updatePassword(newHashedPassword: string | HashedPassword): User {
    const hashedPassword = newHashedPassword instanceof HashedPassword 
      ? newHashedPassword 
      : new HashedPassword(newHashedPassword);
    
    return new User(
      this._firstName,
      this._lastName,
      this._email,
      hashedPassword,
      this._id,
      this._createdAt,
      new Date() // updated timestamp
    );
  }

  /**
   * Domain equality comparison based on business identity
   */
  equals(other: User): boolean {
    if (!this._id || !other._id) {
      return false;
    }
    return this._id.equals(other._id);
  }

  /**
   * Validates business invariants
   */
  validate(): void {
    if (!this._firstName || this._firstName.trim().length === 0) {
      throw new Error('User must have a valid first name');
    }

    if (!this._lastName || this._lastName.trim().length === 0) {
      throw new Error('User must have a valid last name');
    }

    if (this._firstName.length > 50) {
      throw new Error('First name must be less than 50 characters');
    }

    if (this._lastName.length > 50) {
      throw new Error('Last name must be less than 50 characters');
    }

    if (this._updatedAt < this._createdAt) {
      throw new Error('Updated date cannot be before creation date');
    }
  }
}

export type { IUser };