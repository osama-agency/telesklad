'use client';
import { useEffect, useState } from 'react';
import { telegramSDK } from '@/lib/telegram-sdk';

interface TelegramThemeProviderProps {
  children: React.ReactNode;
}

export default function TelegramThemeProvider({ children }: TelegramThemeProviderProps) {
  const [themeApplied, setThemeApplied] = useState(false);

  useEffect(() => {
    // Применяем тему только если Telegram SDK доступен
    if (!telegramSDK.isAvailable()) {
      setThemeApplied(true); // Используем стандартную тему
      return;
    }

        try {
      const theme = telegramSDK.getTheme();
      
      // Добавляем CSS переменные БЕЗ изменения существующих стилей
      document.documentElement.style.setProperty('--tg-bg-color', theme.backgroundColor);
      document.documentElement.style.setProperty('--tg-text-color', theme.textColor);
      document.documentElement.style.setProperty('--tg-hint-color', theme.hintColor);
      document.documentElement.style.setProperty('--tg-link-color', theme.linkColor);
      document.documentElement.style.setProperty('--tg-button-color', theme.buttonColor);
      document.documentElement.style.setProperty('--tg-button-text-color', theme.buttonTextColor);
      
      // Добавляем класс для темы
      document.body.classList.add(`tg-theme-${theme.colorScheme}`);
      
      setThemeApplied(true);
      
      console.log('📱 Telegram theme applied:', theme.colorScheme);
    } catch (error) {
      console.warn('Error applying Telegram theme:', error);
      setThemeApplied(true); // Используем fallback тему
    }

    // Очистка при размонтировании
    return () => {
      if (telegramSDK.isAvailable()) {
        const theme = telegramSDK.getTheme();
        document.body.classList.remove(`tg-theme-${theme.colorScheme}`);
      }
    };
  }, []);

  return (
    <div className={`webapp-container ${themeApplied ? 'tg-themed' : ''}`}>
      {children}
    </div>
  );
} 