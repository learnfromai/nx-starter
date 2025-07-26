import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout';
import { LoginForm } from '../components/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

export const LoginPage: React.FC = () => {
  return (
    <MainLayout data-testid="login-page">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-primary hover:underline font-medium"
            >
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};