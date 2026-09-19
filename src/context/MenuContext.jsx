import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { menuService } from '../services/menuService';

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

  // BUG 1 FIX: Periodic Supabase re-fetch every 30 s so that mobile customers
  // automatically see Admin category/item changes without a hard page reload.
  // Supabase is the source of truth; localStorage is only the fast-boot cache.
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
    let updatedItem = null;
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          updatedItem = { ...item, ...updates };
          return updatedItem;
        }
        return item;
      });
      menuService.saveItems(updated);
      return updated;
    });

    if (updatedItem) {
      await menuService.saveItemToSupabase(updatedItem);
    }
  }, []);

  const addItem = useCallback(async (newItem) => {
    const id = newItem.id || `item-${Date.now()}`;
    const fullItem = { ...newItem, id };
    setItems((prev) => {
      const updated = [fullItem, ...prev];
      menuService.saveItems(updated);
      return updated;
    });

    await menuService.saveItemToSupabase(fullItem);
    return fullItem;
  }, []);

  const deleteItem = useCallback(async (id) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      menuService.saveItems(updated);
      return updated;
    });

    await menuService.deleteItemFromSupabase(id);
  }, []);

  const toggleAvailability = useCallback(async (id) => {
    let changedItem = null;
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          changedItem = { ...item, available: !item.available };
          return changedItem;
        }
        return item;
      });
      menuService.saveItems(updated);
      return updated;
    });

    if (changedItem) {
      await menuService.saveItemToSupabase(changedItem);
    }
  }, []);

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

    setCategories((prev) => {
      const updated = [...prev, newCat];
      menuService.saveCategories(updated);
      return updated;
    });

    await menuService.saveCategoryToSupabase(newCat);
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

    let updatedCat = null;
    setCategories((prev) => {
      const updated = prev.map((cat) => {
        if (cat.id === id) {
          updatedCat = {
            ...cat,
            name,
            icon: updates.icon || cat.icon || '🍽️',
          };
          return updatedCat;
        }
        return cat;
      });
      menuService.saveCategories(updated);
      return updated;
    });

    if (updatedCat) {
      await menuService.saveCategoryToSupabase(updatedCat);
    }

    return { success: true };
  }, []);

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

    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      menuService.saveCategories(updated);
      return updated;
    });

    await menuService.deleteCategoryFromSupabase(id);
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
