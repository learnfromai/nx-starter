import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../infrastructure/state/AuthStore';
import { ILoginViewModel } from './interfaces/ILoginViewModel';
import { LoginFormData } from '../types';

/**
 * Main Login View Model
 * Handles authentication state management and navigation logic
 * Following MVVM pattern with separation of concerns
 */
export const useLoginViewModel = (): ILoginViewModel => {
  const store = useAuthStore();
  const navigate = useNavigate();

  // Check authentication state on mount
  useEffect(() => {
    store.checkAuthState();
  }, [store]);

  // Redirect if already authenticated
  useEffect(() => {
    if (store.isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [store.isAuthenticated, navigate]);

  // Handle login form submission
  const handleLogin = useCallback(async (formData: LoginFormData): Promise<boolean> => {
    try {
      await store.login({
        identifier: formData.identifier,
        password: formData.password,
      });
      
      // Success - store will update isAuthenticated which triggers redirect
      return true;
    } catch (error) {
      // Error handling is managed by the store
      return false;
    }
  }, [store]);

  // Clear error messages
  const clearError = useCallback(() => {
    store.clearError();
  }, [store]);

  return {
    // Form state
    isSubmitting: store.loginStatus === 'loading',
    isLoading: store.loginStatus === 'loading',
    error: store.error,
    
    // Authentication state
    isAuthenticated: store.isAuthenticated,
    
    // Form actions
    handleLogin,
    clearError,
    
    // Navigation state
    shouldRedirect: store.isAuthenticated,
    redirectPath: '/',
  };
};