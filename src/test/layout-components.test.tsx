import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainLayout } from '../presentation/components/layout/MainLayout';
import React from 'react';

describe('Layout Components', () => {
  describe('MainLayout', () => {
    it('should render with children', () => {
      render(
        <MainLayout>
          <div>Test content</div>
        </MainLayout>
      );
      
      expect(screen.getByText('Test content')).toBeDefined();
    });

    it('should render the app title', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByRole('heading', { level: 3, name: 'Todo App' })).toBeDefined();
    });

    it('should render the subtitle', () => {
      render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByText('Built with Clean Architecture & MVVM')).toBeDefined();
    });

    it('should have correct layout structure', () => {
      render(
        <MainLayout>
          <div data-testid="content">Test content</div>
        </MainLayout>
      );
      
      // Check that content is rendered within the layout
      const content = screen.getByTestId('content');
      expect(content).toBeDefined();
      
      // Check that the layout has the correct CSS classes for responsive design
      const container = content.closest('.container');
      expect(container).toBeDefined();
    });

    it('should render multiple children', () => {
      render(
        <MainLayout>
          <div>First child</div>
          <div>Second child</div>
          <span>Third child</span>
        </MainLayout>
      );
      
      expect(screen.getByText('First child')).toBeDefined();
      expect(screen.getByText('Second child')).toBeDefined();
      expect(screen.getByText('Third child')).toBeDefined();
    });

    it('should have proper accessibility structure', () => {
      render(
        <MainLayout>
          <main>Main content area</main>
        </MainLayout>
      );
      
      // Check that the title is properly structured as a heading
      const title = screen.getByRole('heading', { level: 3 });
      expect(title.textContent).toBe('Todo App');
      
      // Check that main content area is rendered
      expect(screen.getByRole('main')).toBeDefined();
    });

    it('should apply responsive layout classes', () => {
      const { container } = render(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      // Check for responsive design classes
      const layoutDiv = container.firstChild as Element;
      expect(layoutDiv.className).toContain('min-h-screen');
      expect(layoutDiv.className).toContain('bg-background');
      
      // Check for container classes
      const containerDiv = layoutDiv.querySelector('.container');
      expect(containerDiv?.className).toContain('mx-auto');
      expect(containerDiv?.className).toContain('max-w-2xl');
    });

    it('should handle empty children', () => {
      render(<MainLayout>{null}</MainLayout>);
      
      // Should still render the header
      expect(screen.getByText('Todo App')).toBeDefined();
      expect(screen.getByText('Built with Clean Architecture & MVVM')).toBeDefined();
    });

    it('should handle React fragments as children', () => {
      render(
        <MainLayout>
          <>
            <div>Fragment child 1</div>
            <div>Fragment child 2</div>
          </>
        </MainLayout>
      );
      
      expect(screen.getByText('Fragment child 1')).toBeDefined();
      expect(screen.getByText('Fragment child 2')).toBeDefined();
    });
  });
});