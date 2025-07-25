import { z } from 'zod';

/**
 * Validation schemas for user-related operations
 * Uses Zod for runtime type validation
 */

// Base validation rules
const firstName = z
  .string()
  .min(1, 'First name is required')
  .max(50, 'First name cannot exceed 50 characters')
  .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s-]+$/, 'Names can only contain letters, spaces, and hyphens')
  .refine((val) => val.trim().length > 0, 'First name cannot be empty');

const lastName = z
  .string()
  .min(1, 'Last name is required')
  .max(50, 'Last name cannot exceed 50 characters')
  .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s-]+$/, 'Names can only contain letters, spaces, and hyphens')
  .refine((val) => val.trim().length > 0, 'Last name cannot be empty');

const email = z
  .string()
  .min(1, 'Email address is required')
  .email('Please provide a valid email address');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Schema for registering a new user
 */
export const RegisterUserCommandSchema = z.object({
  firstName,
  lastName,
  email,
  password,
});

/**
 * Type definitions derived from schemas
 */
export type RegisterUserCommand = z.infer<typeof RegisterUserCommandSchema>;

/**
 * Schema for validating user ID parameters
 */
export const UserIdSchema = z
  .string()
  .uuid('Invalid user ID format');