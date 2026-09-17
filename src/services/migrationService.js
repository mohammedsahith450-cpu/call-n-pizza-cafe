/**
 * Safe Data Migration Service
 * Reads existing localStorage data first (to preserve any admin customizations),
 * uses hardcoded data only as fallback for missing items,
 * and safely upserts records into Supabase.
 * 
 * Never deletes or wipes localStorage.
 */

import { menuItems as defaultMenuItems, categories as defaultCategories } from '../data/menuData.js';
import { defaultGalleryItems } from './galleryService.js';
import { restaurantSettingsService } from './restaurantSettingsService.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const STORAGE_KEYS = {
  menu: 'call_n_pizza_menu_items',
  categories: 'call_n_pizza_categories',
  gallery: 'call_n_pizza_gallery_items',
  settings: 'call_n_pizza_settings',
};

/**
 * Safely reads and parses a JSON array from localStorage.
 */
function readLocalStorageArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch (e) {
    console.warn(`Could not parse localStorage key "${key}":`, e);
    return null;
  }
}

/**
 * Safely reads and parses an object from localStorage.
 */
function readLocalStorageObject(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch (e) {
    console.warn(`Could not parse localStorage key "${key}":`, e);
    return null;
  }
}

/**
 * Prepares the migration payload by prioritizing localStorage data and
 * only supplementing with hardcoded defaults for missing items.
 */
export function prepareMigrationPayload() {
  // 1. Categories
  const localCats = readLocalStorageArray(STORAGE_KEYS.categories) || [];
  const catMap = new Map();
  // Priority to localStorage
  localCats.forEach((c) => {
    if (c && c.id) catMap.set(c.id, { id: c.id, name: c.name, icon: c.icon || '🍽️' });
  });
  // Fallback defaults for any not yet present
  defaultCategories.forEach((c) => {
    if (!catMap.has(c.id)) {
      catMap.set(c.id, { id: c.id, name: c.name, icon: c.icon || '🍽️' });
    }
  });
  const categories = Array.from(catMap.values());

  // 2. Menu Items
  const localMenu = readLocalStorageArray(STORAGE_KEYS.menu) || [];
  const menuMap = new Map();
  localMenu.forEach((item) => {
    if (item && item.id) {
      menuMap.set(item.id, {
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: item.category,
        image: item.image || '',
        price: Number(item.price) || 0,
        sizes: item.sizes || null,
        available: item.available !== false,
        featured: Boolean(item.featured),
      });
    }
  });
  defaultMenuItems.forEach((item) => {
    if (!menuMap.has(item.id)) {
      menuMap.set(item.id, {
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: item.category,
        image: item.image || '',
        price: Number(item.price) || 0,
        sizes: item.sizes || null,
        available: item.available !== false,
        featured: Boolean(item.featured),
      });
    }
  });
  const menuItems = Array.from(menuMap.values());

  // 3. Gallery Items (map hidden -> visible)
  const localGallery = readLocalStorageArray(STORAGE_KEYS.gallery) || [];
  const galleryMap = new Map();
  localGallery.forEach((g) => {
    if (g && g.id) {
      galleryMap.set(g.id, {
        id: g.id,
        title: g.title || 'Untitled Dish',
        category: g.category || 'Pizza',
        image: g.image,
        description: g.description || '',
        visible: g.hidden !== undefined ? !g.hidden : (g.visible !== undefined ? Boolean(g.visible) : true),
        created_at: g.createdAt ? new Date(g.createdAt).toISOString() : new Date().toISOString(),
      });
    }
  });
  defaultGalleryItems.forEach((g) => {
    if (!galleryMap.has(g.id)) {
      galleryMap.set(g.id, {
        id: g.id,
        title: g.title || 'Untitled Dish',
        category: g.category || 'Pizza',
        image: g.image,
        description: g.description || '',
        visible: !g.hidden,
        created_at: g.createdAt ? new Date(g.createdAt).toISOString() : new Date().toISOString(),
      });
    }
  });
  const galleryItems = Array.from(galleryMap.values());

  // 4. Restaurant Settings
  const localSettings = readLocalStorageObject(STORAGE_KEYS.settings) || {};
  const defaultSettings = restaurantSettingsService.getDefaults();
  const mergedSettings = { ...defaultSettings, ...localSettings };

  const settingsRow = {
    id: 1,
    name: mergedSettings.name,
    name_tamil: mergedSettings.nameTamil,
    tagline: mergedSettings.tagline,
    description: mergedSettings.description || '',
    phone: mergedSettings.phone,
    phone_display: mergedSettings.phoneDisplay || mergedSettings.phone,
    phone_tel: mergedSettings.phoneTel,
    whatsapp_number: mergedSettings.whatsappNumber,
    whatsapp_url: mergedSettings.whatsappUrl,
    facebook_url: mergedSettings.facebookUrl,
    instagram_url: mergedSettings.instagramUrl,
    youtube_url: mergedSettings.youtubeUrl,
    google_maps_url: mergedSettings.googleMapsUrl,
    website: mergedSettings.website,
    address: mergedSettings.address || 'Eravanchery, Manavalanallur, Tamil Nadu 609501',
    address_tamil: mergedSettings.addressTamil,
    opening_hours: mergedSettings.openingHours,
    opening_time: mergedSettings.openingTime,
    closing_time: mergedSettings.closingTime,
    days_open: mergedSettings.daysOpen,
    is_halal: Boolean(mergedSettings.isHalal),
    home_delivery: Boolean(mergedSettings.homeDelivery),
    logo: mergedSettings.logo || '/logo.png',
    currency: mergedSettings.currency || '₹',
    is_open: Boolean(mergedSettings.isOpen),
    updated_at: new Date().toISOString(),
  };

  return {
    categories,
    menuItems,
    galleryItems,
    settingsRow,
    sources: {
      categoriesFromLocal: localCats.length,
      menuFromLocal: localMenu.length,
      galleryFromLocal: localGallery.length,
      settingsFromLocal: Object.keys(localSettings).length > 0,
    },
  };
}

