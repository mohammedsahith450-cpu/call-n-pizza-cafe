/**
 * ============================================
 * GALLERY SERVICE
 * ============================================
 * Manages customer-facing food gallery images.
 * Connects to Supabase Database (gallery_items) with local cache fallback.
 * 
 * Mapping:
 * - Frontend: hidden (boolean)
 * - Supabase: visible (boolean)
 *   visible = !hidden
 *   hidden = !visible
 * ============================================
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

const GALLERY_STORAGE_KEY = 'call_n_pizza_gallery_items';

export const DEFAULT_GALLERY_CATEGORIES = [
  'Pizza',
  'Burger',
  'Chicken',
  'Beverages',
  'Cafe & Ambiance',
  'Other',
];

export const defaultGalleryItems = [
  {
    id: 'gal-1',
    title: 'Veg Supreme Pizza',
    category: 'Pizza',
    image: '/images/food/veg-pizza.jpg',
    description: 'Loaded with bell peppers, olives, juicy tomatoes & gooey mozzarella',
    hidden: false,
    createdAt: 1710000001,
  },
  {
    id: 'gal-2',
    title: 'Grilled Chicken Pizza',
    category: 'Pizza',
    image: '/images/food/chicken-pizza.jpg',
    description: 'Succulent grilled chicken bites seasoned to perfection',
    hidden: false,
    createdAt: 1710000002,
  },
  {
    id: 'gal-3',
    title: 'Spicy Paneer Pizza',
    category: 'Pizza',
    image: '/images/food/paneer-pizza.jpg',
    description: 'Golden paneer cubes with onions & bell peppers on crispy crust',
    hidden: false,
    createdAt: 1710000003,
  },
  {
    id: 'gal-4',
    title: 'Classic Mushroom Pizza',
    category: 'Pizza',
    image: '/images/food/mushroom-pizza.jpg',
    description: 'Sliced button mushrooms infused with Italian aromatic herbs',
    hidden: false,
    createdAt: 1710000004,
  },
  {
    id: 'gal-5',
    title: 'Crispy Veg Burger',
    category: 'Burger',
    image: '/images/food/veg-burger.jpg',
    description: 'Golden crumb-fried patty layered with freshly cut greens & cheese',
    hidden: false,
    createdAt: 1710000005,
  },
  {
    id: 'gal-6',
    title: 'Juicy Chicken Burger',
    category: 'Burger',
    image: '/images/food/chicken-burger.jpg',
    description: 'Tender chicken patty topped with house sauce & crunchy lettuce',
    hidden: false,
    createdAt: 1710000006,
  },
  {
    id: 'gal-7',
    title: 'Paneer Delight Burger',
    category: 'Burger',
    image: '/images/food/paneer-burger.jpg',
    description: 'Thick grilled cottage cheese slice marinated with tandoori spices',
    hidden: false,
    createdAt: 1710000007,
  },
];

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

/**
 * Validates file type and size.
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  const nameParts = file.name.split('.');
  const ext = nameParts.length > 1 ? nameParts.pop().toLowerCase() : '';
  const validExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
  const validType = ALLOWED_IMAGE_TYPES.includes(file.type);

  if (!validType && !validExt) {
    return {
      valid: false,
      error: `Invalid file format "${file.name}". Only JPG, JPEG, PNG, and WEBP formats are supported.`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `"${file.name}" is too large (${sizeMb}MB). Maximum allowed size is 10MB.`,
    };
  }

  return { valid: true };
}

/**
 * Compresses and resizes image to keep gallery fast & lightweight.
 */
