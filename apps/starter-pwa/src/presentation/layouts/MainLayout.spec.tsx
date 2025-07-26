import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MainLayout } from './MainLayout';

describe('MainLayout', () => {
  it('should render children', () => {
    render(
      <MemoryRouter>
        <MainLayout>
          <div data-testid="test-content">Test content</div>
        </MainLayout>
      </MemoryRouter>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should have main layout container', () => {
    const { container } = render(
      <MemoryRouter>
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      </MemoryRouter>
    );

    expect(container.firstChild).toHaveClass('min-h-screen');
  });
});
