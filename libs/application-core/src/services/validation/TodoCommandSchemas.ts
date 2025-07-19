import { z } from 'zod';

/**
 * Zod schemas for Todo command validation
 * These replace the optional validation approach with required schemas
 */

export const CreateTodoCommandSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title cannot exceed 255 characters'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .transform((val: string | undefined) =>
      val ? new Date(val) : undefined
    ),
});

export const UpdateTodoCommandSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title cannot exceed 255 characters')
    .optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .transform((val: string | undefined) =>
      val ? new Date(val) : undefined
    ),
});

export const DeleteTodoCommandSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const ToggleTodoCommandSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

// Export Zod-inferred types to replace manual interfaces
export type CreateTodoCommand = z.infer<typeof CreateTodoCommandSchema>;
export type UpdateTodoCommand = z.infer<typeof UpdateTodoCommandSchema>;
export type DeleteTodoCommand = z.infer<typeof DeleteTodoCommandSchema>;
export type ToggleTodoCommand = z.infer<typeof ToggleTodoCommandSchema>;