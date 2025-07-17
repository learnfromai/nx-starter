// Test UUIDs for consistent testing - using valid 32-character hex format
export const TEST_UUIDS = {
  TODO_1: '550e8400e29b41d4a716446655440001',
  TODO_2: '550e8400e29b41d4a716446655440002',
  TODO_3: '550e8400e29b41d4a716446655440003',
  TODO_4: '550e8400e29b41d4a716446655440004',
  TODO_5: '550e8400e29b41d4a716446655440005',
} as const;

export const generateTestUuid = (suffix: number) => {
  return `550e8400e29b41d4a716446655440${suffix.toString().padStart(3, '0')}`;
};

// Additional test utilities
export const createTestTodo = (
  overrides: Partial<{
    id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {}
) => ({
  id: TEST_UUIDS.TODO_1,
  title: 'Test Todo',
  completed: false,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

export const createTestTodos = (count: number) => {
  return Array.from({ length: count }, (_, index) =>
    createTestTodo({
      id: generateTestUuid(index + 1),
      title: `Test Todo ${index + 1}`,
    })
  );
};
