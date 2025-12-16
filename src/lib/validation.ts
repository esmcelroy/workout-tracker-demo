/**
 * Shared validation constants and functions
 * Used by both frontend and backend to ensure consistency
 * 
 * NOTE: This file centralizes validation rules to prevent duplication and
 * maintain consistency between frontend and backend validation logic.
 * Any changes to validation rules should be made here and will automatically
 * apply to both frontend and backend.
 */

/**
 * Password validation rules
 * 
 * TODO: Consider increasing MIN_LENGTH to 8+ characters for better security
 * and adding additional requirements (uppercase, lowercase, numbers, special chars)
 */
export const PASSWORD_VALIDATION = {
  /**
   * Minimum password length required
   */
  MIN_LENGTH: 6,

  /**
   * Error message for password length validation
   */
  MIN_LENGTH_ERROR: 'Password must be at least 6 characters',
} as const;

/**
 * Validates a password against the defined rules
 * @param password - The password to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (password.length < PASSWORD_VALIDATION.MIN_LENGTH) {
    return {
      isValid: false,
      error: PASSWORD_VALIDATION.MIN_LENGTH_ERROR,
    };
  }

  return { isValid: true };
}
