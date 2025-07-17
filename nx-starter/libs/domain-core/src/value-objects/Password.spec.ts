import { Password } from './Password';

describe('Password Value Object', () => {
  describe('Valid passwords', () => {
    const validPasswords = [
      'SecurePass123',
      'MyPassword1',
      'Abcdefgh1',
      'ComplexP@ssw0rd',
      'AnotherSecure1',
      'LongPasswordWith123Numbers',
    ];

    validPasswords.forEach(password => {
      it(`should accept valid password: ${password}`, () => {
        const passwordObj = new Password(password);
        expect(passwordObj.value).toBe(password);
      });
    });
  });

  describe('Invalid passwords', () => {
    const invalidPasswords = [
      '',
      'short',
      'nouppercaseornumber',
      'NOLOWERCASEORNUMBER',
      'NoNumber',
      'nonumber',
      'NoUppercase1',
      'NOLOWERCASE1',
      'a'.repeat(129), // too long
    ];

    invalidPasswords.forEach(password => {
      it(`should reject invalid password: ${password}`, () => {
        expect(() => new Password(password)).toThrow();
      });
    });
  });

  describe('Password requirements', () => {
    it('should require at least 8 characters', () => {
      expect(() => new Password('Short1')).toThrow('Password must be at least 8 characters long');
    });

    it('should require at most 128 characters', () => {
      const longPassword = 'A1' + 'a'.repeat(127);
      expect(() => new Password(longPassword)).toThrow('Password must be less than 128 characters long');
    });

    it('should require at least one uppercase letter', () => {
      expect(() => new Password('lowercase1')).toThrow('Password must contain at least one uppercase letter, one lowercase letter, and one digit');
    });

    it('should require at least one lowercase letter', () => {
      expect(() => new Password('UPPERCASE1')).toThrow('Password must contain at least one uppercase letter, one lowercase letter, and one digit');
    });

    it('should require at least one digit', () => {
      expect(() => new Password('NoNumber')).toThrow('Password must contain at least one uppercase letter, one lowercase letter, and one digit');
    });
  });

  describe('Static validation', () => {
    it('should return true for valid password', () => {
      expect(Password.isValid('SecurePass123')).toBe(true);
    });

    it('should return false for invalid password', () => {
      expect(Password.isValid('weak')).toBe(false);
    });
  });

  describe('Equality', () => {
    it('should be equal for same password values', () => {
      const password1 = new Password('SecurePass123');
      const password2 = new Password('SecurePass123');
      expect(password1.equals(password2)).toBe(true);
    });

    it('should not be equal for different password values', () => {
      const password1 = new Password('SecurePass123');
      const password2 = new Password('DifferentPass456');
      expect(password1.equals(password2)).toBe(false);
    });
  });
});