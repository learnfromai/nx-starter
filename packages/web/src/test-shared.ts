// Test file to demonstrate shared package usage
import type { TodoDTO } from '@task-app/shared';
import { formatDate, generateId, isValidUuid } from '@task-app/shared';

// Example usage of shared types and utilities
const testTodo: TodoDTO = {
  id: generateId(),
  title: 'Test shared package',
  completed: false,
  createdAt: formatDate(new Date()),
  priority: 'medium'
};

console.log('Generated Todo:', testTodo);
console.log('Is valid UUID:', isValidUuid(testTodo.id));

export { testTodo };