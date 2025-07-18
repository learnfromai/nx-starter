import * as jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import type { 
  IJwtService, 
  TokenPayload, 
  JwtTokens 
} from '@nx-starter/shared-application';

@injectable()
export class JwtService implements IJwtService {
  private readonly accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
  private readonly refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  private readonly accessTokenExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  private readonly refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(
      payload as object, 
      this.accessTokenSecret, 
      {
        expiresIn: this.accessTokenExpiresIn,
      } as jwt.SignOptions
    );
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(
      payload as object, 
      this.refreshTokenSecret, 
      {
        expiresIn: this.refreshTokenExpiresIn,
      } as jwt.SignOptions
    );
  }

  generateTokens(payload: TokenPayload): JwtTokens {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as TokenPayload;
    } catch (error) {
      throw new Error(`Invalid access token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as TokenPayload;
    } catch (error) {
      throw new Error(`Invalid refresh token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token);
      return decoded as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}