/**
 * Check Supabase public connection.
 */
export async function checkSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: 'Supabase URL or Publishable key not configured in .env',
      code: 'CONFIG_MISSING',
    };
  }

  try {
    const { error } = await supabase.from('categories').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        message: error.message,
        code: error.code,
        hint: error.hint || 'Run supabase_setup.sql in Supabase SQL editor to grant permissions.',
      };
    }
    return { connected: true, message: 'Connected to Supabase successfully' };
  } catch (err) {
    return {
      connected: false,
      message: err.message || 'Connection failed',
      code: 'NETWORK_ERROR',
    };
  }
}

/**
 * Migrates data to Supabase using upsert.
 * Non-destructive: keeps localStorage completely intact.
 */
export async function migrateAllToSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase client is not configured.',
    };
  }

  const payload = prepareMigrationPayload();
  const results = {
    categories: 0,
    menuItems: 0,
    galleryItems: 0,
    settings: false,
    errors: [],
    sources: payload.sources,
  };

  try {
    // 1. Categories first (for foreign keys)
    const { error: catError } = await supabase
      .from('categories')
      .upsert(payload.categories, { onConflict: 'id' });

    if (catError) {
      results.errors.push(`Categories: ${catError.message}`);
    } else {
      results.categories = payload.categories.length;
    }

    // 2. Menu Items
    const { error: menuError } = await supabase
      .from('menu_items')
      .upsert(payload.menuItems, { onConflict: 'id' });

    if (menuError) {
      results.errors.push(`Menu Items: ${menuError.message}`);
    } else {
      results.menuItems = payload.menuItems.length;
    }

    // 3. Gallery Items
    const { error: galError } = await supabase
      .from('gallery_items')
      .upsert(payload.galleryItems, { onConflict: 'id' });

    if (galError) {
      results.errors.push(`Gallery Items: ${galError.message}`);
    } else {
      results.galleryItems = payload.galleryItems.length;
    }

    // 4. Restaurant Settings
    const { error: setError } = await supabase
      .from('restaurant_settings')
      .upsert(payload.settingsRow, { onConflict: 'id' });

    if (setError) {
      results.errors.push(`Settings: ${setError.message}`);
    } else {
      results.settings = true;
    }

    return {
      success: results.errors.length === 0,
      results,
    };
  } catch (err) {
    console.error('Migration error:', err);
    return {
      success: false,
      error: err.message,
      results,
    };
  }
}
