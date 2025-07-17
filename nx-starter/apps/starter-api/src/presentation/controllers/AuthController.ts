import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { z } from 'zod';
import {
  RegisterUserUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  GetUserProfileUseCase,
  UserMapper,
  registerUserCommandSchema,
  loginCommandSchema,
  refreshTokenCommandSchema,
} from '@nx-starter/shared-application';
import { TOKENS } from '@nx-starter/shared-application';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

/**
 * Authentication controller
 * Handles user registration, login, and token management
 */
export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const command = registerUserCommandSchema.parse(req.body);

      // Execute use case
      const registerUseCase = container.resolve<RegisterUserUseCase>(TOKENS.RegisterUserUseCase);
      const user = await registerUseCase.execute(command);

      // Return success response
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: UserMapper.toDto(user),
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
        });
      } else {
        res.status(400).json({
          success: false,
          message: error instanceof Error ? error.message : 'Registration failed',
        });
      }
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const command = loginCommandSchema.parse(req.body);

      // Execute use case
      const loginUseCase = container.resolve<LoginUseCase>(TOKENS.LoginUseCase);
      const { user, tokens } = await loginUseCase.execute(command);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: UserMapper.toAuthenticationDto(user, tokens),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
        });
      } else {
        res.status(401).json({
          success: false,
          message: error instanceof Error ? error.message : 'Login failed',
        });
      }
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const command = refreshTokenCommandSchema.parse(req.body);

      // Execute use case
      const refreshUseCase = container.resolve<RefreshTokenUseCase>(TOKENS.RefreshTokenUseCase);
      const tokens = await refreshUseCase.execute(command);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: UserMapper.toTokenDto(tokens),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
        });
      } else {
        res.status(401).json({
          success: false,
          message: error instanceof Error ? error.message : 'Token refresh failed',
        });
      }
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      // Execute use case
      const getUserProfileUseCase = container.resolve<GetUserProfileUseCase>(TOKENS.GetUserProfileUseCase);
      const user = await getUserProfileUseCase.execute(req.user.userId);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: UserMapper.toDto(user),
        },
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve profile',
      });
    }
  }
}