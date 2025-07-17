import { injectable } from 'tsyringe';
import * as jwt from 'jsonwebtoken';
import type { ITokenService, TokenPayload, TokenData } from '@nx-starter/shared-domain';

/**
 * JWT implementation of ITokenService
 * Handles JWT token generation and verification
 */
@injectable()
export class JwtTokenService implements ITokenService {
  private readonly accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-secret-key-access';
  private readonly refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-secret-key-refresh';
  private readonly accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
  private readonly refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'nx-starter-api',
      audience: 'nx-starter-app',
    });
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'nx-starter-api',
      audience: 'nx-starter-app',
    });
  }

  async generateTokens(payload: TokenPayload): Promise<TokenData> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    // Calculate expiry time in seconds
    const expiresIn = this.parseExpiry(this.accessTokenExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'nx-starter-api',
        audience: 'nx-starter-app',
      }) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'nx-starter-api',
        audience: 'nx-starter-app',
      }) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Parses expiry string to seconds
   */
  private parseExpiry(expiry: string): number {
    const time = parseInt(expiry);
    if (expiry.endsWith('s')) return time;
    if (expiry.endsWith('m')) return time * 60;
    if (expiry.endsWith('h')) return time * 3600;
    if (expiry.endsWith('d')) return time * 86400;
    return time; // default to seconds
  }
}