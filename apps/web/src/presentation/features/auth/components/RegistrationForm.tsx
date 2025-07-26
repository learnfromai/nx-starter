import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Alert } from '../../../components/ui/alert';
import { Loader2 } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { useRegistrationViewModel } from '../view-models/useRegistrationViewModel';
import { RegistrationFormSchema, type RegistrationFormData } from '../types/RegistrationTypes';

export const RegistrationForm: React.FC = () => {
  const viewModel = useRegistrationViewModel();
  
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(RegistrationFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  // Focus on first name field when component mounts
  useEffect(() => {
    const firstNameInput = document.querySelector('input[name="firstName"]') as HTMLInputElement;
    if (firstNameInput) {
      firstNameInput.focus();
    }
  }, []);

  // Clear errors when user starts typing in a field
  const handleFieldChange = (fieldName: keyof RegistrationFormData) => {
    viewModel.clearFieldError(fieldName);
  };

  const onSubmit = async (data: RegistrationFormData) => {
    const success = await viewModel.submitRegistration(data);
    if (!success) {
      // Form errors are handled by the view model
      // We could add additional form-specific error handling here if needed
    }
  };

  const watchedPassword = form.watch('password');
  const passwordStrength = viewModel.getPasswordStrength(watchedPassword || '');
  const passwordRequirements = viewModel.getPasswordRequirements(watchedPassword || '');

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <p className="text-muted-foreground">
          Enter your information to create your account
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* General error message */}
            {viewModel.errors.general && (
              <Alert variant="destructive">
                {viewModel.errors.general}
              </Alert>
            )}

            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your first name"
                      disabled={viewModel.isSubmitting}
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange('firstName');
                      }}
                      data-testid="first-name-input"
                    />
                  </FormControl>
                  <FormMessage />
                  {viewModel.errors.firstName && (
                    <p className="text-sm text-destructive">
                      {viewModel.errors.firstName}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your last name"
                      disabled={viewModel.isSubmitting}
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange('lastName');
                      }}
                      data-testid="last-name-input"
                    />
                  </FormControl>
                  <FormMessage />
                  {viewModel.errors.lastName && (
                    <p className="text-sm text-destructive">
                      {viewModel.errors.lastName}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email address"
                      disabled={viewModel.isSubmitting}
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange('email');
                      }}
                      data-testid="email-input"
                    />
                  </FormControl>
                  <FormMessage />
                  {viewModel.errors.email && (
                    <p className="text-sm text-destructive">
                      {viewModel.errors.email}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Create a strong password"
                      disabled={viewModel.isSubmitting}
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange('password');
                      }}
                      data-testid="password-input"
                    />
                  </FormControl>
                  <PasswordStrengthIndicator
                    password={watchedPassword || ''}
                    strength={passwordStrength}
                    requirements={passwordRequirements}
                  />
                  <FormMessage />
                  {viewModel.errors.password && (
                    <p className="text-sm text-destructive">
                      {viewModel.errors.password}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Password Confirmation */}
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirm your password"
                      disabled={viewModel.isSubmitting}
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange('passwordConfirmation');
                      }}
                      data-testid="password-confirmation-input"
                    />
                  </FormControl>
                  <FormMessage />
                  {viewModel.errors.passwordConfirmation && (
                    <p className="text-sm text-destructive">
                      {viewModel.errors.passwordConfirmation}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={viewModel.isSubmitDisabled}
              data-testid="register-button"
            >
              {viewModel.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                <Link to="/terms" className="hover:underline">
                  Terms of Service
                </Link>
                <span>•</span>
                <Link to="/privacy" className="hover:underline">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};