import { injectable, inject } from 'tsyringe';
import { IAuthCommandService } from '@nx-starter/application-shared';
import { IAuthApiService } from '../api/IAuthApiService';
import {
  LoginUserCommand,
  LoginUserResponseDto,
  TOKENS,
} from '@nx-starter/application-shared';

/**
 * Authentication Command Service Implementation
 * Handles authentication command operations following CQRS pattern
 */
@injectable()
export class AuthCommandService implements IAuthCommandService {
  constructor(
    @inject(TOKENS.AuthApiService) private readonly authApiService: IAuthApiService
  ) {}

  async login(command: LoginUserCommand): Promise<LoginUserResponseDto> {
    try {
      return await this.authApiService.login(command);
    } catch (error: any) {
      // Transform API errors to user-friendly messages
      if (error.response?.status === 401) {
        throw new Error('Invalid email/username or password');
      }
      if (error.response?.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        throw new Error('Network error. Please check your connection.');
      }
      
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }
}