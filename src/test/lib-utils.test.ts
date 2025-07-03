import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-4', 'py-2');
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
    });

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class');
      expect(result).toContain('base-class');
      expect(result).toContain('conditional-class');
      expect(result).not.toContain('hidden-class');
    });

    it('should handle empty inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle undefined and null values', () => {
      const result = cn('valid-class', undefined, null, 'another-class');
      expect(result).toContain('valid-class');
      expect(result).toContain('another-class');
    });

    it('should merge tailwind classes correctly', () => {
      const result = cn('p-4', 'p-6'); // Should prefer p-6
      expect(result).toContain('p-6');
      expect(result).not.toContain('p-4');
    });

    it('should handle arrays and objects', () => {
      const result = cn(['class1', 'class2'], { 'class3': true, 'class4': false });
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
      expect(result).not.toContain('class4');
    });
  });
});