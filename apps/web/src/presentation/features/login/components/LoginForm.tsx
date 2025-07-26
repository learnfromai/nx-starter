import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginUserCommandSchema } from '@nx-starter/application-shared';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { User, Lock, LogIn } from 'lucide-react';
import { useLoginFormViewModel } from '../view-models/useLoginFormViewModel';
import type { LoginFormData } from '../types';

export const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginUserCommandSchema),
  });
  
  const viewModel = useLoginFormViewModel();

  // Set focus on identifier field when component mounts
  useEffect(() => {
    setFocus('identifier');
  }, [setFocus]);

  const onSubmit = handleSubmit(async (data: LoginFormData) => {
    const success = await viewModel.handleFormSubmit(data.identifier, data.password);
    if (success) {
      reset();
    }
  });

  // Clear error when user starts typing
  const handleInputChange = () => {
    if (viewModel.error) {
      viewModel.clearError();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-white shadow-lg border-0" style={{ borderRadius: '20px' }}>
        <CardContent className="p-8 pt-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-[#0b4f6c]">
            Login
          </h1>
          
          {/* Error message */}
          {viewModel.error && (
            <div 
              className="text-red-600 text-sm mb-4 text-center bg-red-50 p-3 rounded-lg border border-red-200"
              data-testid="login-error"
            >
              {viewModel.error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Username/Email Field */}
            <div className="relative">
              <div 
                className="flex items-center bg-[#f5f7fa] border border-gray-300 rounded-lg overflow-hidden"
                style={{ height: '50px' }}
              >
                <div className="pl-3 pr-2">
                  <User className="h-5 w-5 text-[#4db6ac]" />
                </div>
                <Input
                  {...register('identifier')}
                  type="text"
                  placeholder="Username or Email"
                  disabled={viewModel.isSubmitting}
                  onChange={handleInputChange}
                  className="border-0 bg-transparent h-full focus:bg-[#e6f4f1] focus:ring-0 focus:border-0 text-gray-800 placeholder-gray-500"
                  data-testid="login-identifier-input"
                />
              </div>
              {errors.identifier && (
                <p
                  className="text-sm text-red-600 mt-1"
                  data-testid="login-identifier-error"
                >
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <div 
                className="flex items-center bg-[#f5f7fa] border border-gray-300 rounded-lg overflow-hidden"
                style={{ height: '50px' }}
              >
                <div className="pl-3 pr-2">
                  <Lock className="h-5 w-5 text-[#4db6ac]" />
                </div>
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="Password"
                  disabled={viewModel.isSubmitting}
                  onChange={handleInputChange}
                  className="border-0 bg-transparent h-full focus:bg-[#e6f4f1] focus:ring-0 focus:border-0 text-gray-800 placeholder-gray-500"
                  data-testid="login-password-input"
                />
              </div>
              {errors.password && (
                <p
                  className="text-sm text-red-600 mt-1"
                  data-testid="login-password-error"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={viewModel.isSubmitting}
              className="w-full h-12 bg-[#4db6ac] hover:bg-[#3ba69c] active:bg-[#b2dfdb] active:text-[#004d40] text-white font-bold text-base rounded-lg transition-all duration-300 border-0 mt-4"
              data-testid="login-submit-button"
            >
              <LogIn className="h-5 w-5 mr-2" />
              {viewModel.isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* Additional Links (Placeholder for future features) */}
          <div className="mt-6 text-center space-y-2">
            <button
              type="button"
              className="text-[#4db6ac] hover:text-[#3ba69c] text-sm font-medium underline"
              onClick={() => {
                // TODO: Implement forgot password functionality
                console.log('Forgot password clicked');
              }}
              data-testid="forgot-password-link"
            >
              Forgot Password?
            </button>
            <div className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                className="text-[#4db6ac] hover:text-[#3ba69c] font-medium underline"
                onClick={() => {
                  // TODO: Implement navigation to register page
                  console.log('Create account clicked');
                }}
                data-testid="create-account-link"
              >
                Create Account
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};