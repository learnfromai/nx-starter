import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ITokenService } from '@nx-starter/shared-domain';
import { TOKENS } from '@nx-starter/shared-application';

/**
 * Extended Request interface with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * JWT Authentication middleware
 * Verifies JWT tokens and adds user information to request
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access token is required',
    });
    return;
  }

  try {
    const tokenService = container.resolve<ITokenService>(TOKENS.TokenService);
    
    tokenService.verifyAccessToken(token)
      .then((payload) => {
        req.user = {
          userId: payload.userId,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
        };
        next();
      })
      .catch((error) => {
        res.status(403).json({
          success: false,
          message: 'Invalid or expired token',
        });
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
    });
  }
}