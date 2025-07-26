import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { RegisterFormSchema, type RegisterFormData } from '../types/FormTypes';
import { useRegisterFormViewModel } from '../view-models/useRegisterFormViewModel';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const viewModel = useRegisterFormViewModel();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterFormSchema),
  });

  const onSubmit = handleSubmit(async (data: RegisterFormData) => {
    await viewModel.handleRegister(data.name, data.email, data.password);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {viewModel.error && (
        <Alert variant="destructive" data-testid="register-error">
          <AlertDescription>{viewModel.error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          {...register('name')}
          disabled={viewModel.isSubmitting}
          className={errors.name ? 'border-destructive' : ''}
          data-testid="name-input"
        />
        {errors.name && (
          <p className="text-sm text-destructive" data-testid="name-error">
            {errors.name.message}
          </p>
        )}
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            {...register('confirmPassword')}
            disabled={viewModel.isSubmitting}
            className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
            data-testid="confirm-password-input"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            data-testid="toggle-confirm-password"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive" data-testid="confirm-password-error">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={viewModel.isSubmitting}
        className="w-full"
        data-testid="register-button"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        {viewModel.isSubmitting ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};