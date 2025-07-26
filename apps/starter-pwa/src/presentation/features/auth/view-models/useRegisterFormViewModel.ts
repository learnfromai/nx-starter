import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RegisterFormViewModel } from './interfaces/AuthViewModels';

/**
 * View Model for Register Form component
 * Handles registration form presentation logic and navigation
 */
export const useRegisterFormViewModel = (): RegisterFormViewModel => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = useCallback(
    async (name: string, email: string, password: string): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);
      
      try {
        // Mock registration - in real app, this would call auth service
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        
        if (name && email && password) {
          console.log('Registration successful:', { name, email });
          // Navigate to login after successful registration
          navigate('/login');
          return true;
        } else {
          throw new Error('Please fill in all required fields');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed';
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
    handleRegister,
    clearError,
  };
};