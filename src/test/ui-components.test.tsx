import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../presentation/components/ui/button';
import { Input } from '../presentation/components/ui/input';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '../presentation/components/ui/card';
import React from 'react';

describe('UI Components', () => {
  describe('Button', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeDefined();
    });

    it('should handle click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('should apply different variants', () => {
      const { rerender } = render(<Button variant="destructive">Delete</Button>);
      let button = screen.getByRole('button', { name: 'Delete' });
      expect(button.className).toContain('bg-destructive');

      rerender(<Button variant="outline">Outline</Button>);
      button = screen.getByRole('button', { name: 'Outline' });
      expect(button.className).toContain('border');

      rerender(<Button variant="secondary">Secondary</Button>);
      button = screen.getByRole('button', { name: 'Secondary' });
      expect(button.className).toContain('bg-secondary');

      rerender(<Button variant="ghost">Ghost</Button>);
      button = screen.getByRole('button', { name: 'Ghost' });
      expect(button.className).toContain('hover:bg-accent');

      rerender(<Button variant="link">Link</Button>);
      button = screen.getByRole('button', { name: 'Link' });
      expect(button.className).toContain('underline-offset-4');
    });

    it('should apply different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      let button = screen.getByRole('button', { name: 'Small' });
      expect(button.className).toContain('h-8');

      rerender(<Button size="lg">Large</Button>);
      button = screen.getByRole('button', { name: 'Large' });
      expect(button.className).toContain('h-10');

      rerender(<Button size="icon">Icon</Button>);
      button = screen.getByRole('button', { name: 'Icon' });
      expect(button.className).toContain('h-9 w-9');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button', { name: 'Disabled' });
      expect(button).toHaveProperty('disabled', true);
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button', { name: 'Custom' });
      expect(button.className).toContain('custom-class');
    });

    it('should forward refs correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Test</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Input', () => {
    it('should render with default props', () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeDefined();
    });

    it('should handle value changes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test value' } });
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('should apply different input types', () => {
      const { rerender, container } = render(<Input type="password" />);
      let input = container.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('password');

      rerender(<Input type="email" />);
      input = container.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('email');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveProperty('disabled', true);
    });

    it('should apply custom className', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('custom-input');
    });

    it('should forward refs correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('should handle focus and blur events', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      expect(handleFocus).toHaveBeenCalled();
      
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Card Components', () => {
    describe('Card', () => {
      it('should render with children', () => {
        render(<Card>Card content</Card>);
        expect(screen.getByText('Card content')).toBeDefined();
      });

      it('should apply custom className', () => {
        render(<Card className="custom-card">Content</Card>);
        const card = screen.getByText('Content');
        expect(card.className).toContain('custom-card');
      });

      it('should forward refs correctly', () => {
        const ref = React.createRef<HTMLDivElement>();
        render(<Card ref={ref}>Content</Card>);
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });

    describe('CardHeader', () => {
      it('should render with children', () => {
        render(<CardHeader>Header content</CardHeader>);
        expect(screen.getByText('Header content')).toBeDefined();
      });

      it('should apply correct default classes', () => {
        render(<CardHeader>Header</CardHeader>);
        const header = screen.getByText('Header');
        expect(header.className).toContain('flex flex-col space-y-1.5 p-6');
      });
    });

    describe('CardTitle', () => {
      it('should render as h3 element', () => {
        render(<CardTitle>Title text</CardTitle>);
        const title = screen.getByRole('heading', { level: 3 });
        expect(title).toBeDefined();
        expect(title.textContent).toBe('Title text');
      });

      it('should apply correct styling classes', () => {
        render(<CardTitle>Title</CardTitle>);
        const title = screen.getByRole('heading', { level: 3 });
        expect(title.className).toContain('text-2xl font-semibold leading-none tracking-tight');
      });
    });

    describe('CardDescription', () => {
      it('should render with correct styling', () => {
        render(<CardDescription>Description text</CardDescription>);
        const description = screen.getByText('Description text');
        expect(description.className).toContain('text-sm text-muted-foreground');
      });
    });

    describe('CardContent', () => {
      it('should render with children', () => {
        render(<CardContent>Content here</CardContent>);
        expect(screen.getByText('Content here')).toBeDefined();
      });

      it('should apply content styling', () => {
        render(<CardContent>Content</CardContent>);
        const content = screen.getByText('Content');
        expect(content.className).toContain('p-6 pt-0');
      });
    });

    describe('CardFooter', () => {
      it('should render with children', () => {
        render(<CardFooter>Footer content</CardFooter>);
        expect(screen.getByText('Footer content')).toBeDefined();
      });

      it('should apply footer styling', () => {
        render(<CardFooter>Footer</CardFooter>);
        const footer = screen.getByText('Footer');
        expect(footer.className).toContain('flex items-center p-6 pt-0');
      });
    });

    describe('Complete Card', () => {
      it('should render complete card structure', () => {
        render(
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content goes here</p>
            </CardContent>
            <CardFooter>
              <button>Action</button>
            </CardFooter>
          </Card>
        );

        expect(screen.getByRole('heading', { level: 3, name: 'Card Title' })).toBeDefined();
        expect(screen.getByText('Card description')).toBeDefined();
        expect(screen.getByText('Card content goes here')).toBeDefined();
        expect(screen.getByRole('button', { name: 'Action' })).toBeDefined();
      });
    });
  });
});