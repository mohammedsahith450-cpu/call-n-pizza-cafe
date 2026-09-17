/**
 * Admin Authentication Service
 * Exclusively uses Supabase Auth.
 * Never stores passwords in localStorage or sessionStorage.
 * Does not permit unauthenticated/demo bypasses.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

class AuthService {
  constructor() {
    this.currentSession = null;
    this.currentUser = null;
    this.isInitialized = false;
    this.authListeners = [];

    if (isSupabaseConfigured && supabase) {
      // 1. Initial session retrieval
      supabase.auth.getSession().then(({ data: { session } }) => {
        this.currentSession = session;
        this.currentUser = session?.user || null;
        this.isInitialized = true;
        this.notifyListeners(session);
      }).catch((err) => {
        console.warn('[AuthService] Error retrieving initial session:', err);
        this.isInitialized = true;
      });

      // 2. Real-time auth state listener
      supabase.auth.onAuthStateChange((event, session) => {
        this.currentSession = session;
        this.currentUser = session?.user || null;
        this.notifyListeners(session);
      });
    } else {
      this.isInitialized = true;
    }
  }

  notifyListeners(session) {
    this.authListeners.forEach((listener) => {
      try {
        listener(session);
      } catch (e) {
        console.error('[AuthService] Listener error:', e);
      }
    });
  }

  onAuthStateChange(callback) {
    this.authListeners.push(callback);
    // Call immediately with current session
    if (this.isInitialized) {
      callback(this.currentSession);
    }
    return () => {
      this.authListeners = this.authListeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Check whether admin has an active, valid Supabase session.
   */
  isAuthenticated() {
    return Boolean(this.currentSession);
  }

  /**
   * Get current Supabase user.
   */
  async getSupabaseUser() {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data } = await supabase.auth.getUser();
      return data?.user || this.currentUser;
    } catch {
      return this.currentUser;
    }
  }

  /**
   * Get current session.
   */
  async getSession() {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data } = await supabase.auth.getSession();
      return data?.session || this.currentSession;
    } catch {
      return this.currentSession;
    }
  }

  /**
   * Get admin email display.
   */
  getAdminEmail() {
    return this.currentUser?.email || this.currentSession?.user?.email || 'admin';
  }

  /**
   * Authenticate strictly using Supabase Auth (email & password).
   */
  async login(email, password) {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'Supabase client is not configured. Please check .env settings.',
      };
    }

    if (!email || !email.trim()) {
      return { success: false, error: 'Admin email is required.' };
    }

    if (!password) {
      return { success: false, error: 'Password is required.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Invalid email or password.',
        };
      }

      this.currentSession = data.session;
      this.currentUser = data.user;
      return { success: true, user: data.user };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Supabase authentication request failed.',
      };
    }
  }

  /**
   * Log out current admin from Supabase Auth.
   */
  async logout() {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Error signing out of Supabase:', e);
      }
    }
    this.currentSession = null;
    this.currentUser = null;
  }

  /**
   * Change admin password via Supabase Auth without saving in localStorage.
   */
  async changePassword(currentPassword, newPassword, confirmPassword) {
    if (!newPassword || newPassword.trim().length < 6) {
      return {
        success: false,
        error: 'New password must be at least 6 characters long.',
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: 'New password and confirmation do not match.',
      };
    }

    if (!this.isAuthenticated()) {
      return {
        success: false,
        error: 'You must be logged in as an authenticated Supabase admin to change the password.',
      };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: error.message };
      }
      return {
        success: true,
        message: 'Password updated successfully in Supabase Auth!',
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Could not update password via Supabase Auth.',
      };
    }
  }
}

export const authService = new AuthService();
