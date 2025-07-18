import { z } from 'zod';

/**
 * User DTO for API responses
 */
export const userDtoSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Authentication response DTO
 */
export const authenticationDtoSchema = z.object({
  user: userDtoSchema,
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number(),
});

/**
 * Token response DTO
 */
export const tokenDtoSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number(),
});

// Export DTO types
export type UserDto = z.infer<typeof userDtoSchema>;
export type AuthenticationDto = z.infer<typeof authenticationDtoSchema>;
export type TokenDto = z.infer<typeof tokenDtoSchema>;