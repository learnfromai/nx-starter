/**
 * View Model interfaces for auth presentation layer
 * These define the contract between view models and views
 */

export interface LoginFormViewModel {
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  handleLogin(email: string, password: string): Promise<boolean>;
  clearError(): void;
}

export interface RegisterFormViewModel {
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  handleRegister(name: string, email: string, password: string): Promise<boolean>;
  clearError(): void;
}