export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IJwtService {
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(payload: TokenPayload): string;
  generateTokens(payload: TokenPayload): JwtTokens;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
  decodeToken(token: string): TokenPayload | null;
  getTokenExpiration(token: string): Date | null;
}