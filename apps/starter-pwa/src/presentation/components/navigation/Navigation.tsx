import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { CheckSquare, LogIn, UserPlus } from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="flex justify-center gap-2 mb-6" data-testid="navigation">
      <Button
        asChild
        variant={isActive('/') ? 'default' : 'outline'}
        size="sm"
      >
        <Link to="/" data-testid="todo-nav-link">
          <CheckSquare className="h-4 w-4 mr-2" />
          Todos
        </Link>
      </Button>

      <Button
        asChild
        variant={isActive('/login') ? 'default' : 'outline'}
        size="sm"
      >
        <Link to="/login" data-testid="login-nav-link">
          <LogIn className="h-4 w-4 mr-2" />
          Login
        </Link>
      </Button>

      <Button
        asChild
        variant={isActive('/register') ? 'default' : 'outline'}
        size="sm"
      >
        <Link to="/register" data-testid="register-nav-link">
          <UserPlus className="h-4 w-4 mr-2" />
          Register
        </Link>
      </Button>
    </nav>
  );
};