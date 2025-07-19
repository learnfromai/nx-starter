/**
 * Abstract base class for validation services
 * Implements OOP approach for Zod validation with type safety
 */
export abstract class BaseValidationService<TInput, TOutput> {
  /**
   * Validates input data and returns parsed output
   * @param data - Raw input data to validate
   * @returns Validated and parsed data
   * @throws Validation error if data is invalid
   */
  abstract validate(data: unknown): TOutput;

  /**
   * Type-safe validation method that ensures input type
   * @param data - Typed input data
   * @returns Validated and parsed data
   */
  validateTyped(data: TInput): TOutput {
    return this.validate(data);
  }
}