/**
 * Example Auth API Repository demonstrating extensibility
 * Shows how the HTTP client abstraction can be reused for different API domains
 * This follows the same clean architecture patterns as ApiTodoRepository
 */

import { injectable, inject } from 'tsyringe';
import { IHttpClient } from '../http/IHttpClient';
import { ApiError } from '../errors/ApiError';
import { getApiConfig } from '../config/ApiConfig';

// Example interfaces for auth (would be defined in domain/application layers)
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
}

interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Example Auth Repository showing reusability of HTTP client abstraction
 * Demonstrates how easy it is to create new API integrations
 */
@injectable()
export class ApiAuthRepository {
  private readonly apiConfig = getApiConfig();

  constructor(@inject('IHttpClient') private readonly httpClient: IHttpClient) {}

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const loginData: LoginRequest = { email, password };

      const response = await this.httpClient.post<LoginResponse>(
        '/api/auth/login', // Could be this.apiConfig.endpoints.auth.login when configured
        loginData
      );

      if (!response.data.success) {
        throw new ApiError('Login failed', response.status);
      }

      return {
        token: response.data.data.token,
        user: response.data.data.user,
      };
    } catch (error) {
      this.handleError(error, 'Failed to login');
      throw error;
    }
  }

  async logout(token: string): Promise<void> {
    try {
      await this.httpClient.post(
        '/api/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      this.handleError(error, 'Failed to logout');
      throw error;
    }
  }

  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await this.httpClient.get<{ success: boolean; data: User }>(
        '/api/auth/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        throw new ApiError('Failed to get current user', response.status);
      }

      return response.data.data;
    } catch (error) {
      this.handleError(error, 'Failed to get current user');
      throw error;
    }
  }

  /**
   * Centralized error handling - same pattern as ApiTodoRepository
   */
  private handleError(error: unknown, context: string): void {
    console.error(`${context}:`, error);

    if (!(error instanceof ApiError)) {
      const message = error instanceof Error ? error.message : context;
      throw new ApiError(message, 0, { originalError: error });
    }
  }
}