import { menuItems as defaultMenuItems, categories as defaultCategories } from '../data/menuData.js';

const STORAGE_KEY = 'call_n_pizza_menu_items';
const CATEGORIES_STORAGE_KEY = 'call_n_pizza_categories';

/**
 * Menu service abstraction layer.
 * Currently uses localStorage for persistence in demo mode.
 * Ready to be connected to Supabase Database & Supabase Storage later.
 */
class MenuService {
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('menu-items-updated', { detail: items }));
      }
    } catch (e) {
      console.error('Could not save menu items to localStorage:', e);
    }
  }

  resetToDefault() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('menu-items-updated', { detail: defaultMenuItems }));
      }
    } catch (e) {
      console.error(e);
    }
    return defaultMenuItems;
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('menu-categories-updated', { detail: categoriesList })
        );
      }
    } catch (e) {
      console.error('Could not save categories to localStorage:', e);
    }
  }

  resetCategories() {
    try {
      localStorage.removeItem(CATEGORIES_STORAGE_KEY);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('menu-categories-updated', { detail: defaultCategories })
        );
      }
    } catch (e) {
      console.error(e);
    }
    return defaultCategories;
  }
}

export const menuService = new MenuService();
export { defaultCategories as categories };
