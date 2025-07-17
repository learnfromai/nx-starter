import { UserId } from '../value-objects/UserId';
import { UserName } from '../value-objects/UserName';
import { UserEmail } from '../value-objects/UserEmail';
import { UserPassword } from '../value-objects/UserPassword';

interface IUser {
  id?: UserId;
  firstName: UserName;
  lastName: UserName;
  email: UserEmail;
  password: UserPassword;
  createdAt: Date;
  updatedAt: Date;
}

export class User implements IUser {
  private readonly _id?: UserId;
  private readonly _firstName: UserName;
  private readonly _lastName: UserName;
  private readonly _email: UserEmail;
  private readonly _password: UserPassword;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(
    firstName: string | UserName,
    lastName: string | UserName,
    email: string | UserEmail,
    password: string | UserPassword,
    createdAt = new Date(),
    updatedAt = new Date(),
    id?: string | UserId
  ) {
    this._firstName = firstName instanceof UserName ? firstName : new UserName(firstName);
    this._lastName = lastName instanceof UserName ? lastName : new UserName(lastName);
    this._email = email instanceof UserEmail ? email : new UserEmail(email);
    this._password = password instanceof UserPassword ? password : new UserPassword(password);
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._id = id instanceof UserId ? id : id ? new UserId(id) : undefined;
  }

  get id(): UserId | undefined {
    return this._id;
  }

  get firstName(): UserName {
    return this._firstName;
  }

  get lastName(): UserName {
    return this._lastName;
  }

  get email(): UserEmail {
    return this._email;
  }

  get password(): UserPassword {
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

  get firstNameValue(): string {
    return this._firstName.value;
  }

  get lastNameValue(): string {
    return this._lastName.value;
  }

  get emailValue(): string {
    return this._email.value;
  }

  get fullName(): string {
    return `${this._firstName.value} ${this._lastName.value}`;
  }

  /**
   * Verify if the provided plain text password matches the user's password
   */
  verifyPassword(plainTextPassword: string): boolean {
    return this._password.verify(plainTextPassword);
  }

  /**
   * Creates a copy of this user with modified properties
   * Immutable entity pattern - all changes create new instances
   */
  private createCopy(updates: {
    firstName?: UserName;
    lastName?: UserName;
    email?: UserEmail;
    password?: UserPassword;
    updatedAt?: Date;
  }): User {
    return new User(
      updates.firstName || this._firstName,
      updates.lastName || this._lastName,
      updates.email || this._email,
      updates.password || this._password,
      this._createdAt,
      updates.updatedAt || new Date(),
      this._id
    );
  }

  updateName(firstName: string | UserName, lastName: string | UserName): User {
    const newFirstName = firstName instanceof UserName ? firstName : new UserName(firstName);
    const newLastName = lastName instanceof UserName ? lastName : new UserName(lastName);
    return this.createCopy({ firstName: newFirstName, lastName: newLastName });
  }

  updateEmail(email: string | UserEmail): User {
    const newEmail = email instanceof UserEmail ? email : new UserEmail(email);
    return this.createCopy({ email: newEmail });
  }

  updatePassword(password: string | UserPassword): User {
    const newPassword = password instanceof UserPassword ? password : new UserPassword(password);
    return this.createCopy({ password: newPassword });
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
  hasEmail(email: string | UserEmail): boolean {
    const emailToCheck = email instanceof UserEmail ? email : new UserEmail(email);
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

    if (!this._password) {
      throw new Error('User must have a valid password');
    }

    if (this._updatedAt < this._createdAt) {
      throw new Error('Updated date cannot be before creation date');
    }
  }
}

export type { IUser };