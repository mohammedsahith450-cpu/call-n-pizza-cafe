import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { menuService } from '../services/menuService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [items, setItems] = useState(() => menuService.getInitialItems());
  const [categories, setCategories] = useState(() => menuService.getCategories());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch fresh data from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const loadFromSupabase = async () => {
      setIsLoading(true);
      try {
        const [remoteCats, remoteItems] = await Promise.all([
          menuService.fetchCategories(),
          menuService.fetchItems(),
        ]);
        if (isMounted) {
          if (remoteCats && remoteCats.length > 0) setCategories(remoteCats);
          if (remoteItems && remoteItems.length > 0) setItems(remoteItems);
        }
      } catch (e) {
        console.warn('[MenuContext] Could not hydrate from Supabase:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadFromSupabase();

    return () => {
      isMounted = false;
    };
  }, []);

  // Realtime Supabase synchronization:
  // Whenever categories or menu_items are modified in Supabase, instantly reflect
  // on all customer devices (mobile & desktop) without waiting for polling.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel('menu-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        async () => {
          try {
            const freshCats = await menuService.fetchCategories();
            if (freshCats && freshCats.length > 0) {
              setCategories(freshCats);
            }
          } catch (e) {
            console.warn('[Realtime] Failed to sync categories:', e);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        async () => {
          try {
            const freshItems = await menuService.fetchItems();
            if (freshItems && freshItems.length > 0) {
              setItems(freshItems);
            }
          } catch (e) {
            console.warn('[Realtime] Failed to sync menu items:', e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Cross-tab sync: when Admin saves in another browser tab (or the same origin
  // opens in a new tab), the 'storage' event fires here so the menu re-reads
  // the latest localStorage values that the other tab just wrote.
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'call_n_pizza_menu_items') {
        setItems(menuService.getInitialItems());
      } else if (e.key === 'call_n_pizza_categories') {
        setCategories(menuService.getCategories());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Periodic Supabase re-fetch every 30 s as a fallback in case Realtime connection
  // drops or is not enabled in the database.
  const pollIntervalRef = useRef(null);
  useEffect(() => {
    const poll = async () => {
      try {
        const [remoteCats, remoteItems] = await Promise.all([
          menuService.fetchCategories(),
          menuService.fetchItems(),
        ]);
        if (remoteCats && remoteCats.length > 0) setCategories(remoteCats);
        if (remoteItems && remoteItems.length > 0) setItems(remoteItems);
      } catch {
        // Silent — network may be unavailable; keep showing cached data
      }
    };

    pollIntervalRef.current = setInterval(poll, 30000);
    return () => clearInterval(pollIntervalRef.current);
  }, []);


  // ── Food Item Handlers ────────────────────────────────────────
  const updateItem = useCallback(async (id, updates) => {
    const existing = items.find((item) => item.id === id);
    if (!existing) return { success: false, error: 'Item not found' };

    const isFeatured = updates.featured !== undefined
      ? Boolean(updates.featured)
      : (updates.show_on_homepage !== undefined ? Boolean(updates.show_on_homepage) : Boolean(existing.featured));

    const updatedItem = {
      ...existing,
      ...updates,
      featured: isFeatured,
      show_on_homepage: isFeatured,
    };

    // 1. Immediately update React state and localStorage so the UI updates without delay
    setItems((prev) => {
      const updated = prev.map((item) => (item.id === id ? updatedItem : item));
      menuService.saveItems(updated);
      return updated;
    });

    // 2. Persist to Supabase database
    const saveRes = await menuService.saveItemToSupabase(updatedItem);
    if (!saveRes?.success) {
      console.warn('[MenuContext] Notice saving item to Supabase:', saveRes?.error);
    }

    return { success: true, item: updatedItem };
  }, [items]);

  const addItem = useCallback(async (newItem) => {
    const id = newItem.id || `item-${Date.now()}`;
    const isFeatured = Boolean(newItem.featured ?? newItem.show_on_homepage);
    const fullItem = {
      ...newItem,
      id,
      featured: isFeatured,
      show_on_homepage: isFeatured,
    };

    setItems((prev) => {
      const updated = [fullItem, ...prev];
      menuService.saveItems(updated);
      return updated;
    });

    const saveRes = await menuService.saveItemToSupabase(fullItem);
    if (!saveRes?.success) {
      console.warn('[MenuContext] Notice adding item to Supabase:', saveRes?.error);
    }

    return { success: true, item: fullItem };
  }, []);

  const deleteItem = useCallback(async (id) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      menuService.saveItems(updated);
      return updated;
    });

    const delRes = await menuService.deleteItemFromSupabase(id);
    if (!delRes?.success) {
      console.warn('[MenuContext] Notice deleting item from Supabase:', delRes?.error);
    }

    return { success: true };
  }, []);

  const toggleAvailability = useCallback(async (id) => {
    const existing = items.find((item) => item.id === id);
    if (!existing) return { success: false, error: 'Item not found' };

    const updatedItem = { ...existing, available: !existing.available };

    setItems((prev) => {
      const updated = prev.map((item) => (item.id === id ? updatedItem : item));
      menuService.saveItems(updated);
      return updated;
    });

    const saveRes = await menuService.saveItemToSupabase(updatedItem);
    return { success: true, item: updatedItem };
  }, [items]);

  const toggleFeatured = useCallback(async (id) => {
    const existing = items.find((item) => item.id === id);
    if (!existing) return { success: false, error: 'Item not found' };

    const newFeatured = !(existing.featured || existing.show_on_homepage);
    return updateItem(id, { featured: newFeatured, show_on_homepage: newFeatured });
  }, [items, updateItem]);

  const resetMenu = useCallback(() => {
    const defaultItems = menuService.resetToDefault();
    const defaultCats = menuService.resetCategories();
    setItems(defaultItems);
    setCategories(defaultCats);
  }, []);

  // ── Category Handlers ─────────────────────────────────────────
  const addCategory = useCallback(async (categoryData) => {
    const name = (categoryData.name || '').trim();
    if (!name) {
      return { success: false, error: 'Category name is required.' };
    }

    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const id = baseSlug || `cat-${Date.now()}`;

    // Check for duplicate id
    let uniqueId = id;
    let counter = 1;
    while (categories.some((c) => c.id === uniqueId)) {
      uniqueId = `${id}-${counter}`;
      counter++;
    }

    const newCat = {
      id: uniqueId,
      name,
      icon: categoryData.icon || '🍽️',
    };

    // Save to Supabase first as source of truth
    const saveRes = await menuService.saveCategoryToSupabase(newCat);
    if (!saveRes?.success) {
      return { success: false, error: saveRes?.error || 'Failed to save category to Supabase database.' };
    }

    setCategories((prev) => {
      const updated = [...prev, newCat];
      menuService.saveCategories(updated);
      return updated;
    });

    return { success: true, category: newCat };
  }, [categories]);

  const updateCategory = useCallback(async (id, updates) => {
    if (id === 'all') {
      return { success: false, error: 'The "All" category cannot be edited.' };
    }

    const name = (updates.name || '').trim();
    if (!name) {
      return { success: false, error: 'Category name cannot be empty.' };
    }

    const existingCat = categories.find((c) => c.id === id);
    if (!existingCat) {
      return { success: false, error: 'Category not found.' };
    }

    const updatedCat = {
      ...existingCat,
      name,
      icon: updates.icon || existingCat.icon || '🍽️',
    };

    const saveRes = await menuService.saveCategoryToSupabase(updatedCat);
    if (!saveRes?.success) {
      return { success: false, error: saveRes?.error || 'Failed to update category in Supabase database.' };
    }

    setCategories((prev) => {
      const updated = prev.map((cat) => (cat.id === id ? updatedCat : cat));
      menuService.saveCategories(updated);
      return updated;
    });

    return { success: true, category: updatedCat };
  }, [categories]);

  const deleteCategory = useCallback(async (id) => {
    if (id === 'all') {
      return { success: false, error: 'The "All" category cannot be deleted.' };
    }

    // Check if any food items are currently using this category
    const count = items.filter((item) => item.category === id).length;
    if (count > 0) {
      return {
        success: false,
        error: `Cannot delete category: ${count} food item(s) are assigned to it. Please reassign or delete them first.`,
      };
    }

    const delRes = await menuService.deleteCategoryFromSupabase(id);
    if (!delRes?.success) {
      return { success: false, error: delRes?.error || 'Failed to delete category from Supabase database.' };
    }

    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      menuService.saveCategories(updated);
      return updated;
    });

    return { success: true };
  }, [items]);

  return (
    <MenuContext.Provider
      value={{
        items,
        categories,
        isLoading,
        updateItem,
        addItem,
        deleteItem,
        toggleAvailability,
        toggleFeatured,
        resetMenu,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
