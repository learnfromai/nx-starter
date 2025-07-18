import { UserId } from '../value-objects/UserId';

export class RefreshToken {
  private readonly _id: string;
  private readonly _userId: UserId;
  private readonly _token: string;
  private readonly _expiresAt: Date;
  private readonly _createdAt: Date;
  private readonly _isRevoked: boolean;

  constructor(
    userId: UserId,
    token: string,
    expiresAt: Date,
    createdAt = new Date(),
    isRevoked = false,
    id?: string
  ) {
    this._id = id || crypto.randomUUID();
    this._userId = userId;
    this._token = token;
    this._expiresAt = expiresAt;
    this._createdAt = createdAt;
    this._isRevoked = isRevoked;
  }

  get id(): string {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get token(): string {
    return this._token;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get isRevoked(): boolean {
    return this._isRevoked;
  }

  get userIdValue(): string {
    return this._userId.value;
  }

  // Domain business logic methods
  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  isValid(): boolean {
    return !this._isRevoked && !this.isExpired();
  }

  revoke(): RefreshToken {
    return new RefreshToken(
      this._userId,
      this._token,
      this._expiresAt,
      this._createdAt,
      true,
      this._id
    );
  }

  /**
   * Domain equality comparison based on token value
   */
  equals(other: RefreshToken): boolean {
    return this._token === other._token;
  }

  /**
   * Validates business invariants
   */
  validate(): void {
    if (!this._userId || !this._userId.value) {
      throw new Error('RefreshToken must have a valid user ID');
    }

    if (!this._token || this._token.trim().length === 0) {
      throw new Error('RefreshToken must have a valid token');
    }

    if (this._expiresAt <= this._createdAt) {
      throw new Error('RefreshToken expiration date must be after creation date');
    }
  }
}