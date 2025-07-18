import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import {
  RegisterUserUseCase,
  LoginUserUseCase,
  UserMapper,
  TOKENS,
} from '@nx-starter/shared-application';
import { DomainException } from '@nx-starter/shared-domain';
import { asyncHandler } from '../../shared/middleware/ErrorHandler';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(100),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * REST API Controller for Auth operations
 * Follows Clean Architecture - Controllers are part of the presentation layer
 */
@injectable()
export class AuthController {
  constructor(
    @inject(TOKENS.RegisterUserUseCase)
    private registerUserUseCase: RegisterUserUseCase,
    @inject(TOKENS.LoginUserUseCase)
    private loginUserUseCase: LoginUserUseCase
  ) {}

  /**
   * POST /api/auth/register - Register a new user
   */
  register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const validatedData = registerSchema.parse(req.body);
      const authResponse = await this.registerUserUseCase.execute(validatedData);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: authResponse,
      });
    }
  );

  /**
   * POST /api/auth/login - Login user
   */
  login = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const validatedData = loginSchema.parse(req.body);
      const authResponse = await this.loginUserUseCase.execute(validatedData);

      res.json({
        success: true,
        message: 'Login successful',
        data: authResponse,
      });
    }
  );

  /**
   * POST /api/auth/logout - Logout user (optional - JWT is stateless)
   */
  logout = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // For JWT-based authentication, logout is typically handled on the client side
      // by removing the token from storage. This endpoint is optional and could be used
      // to implement token blacklisting if needed.
      
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    }
  );
}