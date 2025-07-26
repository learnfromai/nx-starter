import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout';
import { RegisterForm } from '../components/RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

export const RegisterPage: React.FC = () => {
  return (
    <MainLayout data-testid="register-page">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
          <CardDescription>
            Create a new account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-primary hover:underline font-medium"
            >
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};