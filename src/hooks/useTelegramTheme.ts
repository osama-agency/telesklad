'use client';

import { useEffect, useState, useCallback } from 'react';
import { telegramThemeService, ThemeVariant, AppThemeConfig } from '@/lib/services/theme/TelegramThemeService';

export interface UseTelegramThemeReturn {
  theme: ThemeVariant;
  themeConfig: AppThemeConfig;
  setTheme: (theme: ThemeVariant) => void;
  isTransitioning: boolean;
  isDark: boolean;
  isLight: boolean;
}

export function useTelegramTheme(): UseTelegramThemeReturn {
  const [theme, setThemeState] = useState<ThemeVariant>(() => 
    telegramThemeService.getCurrentTheme()
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  const setTheme = useCallback((newTheme: ThemeVariant) => {
    telegramThemeService.setTheme(newTheme);
  }, []);

  useEffect(() => {
    // Подписываемся на изменения темы
    const unsubscribe = telegramThemeService.subscribe((newTheme) => {
      setThemeState(newTheme);
    });

    // Проверяем состояние перехода
    const checkTransition = () => {
      setIsTransitioning(telegramThemeService.isThemeTransitioning());
    };

    const interval = setInterval(checkTransition, 100);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const themeConfig = telegramThemeService.getCurrentThemeConfig();

  return {
    theme,
    themeConfig,
    setTheme,
    isTransitioning,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
}
