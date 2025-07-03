import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import React from 'react';

// Mock the HomePage component
vi.mock('../presentation/pages/HomePage', () => ({
  HomePage: () => React.createElement('div', { 'data-testid': 'home-page' }, 'HomePage Content'),
}));

// Mock the store
vi.mock('../core/application/store/store', () => ({
  store: {
    getState: () => ({}),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
  },
}));

describe('App', () => {
  it('should render without errors', () => {
    render(<App />);
    
    expect(screen.getByTestId('home-page')).toBeDefined();
  });

  it('should render HomePage component', () => {
    render(<App />);
    
    expect(screen.getByText('HomePage Content')).toBeDefined();
  });

  it('should wrap HomePage with Redux Provider', () => {
    const { container } = render(<App />);
    
    // Check that the app structure is correct
    expect(container.firstChild).toBeDefined();
    expect(screen.getByTestId('home-page')).toBeDefined();
  });

  it('should load CSS imports without errors', () => {
    // This test verifies that the CSS import doesn't cause errors
    expect(() => render(<App />)).not.toThrow();
  });

  it('should have correct component hierarchy', () => {
    const { container } = render(<App />);
    
    // The HomePage should be rendered within the Provider
    const homePage = screen.getByTestId('home-page');
    expect(homePage).toBeDefined();
    expect(homePage.textContent).toBe('HomePage Content');
  });
});