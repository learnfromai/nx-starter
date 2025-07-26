import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginFormViewModel } from './interfaces/AuthViewModels';

/**
 * View Model for Login Form component
 * Handles login form presentation logic and navigation
 */
export const useLoginFormViewModel = (): LoginFormViewModel => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);
      
      try {
        // Mock authentication - in real app, this would call auth service
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        if (email && password) {
          console.log('Login successful:', { email });
          // Navigate to home after successful login
          navigate('/');
          return true;
        } else {
          throw new Error('Invalid credentials');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        setError(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSubmitting,
    isLoading: false, // Could be connected to global loading state
    error,
    handleLogin,
    clearError,
  };
};