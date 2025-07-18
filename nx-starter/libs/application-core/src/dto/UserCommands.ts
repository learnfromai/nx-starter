import { z } from 'zod';

/**
 * User registration command schema
 */
export const registerUserCommandSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters long')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one digit'),
});

/**
 * User login command schema
 */
export const loginCommandSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Refresh token command schema
 */
export const refreshTokenCommandSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Change password command schema
 */
export const changePasswordCommandSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters long')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one digit'),
});

/**
 * Update user profile command schema
 */
export const updateUserProfileCommandSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters').optional(),
});

// Export command types
export type RegisterUserCommand = z.infer<typeof registerUserCommandSchema>;
export type LoginCommand = z.infer<typeof loginCommandSchema>;
export type RefreshTokenCommand = z.infer<typeof refreshTokenCommandSchema>;
export type ChangePasswordCommand = z.infer<typeof changePasswordCommandSchema>;
export type UpdateUserProfileCommand = z.infer<typeof updateUserProfileCommandSchema>;