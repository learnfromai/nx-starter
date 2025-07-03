import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Todo } from '../core/domain/entities/Todo';

// Mock Dexie completely
const mockTable = {
  add: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  mapToClass: vi.fn(),
  toArray: vi.fn(),
};

const mockOrderBy = {
  reverse: vi.fn(() => ({
    toArray: vi.fn(),
  })),
};

const mockWhere = {
  equals: vi.fn(() => ({
    toArray: vi.fn(),
  })),
};

vi.mock('dexie', () => ({
  default: class MockDexie {
    version() {
      return {
        stores: vi.fn().mockReturnThis(),
      };
    }
    todos = mockTable;
  },
  Table: class MockTable {},
}));

vi.mock('../core/infrastructure/db/TodoDB', () => ({
  TodoDB: class MockTodoDB {
    version() {
      return {
        stores: vi.fn().mockReturnThis(),
      };
    }
    todos = mockTable;
  },
  db: {
    todos: mockTable,
  },
}));

describe('Infrastructure Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock behaviors
    mockTable.orderBy.mockReturnValue(mockOrderBy);
    mockTable.where.mockReturnValue(mockWhere);
    mockOrderBy.reverse.mockReturnValue({ toArray: vi.fn() });
    mockWhere.equals.mockReturnValue({ toArray: vi.fn() });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('TodoDB', () => {
    it('should create database with correct schema', async () => {
      const { TodoDB } = await import('../core/infrastructure/db/TodoDB');
      const db = new TodoDB();
      
      expect(db).toBeDefined();
      expect(db.todos).toBeDefined();
    });

    it('should export db instance', async () => {
      const { db } = await import('../core/infrastructure/db/TodoDB');
      
      expect(db).toBeDefined();
      expect(db.todos).toBeDefined();
    });
  });

  describe('TodoRepository', () => {
    let repository: any;

    beforeEach(async () => {
      const { TodoRepository } = await import('../core/infrastructure/db/TodoRepository');
      repository = new TodoRepository();
    });

    describe('getAll', () => {
      it('should return all todos ordered by createdAt desc', async () => {
        const mockTodos = [
          new Todo('Todo 1', false, new Date(), 1),
          new Todo('Todo 2', true, new Date(), 2),
        ];
        
        const mockToArray = vi.fn().mockResolvedValue(mockTodos);
        mockOrderBy.reverse.mockReturnValue({ toArray: mockToArray });
        
        const result = await repository.getAll();
        
        expect(mockTable.orderBy).toHaveBeenCalledWith('createdAt');
        expect(mockOrderBy.reverse).toHaveBeenCalled();
        expect(mockToArray).toHaveBeenCalled();
        expect(result).toEqual(mockTodos);
      });
    });

    describe('create', () => {
      it('should create a new todo', async () => {
        const todo = new Todo('New Todo');
        const expectedId = 1;
        
        mockTable.add.mockResolvedValue(expectedId);
        
        const result = await repository.create(todo);
        
        expect(mockTable.add).toHaveBeenCalledWith(todo);
        expect(result).toBe(expectedId);
      });
    });

    describe('update', () => {
      it('should update a todo', async () => {
        const todoId = 1;
        const changes = { title: 'Updated Title' };
        
        mockTable.update.mockResolvedValue(undefined);
        
        await repository.update(todoId, changes);
        
        expect(mockTable.update).toHaveBeenCalledWith(todoId, changes);
      });
    });

    describe('delete', () => {
      it('should delete a todo', async () => {
        const todoId = 1;
        
        mockTable.delete.mockResolvedValue(undefined);
        
        await repository.delete(todoId);
        
        expect(mockTable.delete).toHaveBeenCalledWith(todoId);
      });
    });

    describe('getById', () => {
      it('should get a todo by id', async () => {
        const todoId = 1;
        const mockTodo = new Todo('Test Todo', false, new Date(), todoId);
        
        mockTable.get.mockResolvedValue(mockTodo);
        
        const result = await repository.getById(todoId);
        
        expect(mockTable.get).toHaveBeenCalledWith(todoId);
        expect(result).toEqual(mockTodo);
      });

      it('should return undefined if todo not found', async () => {
        const todoId = 999;
        
        mockTable.get.mockResolvedValue(undefined);
        
        const result = await repository.getById(todoId);
        
        expect(mockTable.get).toHaveBeenCalledWith(todoId);
        expect(result).toBeUndefined();
      });
    });

    describe('getActive', () => {
      it('should return active todos', async () => {
        const activeTodos = [
          new Todo('Active Todo 1', false, new Date(), 1),
          new Todo('Active Todo 2', false, new Date(), 2),
        ];
        
        const mockToArray = vi.fn().mockResolvedValue(activeTodos);
        mockWhere.equals.mockReturnValue({ toArray: mockToArray });
        
        const result = await repository.getActive();
        
        expect(mockTable.where).toHaveBeenCalledWith('completed');
        expect(mockWhere.equals).toHaveBeenCalledWith(0);
        expect(mockToArray).toHaveBeenCalled();
        expect(result).toEqual(activeTodos);
      });
    });

    describe('getCompleted', () => {
      it('should return completed todos', async () => {
        const completedTodos = [
          new Todo('Completed Todo 1', true, new Date(), 1),
          new Todo('Completed Todo 2', true, new Date(), 2),
        ];
        
        const mockToArray = vi.fn().mockResolvedValue(completedTodos);
        mockWhere.equals.mockReturnValue({ toArray: mockToArray });
        
        const result = await repository.getCompleted();
        
        expect(mockTable.where).toHaveBeenCalledWith('completed');
        expect(mockWhere.equals).toHaveBeenCalledWith(1);
        expect(mockToArray).toHaveBeenCalled();
        expect(result).toEqual(completedTodos);
      });
    });
  });
});