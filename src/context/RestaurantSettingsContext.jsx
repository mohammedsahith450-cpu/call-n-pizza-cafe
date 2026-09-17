import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { restaurantSettingsService } from '../services/restaurantSettingsService';

const RestaurantSettingsContext = createContext();

export function RestaurantSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => restaurantSettingsService.getSettings());

  useEffect(() => {
    let isMounted = true;
    restaurantSettingsService.fetchSettings().then((remote) => {
      if (isMounted && remote) {
        setSettings(remote);
      }
    });

    const handleUpdate = (e) => {
      if (e.detail) {
        setSettings(e.detail);
      } else {
        setSettings(restaurantSettingsService.getSettings());
      }
    };

    window.addEventListener('restaurant-settings-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('restaurant-settings-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const updateSettings = useCallback((newSettings) => {
    const saved = restaurantSettingsService.saveSettings(newSettings);
    setSettings(saved);
    return saved;
  }, []);

  const resetSettings = useCallback(() => {
    const defaults = restaurantSettingsService.resetToDefault();
    setSettings(defaults);
    return defaults;
  }, []);

  return (
    <RestaurantSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </RestaurantSettingsContext.Provider>
  );
}

export function useRestaurantSettings() {
  const context = useContext(RestaurantSettingsContext);
  if (!context) {
    throw new Error('useRestaurantSettings must be used within a RestaurantSettingsProvider');
  }
  return context;
}
