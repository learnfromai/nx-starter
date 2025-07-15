// UUID utilities
export * from './uuid';

// Common utilities functions
export const isEmptyString = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0;
};

export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const parseDate = (dateString: string): Date => {
  const date = new Date(dateString);
  if (!isValidDate(date)) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return date;
};

// Type guards
export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

// Constants
export const DEFAULT_TODO_PRIORITY = 'medium' as const;
export const MAX_TODO_TITLE_LENGTH = 255;
export const MIN_TODO_TITLE_LENGTH = 2;
