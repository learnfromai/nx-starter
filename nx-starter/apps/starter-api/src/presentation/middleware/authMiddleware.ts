import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { AuthService, TOKENS } from '@nx-starter/shared-application';
import { User } from '@nx-starter/shared-domain';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'Authorization header is required',
      });
      return;
    }

    const token = authHeader.split(' ')[1]; // Remove 'Bearer ' prefix
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token is required',
      });
      return;
    }

    const authService = container.resolve<AuthService>(TOKENS.AuthService);
    const user = await authService.verifyToken(token);
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

/**
 * Optional middleware that adds user to request if token is provided
 * Does not fail if token is missing or invalid
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        const authService = container.resolve<AuthService>(TOKENS.AuthService);
        const user = await authService.verifyToken(token);
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
};