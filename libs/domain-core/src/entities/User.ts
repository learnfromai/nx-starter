import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { Username } from '../value-objects/Username';
import { Password } from '../value-objects/Password';
import { FirstName, LastName } from '../value-objects/PersonName';

interface IUser {
  id?: UserId;
  firstName: FirstName;
  lastName: LastName;
  email: Email;
  username: Username;
  password: Password;
  createdAt: Date;
}

export class User implements IUser {
  private readonly _id?: UserId;
  private readonly _firstName: FirstName;
  private readonly _lastName: LastName;
  private readonly _email: Email;
  private readonly _username: Username;
  private readonly _password: Password;
  private readonly _createdAt: Date;

  constructor(
    firstName: string | FirstName,
    lastName: string | LastName,
    email: string | Email,
    username: string | Username,
    password: string | Password,
    createdAt = new Date(),
    id?: string | UserId
  ) {
    this._firstName = firstName instanceof FirstName ? firstName : new FirstName(firstName);
    this._lastName = lastName instanceof LastName ? lastName : new LastName(lastName);
    this._email = email instanceof Email ? email : new Email(email);
    this._username = username instanceof Username ? username : new Username(username);
    this._password = password instanceof Password ? password : new Password(password);
    this._createdAt = createdAt;
    this._id = id instanceof UserId ? id : id ? new UserId(id) : undefined;
  }

  get id(): UserId | undefined {
    return this._id;
  }

  get firstName(): FirstName {
    return this._firstName;
  }

  get lastName(): LastName {
    return this._lastName;
  }

  get email(): Email {
    return this._email;
  }

  get username(): Username {
    return this._username;
  }

  get password(): Password {
    return this._password;
  }

  get createdAt(): Date {
    return this._createdAt;
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

  get usernameValue(): string {
    return this._username.value;
  }

  get fullName(): string {
    return `${this._firstName.trimmedValue} ${this._lastName.trimmedValue}`;
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
   * Business method to check if email matches
   */
  hasEmail(email: string | Email): boolean {
    const emailToCheck = email instanceof Email ? email : new Email(email);
    return this._email.equals(emailToCheck);
  }

  /**
   * Business method to check if username matches
   */
  hasUsername(username: string | Username): boolean {
    const usernameToCheck = username instanceof Username ? username : new Username(username);
    return this._username.equals(usernameToCheck);
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

    if (!this._username || this._username.value.trim().length === 0) {
      throw new Error('User must have a valid username');
    }

    if (!this._password || this._password.value.length === 0) {
      throw new Error('User must have a valid password');
    }
  }
}

export type { IUser };