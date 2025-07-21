import { render, screen } from '@testing-library/react';
import { describe, expect,it } from 'vitest';

import { MainLayout } from './MainLayout';

describe('MainLayout', () => {
  it('should render children', () => {
    render(
      <MainLayout>
        <div data-testid="test-content">Test content</div>
      </MainLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should have main layout container', () => {
    const { container } = render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    expect(container.firstChild).toHaveClass('min-h-screen');
  });
});
