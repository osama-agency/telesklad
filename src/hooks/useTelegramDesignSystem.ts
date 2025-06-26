"use client";

import { useState, useEffect, useMemo } from 'react';

export interface TelegramTheme {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
  header_bg_color?: string;
}

export interface DeviceCapabilities {
  isLowEnd: boolean;
  supportsHaptic: boolean;
  safeAreaInset: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  performanceClass: 'low' | 'medium' | 'high';
}

export function useTelegramDesignSystem() {
  const [telegramTheme, setTelegramTheme] = useState<TelegramTheme>({
    bg_color: '#ffffff',
    text_color: '#000000',
    hint_color: '#999999',
    link_color: '#48C928',
    button_color: '#48C928',
    button_text_color: '#ffffff',
    secondary_bg_color: '#f0fcf0'
  });

  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    isLowEnd: false,
    supportsHaptic: false,
    safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
    performanceClass: 'high'
  });

  // Безопасное получение Telegram WebApp
  const getTelegramWebApp = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return window.Telegram?.WebApp || null;
  }, []);

  // Определение производительности устройства
  useEffect(() => {
    const detectDeviceCapabilities = () => {
      const webApp = getTelegramWebApp;
      
      // Определяем производительность по hardware concurrency и memory
      const cores = navigator.hardwareConcurrency || 1;
      const memory = (navigator as any).deviceMemory || 1;
      
      let performanceClass: 'low' | 'medium' | 'high' = 'high';
      let isLowEnd = false;
      
      if (cores <= 2 || memory <= 1) {
        performanceClass = 'low';
        isLowEnd = true;
      } else if (cores <= 4 || memory <= 4) {
        performanceClass = 'medium';
      }

      // Safe area insets - используем безопасный доступ к any типу
      const safeAreaInset = {
        top: (webApp as any)?.safeAreaInset?.top || 0,
        bottom: (webApp as any)?.safeAreaInset?.bottom || 0,
        left: (webApp as any)?.safeAreaInset?.left || 0,
        right: (webApp as any)?.safeAreaInset?.right || 0
      };

      // Haptic support
      const supportsHaptic = !!(webApp?.HapticFeedback?.impactOccurred);

      setDeviceCapabilities({
        isLowEnd,
        supportsHaptic,
        safeAreaInset,
        performanceClass
      });
    };

    detectDeviceCapabilities();
  }, [getTelegramWebApp]);

  // Безопасное получение темы с fallback
  useEffect(() => {
    const updateTheme = () => {
      const webApp = getTelegramWebApp;
      
      if ((webApp as any)?.themeParams) {
        try {
          const themeParams = (webApp as any).themeParams;
          
          // Принудительно используем светлую тему (требование проекта)
          const lightTheme: TelegramTheme = {
            bg_color: '#ffffff',
            text_color: '#000000',
            hint_color: themeParams.hint_color || '#999999',
            link_color: themeParams.link_color || '#48C928',
            button_color: themeParams.button_color || '#48C928',
            button_text_color: '#ffffff',
            secondary_bg_color: '#f0fcf0',
            header_bg_color: '#ffffff'
          };
          
          setTelegramTheme(lightTheme);
        } catch (error) {
          console.warn('Failed to read Telegram theme, using defaults:', error);
        }
      }
    };

    updateTheme();
    
    // Слушаем изменения темы (если потребуется в будущем)
    const webApp = getTelegramWebApp;
    if ((webApp as any)?.onEvent) {
      const handleThemeChange = () => updateTheme();
      (webApp as any).onEvent('themeChanged', handleThemeChange);
      
      return () => {
        if ((webApp as any)?.offEvent) {
          (webApp as any).offEvent('themeChanged', handleThemeChange);
        }
      };
    }
  }, [getTelegramWebApp]);

  // Utility function для создания debounced функций
  const debounce = useMemo(() => {
    return <T extends (...args: any[]) => void>(func: T, wait: number): T => {
      let timeout: NodeJS.Timeout;
      return ((...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
      }) as T;
    };
  }, []);

  return {
    telegramTheme,
    deviceCapabilities,
    debounce,
    isAvailable: !!getTelegramWebApp
  };
} 