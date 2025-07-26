import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { LoginFormSchema, type LoginFormData } from '../types/FormTypes';
import { useLoginFormViewModel } from '../view-models/useLoginFormViewModel';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const viewModel = useLoginFormViewModel();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
  });

  const onSubmit = handleSubmit(async (data: LoginFormData) => {
    await viewModel.handleLogin(data.email, data.password);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {viewModel.error && (
        <Alert variant="destructive" data-testid="login-error">
          <AlertDescription>{viewModel.error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register('email')}
          disabled={viewModel.isSubmitting}
          className={errors.email ? 'border-destructive' : ''}
          data-testid="email-input"
        />
        {errors.email && (
          <p className="text-sm text-destructive" data-testid="email-error">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            {...register('password')}
            disabled={viewModel.isSubmitting}
            className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
            data-testid="password-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            data-testid="toggle-password"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive" data-testid="password-error">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={viewModel.isSubmitting}
        className="w-full"
        data-testid="login-button"
      >
        <LogIn className="h-4 w-4 mr-2" />
        {viewModel.isSubmitting ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
};