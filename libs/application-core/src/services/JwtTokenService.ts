import { injectable } from 'tsyringe';
import * as jwt from 'jsonwebtoken';

/**
 * JWT token payload interface
 */
export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  role?: string;
}

/**
 * JWT token service interface
 */
export interface IJwtTokenService {
  generateToken(payload: TokenPayload): string;
  verifyToken(token: string): TokenPayload;
}

/**
 * JWT token service implementation
 * Handles JWT token generation and verification with 24-hour expiration
 */
@injectable()
export class JwtTokenService implements IJwtTokenService {
  private readonly jwtSecret: string;
  private readonly jwtExpirationHours = 24;

  constructor() {
    // In production, this should come from environment variables
    this.jwtSecret = process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production';
    
    if (!process.env['JWT_SECRET']) {
      console.warn('JWT_SECRET not set in environment variables. Using default secret for development.');
    }
  }

  /**
   * Generates a JWT token with 24-hour expiration
   * Includes user ID, email, username, and role claims as required
   */
  generateToken(payload: TokenPayload): string {
    try {
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        username: payload.username,
        role: payload.role || 'user',
        iat: Math.floor(Date.now() / 1000),
      };

      return jwt.sign(tokenPayload, this.jwtSecret, {
        expiresIn: `${this.jwtExpirationHours}h`,
        issuer: 'starter-api',
        audience: 'starter-app',
      });
    } catch (error) {
      throw new Error('Failed to generate JWT token');
    }
  }

  /**
   * Verifies and decodes a JWT token
   */
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'starter-api',
        audience: 'starter-app',
      }) as any;

      return {
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid JWT token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('JWT token expired');
      }
      throw new Error('Failed to verify JWT token');
    }
  }
}