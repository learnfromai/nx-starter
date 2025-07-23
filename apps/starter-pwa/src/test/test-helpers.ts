// Test UUIDs for consistent testing - using valid UUID format
export const TEST_UUIDS = {
  TODO_1: '12345678-1234-4234-8234-123456789ab1',
  TODO_2: '12345678-1234-4234-8234-123456789ab2',
  TODO_3: '12345678-1234-4234-8234-123456789ab3',
  TODO_4: '12345678-1234-4234-8234-123456789ab4',
  TODO_5: '12345678-1234-4234-8234-123456789ab5',
} as const;

export const generateTestUuid = (suffix: number) => {
  const suffixHex = suffix.toString(16).padStart(4, '0');
  return `12345678-1234-4234-8234-123456789${suffixHex}`;
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
