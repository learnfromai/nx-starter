import { createBrowserRouter } from 'react-router-dom';
import { TodoPage } from '../presentation/features/todo';
import { LoginPage, RegisterPage } from '../presentation/features/auth';
import { ErrorBoundary } from '../presentation/components/common/ErrorBoundary';

/**
 * Main application router configuration
 * Uses React Router v7 with createBrowserRouter for best practices
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <TodoPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
    errorElement: <ErrorBoundary />,
  },
  // Catch-all route for 404s
  {
    path: '*',
    element: <ErrorBoundary />,
  },
]);