import { useCallback } from 'react';
import { useAuthStore } from '../../../../infrastructure/state/AuthStore';
import { ILoginFormViewModel } from './interfaces/ILoginViewModel';

/**
 * Login Form View Model
 * Handles form-specific business logic and validation
 * Specialized view model for login form component
 */
export const useLoginFormViewModel = (): ILoginFormViewModel => {
  const store = useAuthStore();

  // Handle form submission
  const handleFormSubmit = useCallback(async (identifier: string, password: string): Promise<boolean> => {
    try {
      await store.login({ identifier, password });
      return true;
    } catch (error) {
      return false;
    }
  }, [store]);

  // Clear error messages
  const clearError = useCallback(() => {
    store.clearError();
  }, [store]);

  // Validate email format (basic validation)
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Get field-specific error (placeholder for enhanced error handling)
  const getFieldError = useCallback((field: string): string | null => {
    // For now, return general error for any field if there's an error
    // This can be enhanced later to map specific field errors
    return store.error;
  }, [store.error]);

  return {
    // Form state
    isSubmitting: store.loginStatus === 'loading',
    error: store.error,
    
    // Form actions
    handleFormSubmit,
    clearError,
    
    // Validation helpers
    validateEmail,
    getFieldError,
  };
};