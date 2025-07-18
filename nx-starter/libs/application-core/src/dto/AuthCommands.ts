// Command DTOs for Authentication CQRS pattern
// Unified version combining frontend and backend with optional validation

// Command interfaces
export interface RegisterUserCommand {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginCommand {
  email: string;
  password: string;
}

export interface RefreshTokenCommand {
  refreshToken: string;
}

export interface ChangePasswordCommand {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserProfileCommand {
  firstName?: string;
  lastName?: string;
}

export interface LogoutCommand {
  refreshToken: string;
}

// Optional validation schemas (can be used when zod is available)
export const createAuthCommandValidationSchema = () => {
  try {
    // Dynamic import to avoid bundling zod when not needed
    const { z } = require('zod');

    return {
      RegisterUserCommandSchema: z.object({
        firstName: z
          .string()
          .min(1, 'First name is required')
          .max(50, 'First name cannot exceed 50 characters')
          .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
        lastName: z
          .string()
          .min(1, 'Last name is required')
          .max(50, 'Last name cannot exceed 50 characters')
          .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
        email: z
          .string()
          .email('Invalid email format')
          .max(254, 'Email is too long'),
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters')
          .max(128, 'Password is too long')
          .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
          .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
          .regex(/(?=.*\d)/, 'Password must contain at least one number'),
      }),

      LoginCommandSchema: z.object({
        email: z
          .string()
          .email('Invalid email format')
          .max(254, 'Email is too long'),
        password: z
          .string()
          .min(1, 'Password is required'),
      }),

      RefreshTokenCommandSchema: z.object({
        refreshToken: z
          .string()
          .min(1, 'Refresh token is required'),
      }),

      ChangePasswordCommandSchema: z.object({
        currentPassword: z
          .string()
          .min(1, 'Current password is required'),
        newPassword: z
          .string()
          .min(8, 'New password must be at least 8 characters')
          .max(128, 'New password is too long')
          .regex(/(?=.*[a-z])/, 'New password must contain at least one lowercase letter')
          .regex(/(?=.*[A-Z])/, 'New password must contain at least one uppercase letter')
          .regex(/(?=.*\d)/, 'New password must contain at least one number'),
      }),

      UpdateUserProfileCommandSchema: z.object({
        firstName: z
          .string()
          .min(1, 'First name is required')
          .max(50, 'First name cannot exceed 50 characters')
          .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters')
          .optional(),
        lastName: z
          .string()
          .min(1, 'Last name is required')
          .max(50, 'Last name cannot exceed 50 characters')
          .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters')
          .optional(),
      }),

      LogoutCommandSchema: z.object({
        refreshToken: z
          .string()
          .min(1, 'Refresh token is required'),
      }),
    };
  } catch {
    // Return empty object if zod is not available
    return {};
  }
};