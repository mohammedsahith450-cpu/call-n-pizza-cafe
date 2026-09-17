/**
 * Restaurant Settings Service
 * Allows Admin to manage Open/Closed status, operating hours, and contact settings.
 */

import restaurantConfig from '../config/restaurantConfig.js';

const SETTINGS_STORAGE_KEY = 'call_n_pizza_settings';

class RestaurantSettingsService {
  getSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.address && (parsed.address.includes('NU Complex') || parsed.address.includes('Vishnupuram') || parsed.address.includes('Iravancheri Main'))) {
          parsed.address = 'Eravanchery, Manavalanallur, Tamil Nadu 609501';
        }
        return {
          ...this.getDefaults(),
          ...parsed,
        };
      }
    } catch (e) {
      console.warn('Could not read settings from localStorage:', e);
    }
    return this.getDefaults();
  }

  getDefaults() {
    const openingTime = restaurantConfig.openingTime || '10:00 AM';
    const closingTime = restaurantConfig.closingTime || '10:00 PM';
    const rawPhone = '9944399984';
    return {
      isOpen: true,
      openingTime,
      closingTime,
      openingHours: `${openingTime} – ${closingTime}`,
      daysOpen: restaurantConfig.daysOpen || 'Every Day',
      phone: restaurantConfig.phoneDisplay || '99443 99984',
      phoneTel: `tel:+91${rawPhone}`,
      whatsapp: rawPhone,
      whatsappNumber: `91${rawPhone}`,
      whatsappUrl: `https://wa.me/91${rawPhone}`,
      isHalal: restaurantConfig.isHalal !== false,
      homeDelivery: restaurantConfig.homeDelivery !== false,
      address: restaurantConfig.address || 'Eravanchery, Manavalanallur, Tamil Nadu 609501',
    };
  }

  saveSettings(newSettings) {
    try {
      const digitsPhone = (newSettings.phone || '99443 99984').replace(/[^0-9]/g, '');
      const rawWhatsapp = (newSettings.whatsapp || '9944399984').replace(/[^0-9]/g, '');
      const cleanWhatsapp = rawWhatsapp.startsWith('91') ? rawWhatsapp : `91${rawWhatsapp}`;

      const computed = {
        ...this.getDefaults(),
        ...newSettings,
        openingHours: `${newSettings.openingTime || '10:00 AM'} – ${newSettings.closingTime || '10:00 PM'}`,
        phoneTel: `tel:+91${digitsPhone.slice(-10)}`,
        whatsappNumber: cleanWhatsapp,
        whatsappUrl: `https://wa.me/${cleanWhatsapp}`,
      };

      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(computed));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('restaurant-settings-updated', { detail: computed })
        );
      }
      return computed;
    } catch (e) {
      console.error('Could not save restaurant settings:', e);
      return newSettings;
    }
  }

  resetToDefault() {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      const defaults = this.getDefaults();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('restaurant-settings-updated', { detail: defaults })
        );
      }
      return defaults;
    } catch (e) {
      console.error(e);
      return this.getDefaults();
    }
  }
}

export const restaurantSettingsService = new RestaurantSettingsService();
