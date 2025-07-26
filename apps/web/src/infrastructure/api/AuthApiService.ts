import { injectable, inject } from 'tsyringe';
import { IHttpClient } from '../http/IHttpClient';
import { IAuthApiService } from './IAuthApiService';
import { getApiConfig } from './config/ApiConfig';
import {
  LoginUserCommand,
  LoginUserResponseDto,
  TOKENS,
} from '@nx-starter/application-shared';

@injectable()
export class AuthApiService implements IAuthApiService {
  private readonly apiConfig = getApiConfig();

  constructor(
    @inject(TOKENS.HttpClient) private readonly httpClient: IHttpClient
  ) {}

  async login(command: LoginUserCommand): Promise<LoginUserResponseDto> {
    const response = await this.httpClient.post<LoginUserResponseDto>(
      this.apiConfig.endpoints.auth.login,
      command
    );
    
    if (!response.data) {
      throw new Error('Login failed - no response data');
    }
    
    return response.data;
  }

  async validateToken(token: string): Promise<{ valid: boolean; user?: any }> {
    try {
      const response = await this.httpClient.get<{ valid: boolean; user?: any }>(
        this.apiConfig.endpoints.auth.validate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      return { valid: false };
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await this.httpClient.post<{ token: string }>(
      this.apiConfig.endpoints.auth.refresh,
      { refreshToken }
    );
    
    if (!response.data) {
      throw new Error('Token refresh failed');
    }
    
    return response.data;
  }
}