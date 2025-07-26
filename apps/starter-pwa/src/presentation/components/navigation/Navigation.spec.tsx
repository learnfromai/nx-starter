import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navigation } from './Navigation';

describe('Navigation', () => {
  it('should render all navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navigation />
      </MemoryRouter>
    );

    expect(screen.getByTestId('todo-nav-link')).toBeInTheDocument();
    expect(screen.getByTestId('login-nav-link')).toBeInTheDocument();
    expect(screen.getByTestId('register-nav-link')).toBeInTheDocument();
  });

  it('should highlight the active route - home', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navigation />
      </MemoryRouter>
    );

    const todoLink = screen.getByTestId('todo-nav-link');
    const loginLink = screen.getByTestId('login-nav-link');
    const registerLink = screen.getByTestId('register-nav-link');

    // The active link should not have the outline variant class
    expect(todoLink.closest('button')).not.toHaveClass('border-input');
  });

  it('should highlight the active route - login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Navigation />
      </MemoryRouter>
    );

    const loginLink = screen.getByTestId('login-nav-link');
    expect(loginLink).toBeInTheDocument();
  });

  it('should highlight the active route - register', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <Navigation />
      </MemoryRouter>
    );

    const registerLink = screen.getByTestId('register-nav-link');
    expect(registerLink).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navigation />
      </MemoryRouter>
    );

    const nav = screen.getByTestId('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav.tagName).toBe('NAV');
  });
});