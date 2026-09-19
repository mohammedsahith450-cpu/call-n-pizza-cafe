import { menuItems as defaultMenuItems, categories as defaultCategories } from '../data/menuData.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const STORAGE_KEY = 'call_n_pizza_menu_items';
const CATEGORIES_STORAGE_KEY = 'call_n_pizza_categories';

/**
 * Menu service layer connecting to Supabase database with resilient local fallback.
 * Manages both Menu Items and Categories.
 */
class MenuService {
  // ── Synchronous Cache Readers (instant render on load) ───────
  getInitialItems() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read menu items from localStorage:', e);
    }
    return defaultMenuItems;
  }

  saveItems(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Could not save menu items to localStorage:', e);
    }
  }

  resetToDefault() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    return defaultMenuItems;
  }

  // ── Asynchronous Supabase Operations for Menu Items ──────────
  async fetchItems() {
    if (!isSupabaseConfigured || !supabase) {
      // Supabase not configured — return null so callers keep their current state
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*');

      if (error) {
        console.warn('[Supabase] fetchItems error, using local data:', error.message);
        return null; // caller will retain current state
      }

      if (Array.isArray(data)) {
        // Safely sort in memory if created_at is present
        const sorted = [...data];
        if (sorted.some((r) => r.created_at)) {
          sorted.sort((a, b) => {
            if (!a.created_at) return 1;
            if (!b.created_at) return -1;
            return new Date(a.created_at) - new Date(b.created_at);
          });
        }

        const formatted = sorted.map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description || '',
          category: row.category,
          image: row.image || '',
          price: Number(row.price) || 0,
          sizes: row.sizes || null,
          available: row.available !== false,
          featured: Boolean(row.featured),
        }));
        // Persist fresh Supabase data to localStorage so the next page load
        // (including on mobile devices) starts with up-to-date cached data.
        this.saveItems(formatted);
        return formatted;
      }
    } catch (err) {
      console.warn('[Supabase] Exception fetching menu items:', err);
    }

    return null; // Supabase unreachable — caller retains current state
  }

  async saveItemToSupabase(item) {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase is not configured' };

    // Security check: only authenticated admin can mutate database
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        return { success: false, error: 'Authentication required for database writes. Please ensure you are logged in.' };
      }

      const payload = {
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: item.category,
        image: item.image || '',
        price: Number(item.price) || 0,
        sizes: item.sizes || null,
        available: Boolean(item.available),
        featured: Boolean(item.featured),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('menu_items').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('[Supabase] saveItemToSupabase error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      console.error('[Supabase] Exception saving item:', err);
      return { success: false, error: err.message };
    }
  }

  async deleteItemFromSupabase(id) {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase is not configured' };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        return { success: false, error: 'Authentication required for database writes. Please ensure you are logged in.' };
      }

      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) {
        console.warn('[Supabase] deleteItemFromSupabase error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      console.error('[Supabase] Exception deleting item:', err);
      return { success: false, error: err.message };
    }
  }

  // ── Dynamic Category Management ──────────────────────────────
  getCategories() {
    try {
      const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read categories from localStorage:', e);
    }
    return defaultCategories;
  }

  saveCategories(categoriesList) {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categoriesList));
    } catch (e) {
      console.error('Could not save categories to localStorage:', e);
    }
  }

  resetCategories() {
    try {
      localStorage.removeItem(CATEGORIES_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    return defaultCategories;
  }

  async fetchCategories() {
    if (!isSupabaseConfigured || !supabase) {
      // Supabase not configured — return null so callers keep their current state
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');

      if (error) {
        console.warn('[Supabase] fetchCategories error, using local data:', error.message);
        return null; // caller will retain current state
      }

      if (Array.isArray(data)) {
        // Safely sort in memory if created_at is present
        const sorted = [...data];
        if (sorted.some((r) => r.created_at)) {
          sorted.sort((a, b) => {
            if (!a.created_at) return 1;
            if (!b.created_at) return -1;
            return new Date(a.created_at) - new Date(b.created_at);
          });
        }

        let formatted = sorted.map((row) => ({
          id: row.id,
          name: row.name,
          icon: row.icon || '🍽️',
        }));

        // Always ensure the synthetic 'All' category is present as the first entry
        if (!formatted.some((c) => c.id === 'all')) {
          formatted = [{ id: 'all', name: 'All', icon: '🍽️' }, ...formatted];
        }

        // Persist fresh Supabase data to localStorage so the next page load
        // (including on mobile devices) starts with up-to-date cached data.
        this.saveCategories(formatted);
        return formatted;
      }
    } catch (err) {
      console.warn('[Supabase] Exception fetching categories:', err);
    }

    return null; // Supabase unreachable — caller retains current state
  }

  async saveCategoryToSupabase(category) {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase is not configured' };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        return { success: false, error: 'Authentication required for database writes. Please ensure you are logged in.' };
      }

      const payload = {
        id: category.id,
        name: category.name,
        icon: category.icon || '🍽️',
      };

      const { error } = await supabase.from('categories').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('[Supabase] saveCategoryToSupabase error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      console.error('[Supabase] Exception saving category:', err);
      return { success: false, error: err.message };
    }
  }

  async deleteCategoryFromSupabase(id) {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase is not configured' };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        return { success: false, error: 'Authentication required for database writes. Please ensure you are logged in.' };
      }

      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        console.warn('[Supabase] deleteCategoryFromSupabase error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      console.error('[Supabase] Exception deleting category:', err);
      return { success: false, error: err.message };
    }
  }
}

export const menuService = new MenuService();
export { defaultCategories as categories };
