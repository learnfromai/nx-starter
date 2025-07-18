import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { HashedPassword } from '../value-objects/HashedPassword';
import { PersonName } from '../value-objects/PersonName';

interface IUser {
  id?: UserId;
  firstName: PersonName;
  lastName: PersonName;
  email: Email;
  password: HashedPassword;
  createdAt: Date;
  updatedAt: Date;
}

export class User implements IUser {
  private readonly _id?: UserId;
  private readonly _firstName: PersonName;
  private readonly _lastName: PersonName;
  private readonly _email: Email;
  private readonly _password: HashedPassword;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    firstName: string | PersonName,
    lastName: string | PersonName,
    email: string | Email,
    password: HashedPassword,
    createdAt = new Date(),
    updatedAt = new Date(),
    id?: string | UserId
  ) {
    this._firstName = firstName instanceof PersonName ? firstName : new PersonName(firstName);
    this._lastName = lastName instanceof PersonName ? lastName : new PersonName(lastName);
    this._email = email instanceof Email ? email : new Email(email);
    this._password = password;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._id = id instanceof UserId ? id : id ? new UserId(id) : undefined;
  }

  get id(): UserId | undefined {
    return this._id;
  }

  get firstName(): PersonName {
    return this._firstName;
  }

  get lastName(): PersonName {
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

  get fullName(): string {
    return `${this._firstName.trimmed} ${this._lastName.trimmed}`;
  }

  get emailValue(): string {
    return this._email.value;
  }

  // Domain business logic methods
  updateProfile(firstName?: string | PersonName, lastName?: string | PersonName): User {
    const newFirstName = firstName !== undefined 
      ? (firstName instanceof PersonName ? firstName : new PersonName(firstName))
      : this._firstName;
    
    const newLastName = lastName !== undefined
      ? (lastName instanceof PersonName ? lastName : new PersonName(lastName))
      : this._lastName;

    return new User(
      newFirstName,
      newLastName,
      this._email,
      this._password,
      this._createdAt,
      new Date(), // Updated timestamp
      this._id
    );
  }

  updatePassword(newPassword: HashedPassword): User {
    return new User(
      this._firstName,
      this._lastName,
      this._email,
      newPassword,
      this._createdAt,
      new Date(), // Updated timestamp
      this._id
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
   * Check if email matches
   */
  hasEmail(email: string | Email): boolean {
    const emailToCheck = email instanceof Email ? email : new Email(email);
    return this._email.equals(emailToCheck);
  }

  /**
   * Validates business invariants
   */
  validate(): void {
    if (!this._firstName || this._firstName.value.trim().length === 0) {
      throw new Error('User must have a valid first name');
    }

    if (!this._lastName || this._lastName.value.trim().length === 0) {
      throw new Error('User must have a valid last name');
    }

    if (!this._email || this._email.value.trim().length === 0) {
      throw new Error('User must have a valid email');
    }

    if (!this._password || this._password.value.trim().length === 0) {
      throw new Error('User must have a valid password');
    }

    if (this._updatedAt < this._createdAt) {
      throw new Error('Updated date cannot be before creation date');
    }
  }
}

export type { IUser };