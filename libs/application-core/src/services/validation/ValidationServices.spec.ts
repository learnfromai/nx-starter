import { 
  CreateTodoCommandValidationService,
  UpdateTodoCommandValidationService,
  DeleteTodoCommandValidationService,
  ToggleTodoCommandValidationService 
} from './TodoCommandValidationServices';
import { ZodError } from 'zod';

describe('Validation Services', () => {
  describe('CreateTodoCommandValidationService', () => {
    let service: CreateTodoCommandValidationService;

    beforeEach(() => {
      service = new CreateTodoCommandValidationService();
    });

    it('should validate valid create command', () => {
      const validData = {
        title: 'Test Todo',
        priority: 'high' as const,
      };

      const result = service.validate(validData);
      expect(result).toEqual(validData);
    });

    it('should throw ZodError for invalid data', () => {
      const invalidData = {
        title: 'x', // Too short
      };

      expect(() => service.validate(invalidData)).toThrow(ZodError);
    });

    it('should throw ZodError for missing title', () => {
      const invalidData = {};

      expect(() => service.validate(invalidData)).toThrow(ZodError);
    });
  });

  describe('UpdateTodoCommandValidationService', () => {
    let service: UpdateTodoCommandValidationService;

    beforeEach(() => {
      service = new UpdateTodoCommandValidationService();
    });

    it('should validate with ID merging', () => {
      const bodyData = {
        title: 'Updated Todo',
        completed: true,
      };
      const id = 'test-id';

      const result = service.validateWithId(bodyData, id);
      expect(result).toEqual({
        id: 'test-id',
        title: 'Updated Todo', 
        completed: true,
      });
    });

    it('should throw ZodError for invalid ID', () => {
      const bodyData = { title: 'Updated Todo' };
      const id = ''; // Empty ID

      expect(() => service.validateWithId(bodyData, id)).toThrow(ZodError);
    });
  });

  describe('DeleteTodoCommandValidationService', () => {
    let service: DeleteTodoCommandValidationService;

    beforeEach(() => {
      service = new DeleteTodoCommandValidationService();
    });

    it('should validate ID', () => {
      const id = 'test-id';

      const result = service.validateId(id);
      expect(result).toEqual({ id: 'test-id' });
    });

    it('should throw ZodError for empty ID', () => {
      const id = '';

      expect(() => service.validateId(id)).toThrow(ZodError);
    });
  });

  describe('ToggleTodoCommandValidationService', () => {
    let service: ToggleTodoCommandValidationService;

    beforeEach(() => {
      service = new ToggleTodoCommandValidationService();
    });

    it('should validate ID', () => {
      const id = 'test-id';

      const result = service.validateId(id);
      expect(result).toEqual({ id: 'test-id' });
    });

    it('should throw ZodError for empty ID', () => {
      const id = '';

      expect(() => service.validateId(id)).toThrow(ZodError);
    });
  });
});