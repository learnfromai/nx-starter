import { User } from './User';
import { Email } from '../value-objects/Email';
import { UserId } from '../value-objects/UserId';
import { HashedPassword } from '../value-objects/HashedPassword';

describe('User Entity', () => {
  const validHashedPassword = '$2a$12$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr';
  const validUserId = '550e8400-e29b-41d4-a716-446655440000';
  const validEmail = 'test@example.com';

  describe('Creation', () => {
    it('should create a valid user with all required fields', () => {
      const user = new User(
        'John',
        'Doe',
        validEmail,
        validHashedPassword,
        validUserId
      );

      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.emailValue).toBe(validEmail);
      expect(user.password.value).toBe(validHashedPassword);
      expect(user.stringId).toBe(validUserId);
      expect(user.fullName).toBe('John Doe');
    });

    it('should create a user without ID', () => {
      const user = new User(
        'Jane',
        'Smith',
        validEmail,
        validHashedPassword
      );

      expect(user.firstName).toBe('Jane');
      expect(user.lastName).toBe('Smith');
      expect(user.stringId).toBeUndefined();
    });

    it('should accept Email and HashedPassword value objects', () => {
      const email = new Email(validEmail);
      const hashedPassword = new HashedPassword(validHashedPassword);
      const userId = new UserId(validUserId);

      const user = new User(
        'John',
        'Doe',
        email,
        hashedPassword,
        userId
      );

      expect(user.emailValue).toBe(validEmail);
      expect(user.password.value).toBe(validHashedPassword);
      expect(user.stringId).toBe(validUserId);
    });
  });

  describe('Validation', () => {
    it('should validate successfully with valid data', () => {
      const user = new User(
        'John',
        'Doe',
        validEmail,
        validHashedPassword,
        validUserId
      );

      expect(() => user.validate()).not.toThrow();
    });

    it('should throw error for empty first name', () => {
      const user = new User(
        '',
        'Doe',
        validEmail,
        validHashedPassword,
        validUserId
      );

      expect(() => user.validate()).toThrow('User must have a valid first name');
    });

    it('should throw error for empty last name', () => {
      const user = new User(
        'John',
        '',
        validEmail,
        validHashedPassword,
        validUserId
      );

      expect(() => user.validate()).toThrow('User must have a valid last name');
    });

    it('should throw error for first name too long', () => {
      const longName = 'a'.repeat(51);
      const user = new User(
        longName,
        'Doe',
        validEmail,
        validHashedPassword,
        validUserId
      );

      expect(() => user.validate()).toThrow('First name must be less than 50 characters');
    });

    it('should throw error for last name too long', () => {
      const longName = 'a'.repeat(51);
      const user = new User(
        'John',
        longName,
        validEmail,
        validHashedPassword,
        validUserId
      );

      expect(() => user.validate()).toThrow('Last name must be less than 50 characters');
    });
  });

  describe('Immutable Updates', () => {
    it('should update profile and return new instance', () => {
      const user = new User(
        'John',
        'Doe',
        validEmail,
        validHashedPassword,
        validUserId
      );

      const updatedUser = user.updateProfile('Jane', 'Smith');

      expect(updatedUser.firstName).toBe('Jane');
      expect(updatedUser.lastName).toBe('Smith');
      expect(updatedUser.fullName).toBe('Jane Smith');
      expect(updatedUser.emailValue).toBe(validEmail); // unchanged
      expect(updatedUser.stringId).toBe(validUserId); // unchanged
      expect(updatedUser.updatedAt).not.toEqual(user.updatedAt); // timestamp updated

      // Original user should remain unchanged
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
    });

    it('should update password and return new instance', () => {
      const user = new User(
        'John',
        'Doe',
        validEmail,
        validHashedPassword,
        validUserId
      );

      const newHashedPassword = '$2a$12$newpasswordhash1234567890abcdefghijklmnopqrstuvwx';
      const updatedUser = user.updatePassword(newHashedPassword);

      expect(updatedUser.password.value).toBe(newHashedPassword);
      expect(updatedUser.firstName).toBe('John'); // unchanged
      expect(updatedUser.lastName).toBe('Doe'); // unchanged
      expect(updatedUser.updatedAt).not.toEqual(user.updatedAt); // timestamp updated

      // Original user should remain unchanged
      expect(user.password.value).toBe(validHashedPassword);
    });
  });

  describe('Equality', () => {
    it('should return true for users with same ID', () => {
      const user1 = new User(
        'John',
        'Doe',
        validEmail,
        validHashedPassword,
        validUserId
      );

      const user2 = new User(
        'Jane',
        'Smith',
        'different@example.com',
        validHashedPassword,
        validUserId
      );

      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false for users with different IDs', () => {
      const user1 = new User(
        'John',
        'Doe',
        validEmail,
        validHashedPassword,
        validUserId
      );

      const user2 = new User(
        'Jane',
        'Smith',
        'different@example.com',
        validHashedPassword,
        '660e8400-e29b-41d4-a716-446655440000'
      );

      expect(user1.equals(user2)).toBe(false);
    });

    it('should return false for users without IDs', () => {
      const user1 = new User(
        'John',
        'Doe',
        validEmail,
        validHashedPassword
      );

      const user2 = new User(
        'Jane',
        'Smith',
        'different@example.com',
        validHashedPassword
      );

      expect(user1.equals(user2)).toBe(false);
    });
  });
});