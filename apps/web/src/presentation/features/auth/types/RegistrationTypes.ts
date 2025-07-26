import { z } from 'zod';
import { RegisterUserCommandSchema } from '@nx-starter/application-shared';

/**
 * Registration form data extending the command with password confirmation
 */
export const RegistrationFormSchema = RegisterUserCommandSchema.extend({
  passwordConfirmation: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords don't match",
  path: ["passwordConfirmation"],
});

export type RegistrationFormData = z.infer<typeof RegistrationFormSchema>;

/**
 * Registration form field errors
 */
export interface RegistrationFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  general?: string;
}

/**
 * Password strength levels
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

/**
 * Password requirements
 */
export interface PasswordRequirement {
  label: string;
  met: boolean;
}