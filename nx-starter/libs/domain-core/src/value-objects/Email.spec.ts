import { Email } from './Email';

describe('Email Value Object', () => {
  describe('Valid emails', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
      'user_name@example-domain.com',
      'a@b.co',
      'very.long.email.address@very-long-domain-name.com',
    ];

    validEmails.forEach(email => {
      it(`should accept valid email: ${email}`, () => {
        const emailObj = new Email(email);
        expect(emailObj.value).toBe(email);
      });
    });
  });

  describe('Invalid emails', () => {
    const invalidEmails = [
      '',
      'invalid-email',
      '@domain.com',
      'user@',
      'user@domain',
      'user..name@domain.com',
      'user@domain..com',
      'user@.domain.com',
      'user@domain.com.',
      'user name@domain.com',
      'user@domain .com',
      'user@domain.com@extra',
      'a'.repeat(255) + '@domain.com', // too long
    ];

    invalidEmails.forEach(email => {
      it(`should reject invalid email: ${email}`, () => {
        expect(() => new Email(email)).toThrow();
      });
    });
  });

  describe('Email parsing', () => {
    it('should extract domain correctly', () => {
      const email = new Email('user@example.com');
      expect(email.domain).toBe('example.com');
    });

    it('should extract local part correctly', () => {
      const email = new Email('user.name@example.com');
      expect(email.localPart).toBe('user.name');
    });
  });

  describe('Static validation', () => {
    it('should return true for valid email', () => {
      expect(Email.isValid('test@example.com')).toBe(true);
    });

    it('should return false for invalid email', () => {
      expect(Email.isValid('invalid-email')).toBe(false);
    });
  });

  describe('Equality', () => {
    it('should be equal for same email values', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should not be equal for different email values', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('different@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
});