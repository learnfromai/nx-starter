import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import {
  createAuthCommandValidationSchema,
  RegisterUserUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  GetUserProfileUseCase,
  TOKENS,
} from '@nx-starter/shared-application';
import { DomainException } from '@nx-starter/shared-domain';
import { asyncHandler } from '../../shared/middleware/ErrorHandler';

/**
 * REST API Controller for Authentication operations
 * Follows Clean Architecture - Controllers are part of the presentation layer
 */
@injectable()
export class AuthController {
  private validationSchemas = createAuthCommandValidationSchema();

  constructor(
    @inject(TOKENS.RegisterUserUseCase)
    private registerUserUseCase: RegisterUserUseCase,
    @inject(TOKENS.LoginUseCase)
    private loginUseCase: LoginUseCase,
    @inject(TOKENS.RefreshTokenUseCase)
    private refreshTokenUseCase: RefreshTokenUseCase,
    @inject(TOKENS.LogoutUseCase)
    private logoutUseCase: LogoutUseCase,
    @inject(TOKENS.GetUserProfileUseCase)
    private getUserProfileUseCase: GetUserProfileUseCase
  ) {}

  /**
   * POST /api/auth/register - Register a new user
   */
  register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const validatedData = this.validationSchemas.RegisterUserCommandSchema
        ? this.validationSchemas.RegisterUserCommandSchema.parse(req.body)
        : req.body;

      const user = await this.registerUserUseCase.execute(validatedData);

      res.status(201).json({
        success: true,
        data: user,
        message: 'User registered successfully',
      });
    }
  );

  /**
   * POST /api/auth/login - Login user
   */
  login = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const validatedData = this.validationSchemas.LoginCommandSchema
        ? this.validationSchemas.LoginCommandSchema.parse(req.body)
        : req.body;

      const authResult = await this.loginUseCase.execute(validatedData);

      res.json({
        success: true,
        data: authResult,
        message: 'Login successful',
      });
    }
  );

  /**
   * POST /api/auth/refresh - Refresh access token
   */
  refreshToken = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const validatedData = this.validationSchemas.RefreshTokenCommandSchema
        ? this.validationSchemas.RefreshTokenCommandSchema.parse(req.body)
        : req.body;

      const tokenResult = await this.refreshTokenUseCase.execute(validatedData);

      res.json({
        success: true,
        data: tokenResult,
        message: 'Token refreshed successfully',
      });
    }
  );

  /**
   * POST /api/auth/logout - Logout user
   */
  logout = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const validatedData = this.validationSchemas.LogoutCommandSchema
        ? this.validationSchemas.LogoutCommandSchema.parse(req.body)
        : req.body;

      await this.logoutUseCase.execute(validatedData);

      res.json({
        success: true,
        message: 'Logout successful',
      });
    }
  );

  /**
   * GET /api/auth/profile - Get user profile
   */
  getProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Extract user ID from JWT token (will be added by middleware)
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const user = await this.getUserProfileUseCase.execute(userId);

      res.json({
        success: true,
        data: user,
      });
    }
  );
}