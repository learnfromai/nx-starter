import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodoFormViewModel } from './useTodoFormViewModel';
import { useTodoStore } from '../../../../infrastructure/state/TodoStore';

// Mock the store
vi.mock('../../../../infrastructure/state/TodoStore');

describe('useTodoFormViewModel', () => {
  let mockStore: {
    createTodo: ReturnType<typeof vi.fn>;
    getIsLoading: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockStore = {
      createTodo: vi.fn(),
      getIsLoading: vi.fn().mockReturnValue(false),
    };

    vi.mocked(useTodoStore).mockReturnValue(
      mockStore as unknown as ReturnType<typeof useTodoStore>
    );
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isGlobalLoading).toBe(false);
    });

    it('should reflect global loading state from store', () => {
      mockStore.getIsLoading.mockReturnValue(true);
      const { result } = renderHook(() => useTodoFormViewModel());

      expect(result.current.isGlobalLoading).toBe(true);
    });
  });

  describe('submitTodo', () => {
    it('should submit valid todo successfully', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      await act(async () => {
        await result.current.submitTodo('Valid todo title');
      });

      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Valid todo title',
      });
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should trim title before submitting', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      await act(async () => {
        await result.current.submitTodo('  Todo with spaces  ');
      });

      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Todo with spaces',
      });
    });

    it('should set isSubmitting during submission', async () => {
      let resolvePromise: () => void;
      const createPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockStore.createTodo.mockReturnValue(createPromise);

      const { result } = renderHook(() => useTodoFormViewModel());

      // Start submission in the background
      const submitPromise = result.current.submitTodo('Valid title');

      // Wait for next tick to allow state to update
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Check isSubmitting is true during submission
      expect(result.current.isSubmitting).toBe(true);

      // Complete submission
      act(() => {
        resolvePromise!();
      });

      await act(async () => {
        await submitPromise;
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle submission errors', async () => {
      const error = new Error('Network error');
      mockStore.createTodo.mockRejectedValue(error);
      const { result } = renderHook(() => useTodoFormViewModel());

      await expect(
        act(async () => {
          await result.current.submitTodo('Valid title');
        })
      ).rejects.toThrow('Network error');

      expect(result.current.isSubmitting).toBe(false);
    });

    it('should reset isSubmitting even when submission fails', async () => {
      const error = new Error('Submission failed');
      mockStore.createTodo.mockRejectedValue(error);
      const { result } = renderHook(() => useTodoFormViewModel());

      await expect(
        act(async () => {
          await result.current.submitTodo('Valid title');
        })
      ).rejects.toThrow('Submission failed');

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('handleFormSubmit', () => {
    it('should return true for successful submission', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('Valid title');
      });

      expect(submitResult).toBe(true);
      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Valid title',
      });
    });

    it('should return false for empty title', async () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('');
      });

      expect(submitResult).toBe(false);
      expect(mockStore.createTodo).not.toHaveBeenCalled();
    });

    it('should return false for whitespace only title', async () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('   ');
      });

      expect(submitResult).toBe(false);
      expect(mockStore.createTodo).not.toHaveBeenCalled();
    });

    it('should return false when submission fails', async () => {
      const error = new Error('Submission failed');
      mockStore.createTodo.mockRejectedValue(error);
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('Valid title');
      });

      expect(submitResult).toBe(false);
    });

    it('should handle business logic for form submission', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('Valid title'); // Valid title should succeed
      });

      expect(submitResult).toBe(true);
      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Valid title',
      });
    });

    it('should handle API submission success', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      // Submit should succeed with valid title (validation happens at form level)
      await act(async () => {
        await result.current.submitTodo('Valid todo title');
      });

      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Valid todo title',
      });
    });

    it('should handle empty title submission', async () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit(''); // empty title
      });

      expect(submitResult).toBe(false);
      expect(mockStore.createTodo).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only title submission', async () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('   '); // whitespace only
      });

      expect(submitResult).toBe(false);
      expect(mockStore.createTodo).not.toHaveBeenCalled();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete form submission flow', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      // Submit valid todo (validation is now handled by zodResolver at form level)
      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit(
          'Complete todo task'
        );
      });

      expect(submitResult).toBe(true);
      expect(result.current.isSubmitting).toBe(false);
      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Complete todo task',
      });
    });

    it('should handle submission business logic without validation concerns', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      // Submit valid todo - validation is handled by zodResolver, view model handles business logic
      await act(async () => {
        await result.current.submitTodo('Valid title');
      });

      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Valid title',
      });
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle submission failure gracefully', async () => {
      mockStore.createTodo.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useTodoFormViewModel());

      // Test submission failure handling
      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('Valid title');
      });

      expect(submitResult).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
    });

  });
});
