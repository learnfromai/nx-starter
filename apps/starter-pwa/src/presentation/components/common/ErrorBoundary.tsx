import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export const ErrorBoundary: React.FC = () => {
  const error = useRouteError() as Error;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <MainLayout data-testid="error-boundary">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Oops! Something went wrong</CardTitle>
          <CardDescription>
            {error?.message || 'An unexpected error occurred'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && error?.stack && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Error Details
              </summary>
              <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleRefresh} 
              variant="default"
              className="flex-1"
              data-testid="refresh-button"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              asChild 
              variant="outline"
              className="flex-1"
            >
              <Link to="/" data-testid="home-link">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};