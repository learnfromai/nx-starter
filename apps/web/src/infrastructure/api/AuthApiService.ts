import { injectable, inject } from 'tsyringe';
import { IHttpClient } from '../http/IHttpClient';
import { IAuthApiService, RegisterUserResponse } from './IAuthApiService';
import { getApiConfig } from './config/ApiConfig';
import { RegisterUserRequestDto, TOKENS } from '@nx-starter/application-shared';

@injectable()
export class AuthApiService implements IAuthApiService {
  private readonly apiConfig = getApiConfig();

  constructor(
    @inject(TOKENS.HttpClient) private readonly httpClient: IHttpClient
  ) {}

  async register(userData: RegisterUserRequestDto): Promise<RegisterUserResponse> {
    const response = await this.httpClient.post<RegisterUserResponse>(
      this.apiConfig.endpoints.auth?.register || '/api/auth/register',
      userData
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Registration failed');
    }
    
    return response.data;
  }
}