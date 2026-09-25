import { menuItems as defaultMenuItems, categories as defaultCategories } from '../data/menuData.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const STORAGE_KEY = 'call_n_pizza_menu_items';
const CATEGORIES_STORAGE_KEY = 'call_n_pizza_categories';
const PENDING_OVERRIDES_KEY = 'call_n_pizza_pending_overrides';

// Tracks local overrides (id → partial item) that haven't been confirmed
// written to Supabase yet. Persisted to localStorage so page refresh doesn't
// discard them. fetchItems merges these so polls don't overwrite local admin
// changes when the DB write hasn't persisted yet.
const pendingLocalOverrides = {
  _data: (() => {
    try {
      const raw = localStorage.getItem(PENDING_OVERRIDES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  })(),
  get(id) { return this._data[id]; },
  set(id, value) {
    this._data[id] = value;
    try { localStorage.setItem(PENDING_OVERRIDES_KEY, JSON.stringify(this._data)); } catch {}
  },
  delete(id) {
    delete this._data[id];
    try { localStorage.setItem(PENDING_OVERRIDES_KEY, JSON.stringify(this._data)); } catch {}
  },
};

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
          return parsed.map((item) => {
            const isFeatured = Boolean(item.featured ?? item.show_on_homepage);
            return {
              ...item,
              featured: isFeatured,
              show_on_homepage: isFeatured,
            };
          });
        }
      }
    } catch (e) {
      console.warn('Could not read menu items from localStorage:', e);
    }
    return defaultMenuItems.map((item) => {
      const isFeatured = Boolean(item.featured ?? item.show_on_homepage);
      return {
        ...item,
        featured: isFeatured,
        show_on_homepage: isFeatured,
      };
    });
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

        const formatted = sorted.map((row) => {
          // Merge any pending local overrides so that admin changes survive
          // the next poll even if the Supabase write hasn't landed yet.
          const pending = pendingLocalOverrides.get(row.id);
          const isFeatured = pending
            ? Boolean(pending.featured ?? pending.show_on_homepage)
            : Boolean(row.featured ?? row.show_on_homepage);
          return {
            id: row.id,
            name: row.name,
            description: row.description || '',
            category: row.category,
            image: row.image || '',
            price: Number(row.price) || 0,
            sizes: row.sizes || null,
            available: pending?.available !== undefined ? pending.available : (row.available !== false),
            featured: isFeatured,
            show_on_homepage: isFeatured,
          };
        });

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
    if (!isSupabaseConfigured || !supabase) return { success: true };

    const isFeatured = Boolean(item.show_on_homepage !== undefined ? item.show_on_homepage : item.featured);

    // Track this change locally so fetchItems won't overwrite it if the DB
    // write hasn't landed yet (e.g. session refresh in progress).
    pendingLocalOverrides.set(item.id, {
      featured: isFeatured,
      show_on_homepage: isFeatured,
      available: item.available !== false,
    });

    try {
      // Check for an active Supabase session — writes require authenticated role.
      const { data: sessionData } = await supabase.auth.getSession();
      const hasSession = Boolean(sessionData?.session);

      const updatePayload = {
        name: item.name,
        description: item.description || '',
        category: item.category,
        image: item.image || '',
        price: Number(item.price) || 0,
        sizes: item.sizes || null,
        available: item.available !== false,
        featured: isFeatured,
        updated_at: new Date().toISOString(),
      };

      if (!hasSession) {
        // Not authenticated — cannot write to Supabase (RLS blocks anon writes).
        // The pending override above ensures local state survives polling.
        console.warn('[Supabase] saveItemToSupabase: no auth session, change stored locally only.');
        return { success: true, localOnly: true };
      }

      // 1. Direct update on menu_items by id (works for existing rows)
      const { data, error } = await supabase
        .from('menu_items')
        .update(updatePayload)
        .eq('id', item.id)
        .select();

      if (!error) {
        // Write confirmed — clear the pending override
        pendingLocalOverrides.delete(item.id);
        return { success: true, data: data?.[0] };
      }

      // If full payload had a column or constraint issue, try targeted update on featured status
      const { error: featError } = await supabase
        .from('menu_items')
        .update({ featured: isFeatured, updated_at: new Date().toISOString() })
        .eq('id', item.id);

      if (!featError) {
        pendingLocalOverrides.delete(item.id);
        return { success: true };
      }

      // 2. Fallback upsert if row did not exist yet
      const upsertPayload = {
        id: item.id,
        ...updatePayload,
      };

      const { error: upsertError } = await supabase
        .from('menu_items')
        .upsert(upsertPayload, { onConflict: 'id' });

      if (upsertError) {
        console.warn('[Supabase] saveItemToSupabase notice:', upsertError.message);
        // Keep override in pendingLocalOverrides so polls don't revert the change
        return { success: false, error: upsertError.message };
      }

      pendingLocalOverrides.delete(item.id);
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
          if (!parsed.some((c) => c.id === 'shawarma')) {
            const burgerIdx = parsed.findIndex((c) => c.id === 'burger');
            const shawarmaCat = { id: 'shawarma', name: 'Shawarma', icon: '🌯' };
            if (burgerIdx !== -1) parsed.splice(burgerIdx + 1, 0, shawarmaCat);
            else parsed.push(shawarmaCat);
          }
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

        // Always ensure 'shawarma' category is included
        if (!formatted.some((c) => c.id === 'shawarma')) {
          const burgerIdx = formatted.findIndex((c) => c.id === 'burger');
          const shawarmaCat = { id: 'shawarma', name: 'Shawarma', icon: '🌯' };
          if (burgerIdx !== -1) {
            formatted.splice(burgerIdx + 1, 0, shawarmaCat);
          } else {
            formatted.push(shawarmaCat);
          }
        }

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
