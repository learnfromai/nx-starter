import { injectable } from 'tsyringe';
import * as jwt from 'jsonwebtoken';

/**
 * JWT token service interface
 */
export interface IJwtTokenService {
  generateToken(payload: JwtPayload): string;
  verifyToken(token: string): JwtPayload;
}

/**
 * JWT token payload interface
 */
export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * JWT token service implementation
 */
@injectable()
export class JwtTokenService implements IJwtTokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env['JWT_SECRET'] || 'your-secret-key-change-in-production';
    this.expiresIn = '24h'; // 24-hour expiration as required
  }

  /**
   * Generate JWT token with user claims
   */
  generateToken(payload: JwtPayload): string {
    try {
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        username: payload.username,
        role: payload.role || 'user',
        // Add exp manually for 24 hours
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      };

      return jwt.sign(tokenPayload, this.secret);
    } catch (error) {
      throw new Error('Failed to generate JWT token');
    }
  }

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired JWT token');
    }
  }
}