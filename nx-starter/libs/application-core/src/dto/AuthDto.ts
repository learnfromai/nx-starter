// DTOs for Authentication responses and data transfer

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticationDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
  expiresIn: number;
}

export interface RefreshTokenDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthTokenDto {
  accessToken: string;
  expiresIn: number;
}

export interface UserProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthErrorDto {
  error: string;
  message: string;
  code: string;
}

export interface ValidationErrorDto {
  field: string;
  message: string;
}

export interface AuthValidationErrorDto {
  error: string;
  message: string;
  code: string;
  validationErrors: ValidationErrorDto[];
}