import { z } from 'zod';

/**
 * Form validation schemas for authentication
 */

export const LoginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Form data types derived from schemas
 */
export type LoginFormData = z.infer<typeof LoginFormSchema>;
export type RegisterFormData = z.infer<typeof RegisterFormSchema>;

/**
 * Type guards for form validation
 */
export const isValidLoginFormData = (data: unknown): data is LoginFormData => {
  try {
    LoginFormSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

export const isValidRegisterFormData = (data: unknown): data is RegisterFormData => {
  try {
    RegisterFormSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};