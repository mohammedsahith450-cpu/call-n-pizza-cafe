import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Keep state synced across tabs / external events
  useEffect(() => {
    const handleItemsUpdate = (e) => {
      if (e.detail) {
        setItems(e.detail);
      } else {
        setItems(menuService.getInitialItems());
      }
    };

    const handleCategoriesUpdate = (e) => {
      if (e.detail) {
        setCategories(e.detail);
      } else {
        setCategories(menuService.getCategories());
      }
    };

    window.addEventListener('menu-items-updated', handleItemsUpdate);
    window.addEventListener('menu-categories-updated', handleCategoriesUpdate);
    window.addEventListener('storage', handleItemsUpdate);
    window.addEventListener('storage', handleCategoriesUpdate);

    return () => {
      window.removeEventListener('menu-items-updated', handleItemsUpdate);
      window.removeEventListener('menu-categories-updated', handleCategoriesUpdate);
      window.removeEventListener('storage', handleItemsUpdate);
      window.removeEventListener('storage', handleCategoriesUpdate);
    };
  }, []);

  // Save items to localStorage whenever items state changes
  useEffect(() => {
    menuService.saveItems(items);
  }, [items]);

  // Save categories to localStorage whenever categories state changes
  useEffect(() => {
    menuService.saveCategories(categories);
  }, [categories]);

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
