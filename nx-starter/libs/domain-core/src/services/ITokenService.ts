/**
 * Token data interface for JWT tokens
 */
export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * Token payload interface
 */
export interface TokenPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Domain service interface for JWT token operations
 * Abstracts token generation and verification logic
 */
export interface ITokenService {
  /**
   * Generates an access token for a user
   * @param payload - The user data to encode in the token
   * @returns Promise<string> - The generated JWT token
   */
  generateAccessToken(payload: TokenPayload): Promise<string>;

  /**
   * Generates a refresh token for a user
   * @param payload - The user data to encode in the token
   * @returns Promise<string> - The generated refresh token
   */
  generateRefreshToken(payload: TokenPayload): Promise<string>;

  /**
   * Generates both access and refresh tokens
   * @param payload - The user data to encode in the tokens
   * @returns Promise<TokenData> - The generated tokens with expiration
   */
  generateTokens(payload: TokenPayload): Promise<TokenData>;

  /**
   * Verifies and decodes a JWT token
   * @param token - The JWT token to verify
   * @returns Promise<TokenPayload> - The decoded token payload
   */
  verifyAccessToken(token: string): Promise<TokenPayload>;

  /**
   * Verifies and decodes a refresh token
   * @param token - The refresh token to verify
   * @returns Promise<TokenPayload> - The decoded token payload
   */
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}