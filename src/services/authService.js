/**
 * Admin Authentication Service
 * Manages admin session and persistent password changes in localStorage.
 */

const AUTH_STORAGE_KEY = 'call_n_pizza_admin_auth';
const PASSWORD_STORAGE_KEY = 'call_n_pizza_admin_password';

// Default passwords allowed before the admin sets a custom password
const DEFAULT_PASSWORDS = ['admin', 'admin123', 'pizza123', ''];

class AuthService {
  /**
   * Check whether admin is currently authenticated in this session.
   */
  isAuthenticated() {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  }

  /**
   * Verify an input password against stored custom password or defaults.
   */
  verifyPassword(input) {
    const stored = localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (stored !== null) {
      return input === stored;
    }
    return DEFAULT_PASSWORDS.includes(input);
  }

  /**
   * Log in with password.
   */
  login(inputPassword) {
    if (this.verifyPassword(inputPassword)) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      return { success: true };
    }
    return {
      success: false,
      error: 'Invalid password. (Hint: default is "admin" or leave blank if unchanged)',
    };
  }

  /**
   * Log out current admin.
   */
  logout() {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }

  /**
   * Change admin password with strength & confirmation validation.
   */
  changePassword(currentPassword, newPassword, confirmPassword) {
    // 1. Verify current password
    if (!this.verifyPassword(currentPassword)) {
      return {
        success: false,
        error: 'Current password is incorrect.',
      };
    }

    // 2. Validate new password length / strength
    if (!newPassword || newPassword.trim().length < 6) {
      return {
        success: false,
        error: 'New password must be at least 6 characters long.',
      };
    }

    // 3. Verify match
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: 'New password and confirmation do not match.',
      };
    }

    // 4. Save to persistent storage
    try {
      localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
      return {
        success: true,
        message: 'Password changed successfully! Please remember your new password.',
      };
    } catch (e) {
      return {
        success: false,
        error: `Could not save password: ${e.message}`,
      };
    }
  }

  /**
   * Reset password to default (for recovery).
   */
  resetToDefault() {
    localStorage.removeItem(PASSWORD_STORAGE_KEY);
  }
}

export const authService = new AuthService();
