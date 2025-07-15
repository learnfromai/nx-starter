// Simple demo of shared package usage across monorepo
import { formatDate, generateId, isValidUuid, capitalizeFirst, debounce } from '@task-app/shared';

// Test the shared utilities
console.log('=== Monorepo Shared Package Demo ===');
console.log('Generated ID:', generateId());
console.log('Formatted date:', formatDate(new Date()));
console.log('Is valid UUID:', isValidUuid('550e8400-e29b-41d4-a716-446655440000'));
console.log('Capitalize:', capitalizeFirst('hello world'));

// Test debounce
const debouncedLog = debounce((msg: string) => console.log('Debounced:', msg), 100);
debouncedLog('test');

export const sharedDemo = {
  generateId,
  formatDate,
  isValidUuid,
  capitalizeFirst,
  debounce
};