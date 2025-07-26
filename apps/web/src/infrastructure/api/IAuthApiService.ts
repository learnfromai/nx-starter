import { RegisterUserRequestDto } from '@nx-starter/application-shared';

export interface RegisterUserResponse {
  success: boolean;
  data: {
    id: string;
  };
  message?: string;
}

export interface IAuthApiService {
  register(userData: RegisterUserRequestDto): Promise<RegisterUserResponse>;
}