import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { IJwtService, TOKENS } from '@nx-starter/shared-application';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * JWT Authentication Middleware
 * Validates JWT tokens and extracts user information
 */
export class JwtMiddleware {
  /**
   * Middleware to authenticate JWT tokens
   */
  static authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'No token provided',
        });
        return;
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix

      const jwtService = container.resolve<IJwtService>(TOKENS.JwtService);
      const payload = jwtService.verifyAccessToken(token);

      req.user = {
        userId: payload.userId,
        email: payload.email,
      };

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: error.message || 'Invalid token',
      });
    }
  }

  /**
   * Optional middleware - doesn't fail if no token is provided
   */
  static optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix

      const jwtService = container.resolve<IJwtService>(TOKENS.JwtService);
      const payload = jwtService.verifyAccessToken(token);

      req.user = {
        userId: payload.userId,
        email: payload.email,
      };

      next();
    } catch (error) {
      // For optional auth, we don't fail on invalid tokens
      next();
    }
  }
}