export function compressAndProcessImage(file, maxDimension = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return reject(new Error(validation.error));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}"`));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error(`Could not decode image "${file.name}"`));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = '';
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        if (!dataUrl || !dataUrl.startsWith('data:image/')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve({
          dataUrl,
          originalName: file.name,
          width,
          height,
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

class GalleryService {
  // ── Synchronous Cache Readers ────────────────────────────────
  getItems() {
    try {
      const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read gallery items from localStorage:', e);
    }
    return defaultGalleryItems;
  }

  getPublicItems() {
    return this.getItems().filter((item) => !item.hidden);
  }

  saveItems(items) {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(items));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gallery-updated', { detail: items }));
      }
    } catch (e) {
      console.error('Could not save gallery items to localStorage:', e);
    }
  }

  // ── Asynchronous Supabase Operations ─────────────────────────
  async fetchItems() {
    if (!isSupabaseConfigured || !supabase) {
      return this.getItems();
    }

    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase] fetchGalleryItems error, using local data:', error.message);
        return this.getItems();
      }

      if (Array.isArray(data) && data.length > 0) {
        // Map database visible -> frontend hidden (!visible)
        const formatted = data.map((row) => ({
          id: row.id,
          title: row.title || 'Untitled Dish',
          category: row.category || 'Pizza',
          image: row.image,
          description: row.description || '',
          hidden: row.visible !== undefined ? !row.visible : false,
          createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        }));
        this.saveItems(formatted);
        return formatted;
      }
    } catch (err) {
      console.warn('[Supabase] Exception fetching gallery items:', err);
    }

    return this.getItems();
  }

  async addItem(itemData) {
    const items = this.getItems();
    const newItem = {
      id: itemData.id || `gal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: itemData.title?.trim() || 'Untitled Dish',
      category: itemData.category || 'Pizza',
      description: itemData.description?.trim() || '',
      image: itemData.image,
      hidden: Boolean(itemData.hidden),
      createdAt: itemData.createdAt || Date.now(),
    };

    const updated = [newItem, ...items];
    this.saveItems(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          await supabase.from('gallery_items').upsert({
            id: newItem.id,
            title: newItem.title,
            category: newItem.category,
            image: newItem.image,
            description: newItem.description,
            visible: !newItem.hidden,
            created_at: new Date(newItem.createdAt).toISOString(),
          });
        }
      } catch (err) {
        console.warn('[Supabase] Error saving gallery item:', err);
      }
    }

    return newItem;
  }

  async addMultipleItems(itemsArray) {
    const items = this.getItems();
    const newItems = itemsArray.map((data, index) => ({
      id: data.id || `gal-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
      title: data.title?.trim() || 'Untitled Dish',
      category: data.category || 'Pizza',
      description: data.description?.trim() || '',
      image: data.image,
      hidden: Boolean(data.hidden),
      createdAt: Date.now() + index,
    }));

    const updated = [...newItems, ...items];
    this.saveItems(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          const rows = newItems.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            image: item.image,
            description: item.description,
            visible: !item.hidden,
            created_at: new Date(item.createdAt).toISOString(),
          }));
          await supabase.from('gallery_items').upsert(rows);
        }
      } catch (err) {
        console.warn('[Supabase] Error saving batch gallery items:', err);
      }
    }

    return newItems;
  }

  async updateItem(id, updates) {
    const items = this.getItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      ...updates,
      title: updates.title !== undefined ? updates.title.trim() : items[index].title,
      description: updates.description !== undefined ? updates.description.trim() : items[index].description,
    };

    items[index] = updatedItem;
    this.saveItems(items);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          const dbPayload = {
            title: updatedItem.title,
            category: updatedItem.category,
            image: updatedItem.image,
            description: updatedItem.description,
          };
          if (updatedItem.hidden !== undefined) {
            dbPayload.visible = !updatedItem.hidden;
          }
          await supabase.from('gallery_items').update(dbPayload).eq('id', id);
        }
      } catch (err) {
        console.warn('[Supabase] Error updating gallery item:', err);
      }
    }

    return updatedItem;
  }

  async deleteItem(id) {
    const items = this.getItems();
    const updated = items.filter((i) => i.id !== id);
    this.saveItems(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          await supabase.from('gallery_items').delete().eq('id', id);
        }
      } catch (err) {
        console.warn('[Supabase] Error deleting gallery item:', err);
      }
    }

    return updated;
  }

  async toggleHidden(id) {
    const items = this.getItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;

    items[index].hidden = !items[index].hidden;
    this.saveItems(items);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          await supabase.from('gallery_items').update({
            visible: !items[index].hidden,
          }).eq('id', id);
        }
      } catch (err) {
        console.warn('[Supabase] Error toggling gallery item visibility:', err);
      }
    }

    return items[index];
  }

  resetToDefault() {
    try {
      localStorage.removeItem(GALLERY_STORAGE_KEY);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gallery-updated', { detail: defaultGalleryItems }));
      }
    } catch (e) {
      console.error(e);
    }
    return defaultGalleryItems;
  }
}

export const galleryService = new GalleryService();
