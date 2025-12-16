import { describe, it, expect } from 'vitest';
import { PASSWORD_VALIDATION, validatePassword } from '../../src/lib/validation';

describe('Password Validation', () => {
  describe('PASSWORD_VALIDATION constants', () => {
    it('defines minimum length constant', () => {
      expect(PASSWORD_VALIDATION.MIN_LENGTH).toBe(6);
    });

    it('defines minimum length error message', () => {
      expect(PASSWORD_VALIDATION.MIN_LENGTH_ERROR).toBe('Password must be at least 6 characters');
    });
  });

  describe('validatePassword function', () => {
    it('returns invalid for password shorter than minimum length', () => {
      const result = validatePassword('short');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PASSWORD_VALIDATION.MIN_LENGTH_ERROR);
    });

    it('returns invalid for empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PASSWORD_VALIDATION.MIN_LENGTH_ERROR);
    });

    it('returns valid for password at minimum length', () => {
      const result = validatePassword('123456');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('returns valid for password longer than minimum length', () => {
      const result = validatePassword('longpassword123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
