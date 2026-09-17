/**
 * Restaurant Settings Service
 * Allows Admin to manage Open/Closed status, operating hours, and contact settings.
 * Persists to Supabase database (restaurant_settings with id = 1) with local storage cache fallback.
 */

import restaurantConfig from '../config/restaurantConfig.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const SETTINGS_STORAGE_KEY = 'call_n_pizza_settings';
const SETTINGS_ROW_ID = 1;

class RestaurantSettingsService {
  getSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          parsed.address &&
          (parsed.address.includes('NU Complex') ||
            parsed.address.includes('Vishnupuram') ||
            parsed.address.includes('Iravancheri Main'))
        ) {
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
    const rawPhone = '9944399984';
    return {
      name: restaurantConfig.name || 'Call N Pizza Cafe',
      nameTamil: restaurantConfig.nameTamil || 'கால் என் பீட்சா கஃபே',
      tagline: restaurantConfig.tagline || 'Delicious Pizza, Burgers & More',
      description: restaurantConfig.description || '',
      phone: restaurantConfig.phone || rawPhone,
      phoneDisplay: restaurantConfig.phoneDisplay || '99443 99984',
      phoneTel: restaurantConfig.phoneTel || `tel:+91${rawPhone}`,
      whatsapp: rawPhone,
      whatsappNumber: restaurantConfig.whatsappNumber || `91${rawPhone}`,
      whatsappUrl: restaurantConfig.whatsappUrl || `https://wa.me/91${rawPhone}`,
      facebookUrl: restaurantConfig.facebookUrl || 'https://www.facebook.com/share/1EtbTovVuG/',
      instagramUrl: restaurantConfig.instagramUrl || 'https://www.instagram.com/call_n_plzza_cafe?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==',
      youtubeUrl: restaurantConfig.youtubeUrl || 'https://youtube.com/@callnpizzacafe?si=IOiLp_V5zweGuSmY',
      googleMapsUrl: restaurantConfig.googleMapsUrl || 'https://maps.google.com/?q=Eravanchery,+Manavalanallur,+Tamil+Nadu+609501',
      website: restaurantConfig.website || 'www.callnpizzacafe.com',
      address: restaurantConfig.address || 'Eravanchery, Manavalanallur, Tamil Nadu 609501',
      addressTamil: restaurantConfig.addressTamil || 'எரவாஞ்சேரி, மணவாளநல்லூர், தமிழ்நாடு 609501',
      openingHours: restaurantConfig.openingHours || '10:00 AM – 10:00 PM',
      openingTime: restaurantConfig.openingTime || '10:00 AM',
      closingTime: restaurantConfig.closingTime || '10:00 PM',
      daysOpen: restaurantConfig.daysOpen || 'Every Day',
      isHalal: restaurantConfig.isHalal !== false,
      homeDelivery: restaurantConfig.homeDelivery !== false,
      logo: restaurantConfig.logo || '/logo.png',
      currency: restaurantConfig.currency || '₹',
      isOpen: true,
    };
  }

  async fetchSettings() {
    if (!isSupabaseConfigured || !supabase) {
      return this.getSettings();
    }

    try {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('id', SETTINGS_ROW_ID)
        .maybeSingle();

      if (error) {
        console.warn('[Supabase] fetchSettings error, using local data:', error.message);
        return this.getSettings();
      }

      if (data) {
        const row = data;
        const defaults = this.getDefaults();
        const computed = {
          ...defaults,
          name: row.name || defaults.name,
          nameTamil: row.name_tamil || defaults.nameTamil,
          tagline: row.tagline || defaults.tagline,
          description: row.description !== null ? row.description : defaults.description,
          phone: row.phone || defaults.phone,
          phoneDisplay: row.phone_display || row.phone || defaults.phoneDisplay,
          phoneTel: row.phone_tel || defaults.phoneTel,
          whatsapp: (row.whatsapp_number ? row.whatsapp_number.replace(/^91/, '') : defaults.whatsapp),
          whatsappNumber: row.whatsapp_number || defaults.whatsappNumber,
          whatsappUrl: row.whatsapp_url || defaults.whatsappUrl,
          facebookUrl: row.facebook_url || defaults.facebookUrl,
          instagramUrl: row.instagram_url || defaults.instagramUrl,
          youtubeUrl: row.youtube_url || defaults.youtubeUrl,
          googleMapsUrl: row.google_maps_url || defaults.googleMapsUrl,
          website: row.website || defaults.website,
          address: row.address || defaults.address,
          addressTamil: row.address_tamil || defaults.addressTamil,
          openingHours: row.opening_hours || `${row.opening_time || '10:00 AM'} – ${row.closing_time || '10:00 PM'}`,
          openingTime: row.opening_time || defaults.openingTime,
          closingTime: row.closing_time || defaults.closingTime,
          daysOpen: row.days_open || defaults.daysOpen,
          isHalal: row.is_halal !== false,
          homeDelivery: row.home_delivery !== false,
          logo: row.logo || defaults.logo,
          currency: row.currency || defaults.currency,
          isOpen: row.is_open !== false,
        };

        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(computed));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('restaurant-settings-updated', { detail: computed })
          );
        }
        return computed;
      }
    } catch (err) {
      console.warn('[Supabase] Exception fetching settings:', err);
    }

    return this.getSettings();
  }

  saveSettings(newSettings) {
    try {
      const digitsPhone = (newSettings.phone || '99443 99984').replace(/[^0-9]/g, '');
      const rawWhatsapp = (newSettings.whatsapp || '9944399984').replace(/[^0-9]/g, '');
      const cleanWhatsapp = rawWhatsapp.startsWith('91') ? rawWhatsapp : `91${rawWhatsapp}`;

      const computed = {
        ...this.getDefaults(),
        ...newSettings,
        phoneDisplay: newSettings.phoneDisplay || newSettings.phone || '99443 99984',
        openingHours: `${newSettings.openingTime || '10:00 AM'} – ${newSettings.closingTime || '10:00 PM'}`,
        phoneTel: `tel:+91${digitsPhone.slice(-10)}`,
        whatsapp: rawWhatsapp.replace(/^91/, ''),
        whatsappNumber: cleanWhatsapp,
        whatsappUrl: `https://wa.me/${cleanWhatsapp}`,
        address: newSettings.address || 'Eravanchery, Manavalanallur, Tamil Nadu 609501',
      };

      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(computed));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('restaurant-settings-updated', { detail: computed })
        );
      }

      // Persist to Supabase asynchronously if client is available
      if (isSupabaseConfigured && supabase) {
        supabase.from('restaurant_settings').upsert({
          id: SETTINGS_ROW_ID,
          name: computed.name,
          name_tamil: computed.nameTamil,
          tagline: computed.tagline,
          description: computed.description,
          phone: computed.phone,
          phone_display: computed.phoneDisplay,
          phone_tel: computed.phoneTel,
          whatsapp_number: computed.whatsappNumber,
          whatsapp_url: computed.whatsappUrl,
          facebook_url: computed.facebookUrl,
          instagram_url: computed.instagramUrl,
          youtube_url: computed.youtubeUrl,
          google_maps_url: computed.googleMapsUrl,
          website: computed.website,
          address: computed.address,
          address_tamil: computed.addressTamil,
          opening_hours: computed.openingHours,
          opening_time: computed.openingTime,
          closing_time: computed.closingTime,
          days_open: computed.daysOpen,
          is_halal: Boolean(computed.isHalal),
          home_delivery: Boolean(computed.homeDelivery),
          logo: computed.logo,
          currency: computed.currency,
          is_open: Boolean(computed.isOpen),
          updated_at: new Date().toISOString(),
        }).then(({ error }) => {
          if (error) console.warn('[Supabase] Could not persist settings to Supabase:', error.message);
        }).catch((err) => console.warn('[Supabase] Exception saving settings:', err));
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

      if (isSupabaseConfigured && supabase) {
        supabase.from('restaurant_settings').upsert({
          id: SETTINGS_ROW_ID,
          name: defaults.name,
          name_tamil: defaults.nameTamil,
          tagline: defaults.tagline,
          description: defaults.description,
          phone: defaults.phone,
          phone_display: defaults.phoneDisplay,
          phone_tel: defaults.phoneTel,
          whatsapp_number: defaults.whatsappNumber,
          whatsapp_url: defaults.whatsappUrl,
          facebook_url: defaults.facebookUrl,
          instagram_url: defaults.instagramUrl,
          youtube_url: defaults.youtubeUrl,
          google_maps_url: defaults.googleMapsUrl,
          website: defaults.website,
          address: defaults.address,
          address_tamil: defaults.addressTamil,
          opening_hours: defaults.openingHours,
          opening_time: defaults.openingTime,
          closing_time: defaults.closingTime,
          days_open: defaults.daysOpen,
          is_halal: defaults.isHalal,
          home_delivery: defaults.homeDelivery,
          logo: defaults.logo,
          currency: defaults.currency,
          is_open: defaults.isOpen,
          updated_at: new Date().toISOString(),
        }).catch(() => {});
      }

      return defaults;
    } catch (e) {
      console.error(e);
      return this.getDefaults();
    }
  }
}

export const restaurantSettingsService = new RestaurantSettingsService();
