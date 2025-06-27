import { useCallback } from 'react';

interface TelegramWebApp {
  CloudStorage: {
    getItem: (key: string) => Promise<string>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegramCache() {
  const isAvailable = useCallback(() => {
    return typeof window !== 'undefined' && 
           (window as any).Telegram?.WebApp?.CloudStorage;
  }, []);

  const getItem = useCallback(async (key: string): Promise<any> => {
    if (!isAvailable()) return null;
    
    try {
      const value = await (window as any).Telegram.WebApp.CloudStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('CloudStorage getItem error:', error);
      return null;
    }
  }, [isAvailable]);

  const setItem = useCallback(async (key: string, value: any): Promise<void> => {
    if (!isAvailable()) return;
    
    try {
      await (window as any).Telegram.WebApp.CloudStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('CloudStorage setItem error:', error);
    }
  }, [isAvailable]);

  const removeItem = useCallback(async (key: string): Promise<void> => {
    if (!isAvailable()) return;
    
    try {
      await (window as any).Telegram.WebApp.CloudStorage.removeItem(key);
    } catch (error) {
      console.warn('CloudStorage removeItem error:', error);
    }
  }, [isAvailable]);

  return {
    isAvailable: isAvailable(),
    getItem,
    setItem,
    removeItem
  };
} 