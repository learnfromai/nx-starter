import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { TodoPage } from '../presentation/features/todo';
import { LoginPage, RegisterPage } from '../presentation/features/auth';
import { ErrorBoundary } from '../presentation/components/common/ErrorBoundary';

describe('Router Configuration', () => {
  it('should render TodoPage at root path', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <TodoPage />,
      },
    ], {
      initialEntries: ['/'],
    });

    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId('todo-app')).toBeInTheDocument();
    expect(screen.getByText('Todo App')).toBeInTheDocument();
  });

  it('should render LoginPage at /login path', () => {
    const router = createMemoryRouter([
      {
        path: '/login',
        element: <LoginPage />,
      },
    ], {
      initialEntries: ['/login'],
    });

    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument();
  });

  it('should render RegisterPage at /register path', () => {
    const router = createMemoryRouter([
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ], {
      initialEntries: ['/register'],
    });

    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId('register-page')).toBeInTheDocument();
    expect(screen.getByText('Create a new account to get started')).toBeInTheDocument();
  });

  it('should render ErrorBoundary for unknown routes', () => {
    const router = createMemoryRouter([
      {
        path: '*',
        element: <ErrorBoundary />,
      },
    ], {
      initialEntries: ['/unknown-route'],
    });

    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('should have proper navigation between routes', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <TodoPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ], {
      initialEntries: ['/'],
    });

    render(<RouterProvider router={router} />);
    
    // Verify navigation links are present
    expect(screen.getByTestId('todo-nav-link')).toBeInTheDocument();
    expect(screen.getByTestId('login-nav-link')).toBeInTheDocument();
    expect(screen.getByTestId('register-nav-link')).toBeInTheDocument();
  });
});