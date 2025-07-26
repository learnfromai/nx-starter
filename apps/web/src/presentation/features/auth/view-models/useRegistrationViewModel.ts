import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { container, TOKENS } from '../../../../infrastructure/di/container';
import { IAuthApiService } from '../../../../infrastructure/api/IAuthApiService';
import { RegisterUserRequestDto } from '@nx-starter/application-shared';
import type { 
  RegistrationFormData, 
  RegistrationFormErrors, 
  PasswordStrength, 
  PasswordRequirement 
} from '../types/RegistrationTypes';

interface RegistrationViewModel {
  isSubmitting: boolean;
  errors: RegistrationFormErrors;
  isSubmitDisabled: boolean;
  submitRegistration: (data: RegistrationFormData) => Promise<boolean>;
  clearFieldError: (field: keyof RegistrationFormErrors) => void;
  getPasswordStrength: (password: string) => PasswordStrength;
  getPasswordRequirements: (password: string) => PasswordRequirement[];
}

/**
 * Registration View Model
 * Handles registration form business logic and presentation state
 */
export const useRegistrationViewModel = (): RegistrationViewModel => {
  const navigate = useNavigate();
  const authApiService = container.resolve<IAuthApiService>(TOKENS.AuthApiService);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<RegistrationFormErrors>({});

  const clearFieldError = useCallback((field: keyof RegistrationFormErrors) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const getPasswordStrength = useCallback((password: string): PasswordStrength => {
    if (password.length === 0) return 'weak';
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character type checks
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 3) return 'weak';
    if (score < 4) return 'fair';
    if (score < 5) return 'good';
    return 'strong';
  }, []);

  const getPasswordRequirements = useCallback((password: string): PasswordRequirement[] => {
    return [
      {
        label: 'At least 8 characters',
        met: password.length >= 8
      },
      {
        label: 'One uppercase letter',
        met: /[A-Z]/.test(password)
      },
      {
        label: 'One lowercase letter',
        met: /[a-z]/.test(password)
      },
      {
        label: 'One number',
        met: /[0-9]/.test(password)
      }
    ];
  }, []);

  const submitRegistration = useCallback(async (data: RegistrationFormData): Promise<boolean> => {
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const registerData: RegisterUserRequestDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      };
      
      await authApiService.register(registerData);
      
      // Redirect to home page on success
      navigate('/');
      return true;
      
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('already registered') || error.message.includes('duplicate')) {
          setErrors({ email: 'This email address is already registered' });
        } else {
          setErrors({ general: 'Registration failed. Please try again.' });
        }
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [authApiService, navigate]);

  const isSubmitDisabled = isSubmitting;

  return {
    isSubmitting,
    errors,
    isSubmitDisabled,
    submitRegistration,
    clearFieldError,
    getPasswordStrength,
    getPasswordRequirements,
  };
};