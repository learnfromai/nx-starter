// Command DTOs for User operations

export interface RegisterUserCommand {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginUserCommand {
  email: string;
  password: string;
}

export interface UpdateUserCommand {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordCommand {
  id: string;
  currentPassword: string;
  newPassword: string;
}