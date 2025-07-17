import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

@injectable()
export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key-for-development';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  /**
   * Generate JWT token for user
   */
  generateToken(payload: { userId: string; email: string }): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Decode JWT token without verification (useful for expired tokens)
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  getExpirationTime(): string {
    return this.expiresIn;
  }
}