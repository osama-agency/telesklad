'use client';

import { useEffect, useState, ReactNode } from 'react';
import { telegramThemeService } from '@/lib/services/theme/TelegramThemeService';

interface TelegramThemeProviderProps {
  children: ReactNode;
  enableAdaptiveTheme?: boolean;
}

export default function TelegramThemeProvider({ 
  children, 
  enableAdaptiveTheme = true 
}: TelegramThemeProviderProps) {
  const [themeApplied, setThemeApplied] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (enableAdaptiveTheme) {
      // Новая адаптивная система
      console.log('🎨 Initializing adaptive theme system...');
      
      // Подписываемся на изменения темы
      const unsubscribe = telegramThemeService.subscribe((theme) => {
        setCurrentTheme(theme);
        console.log(`🎨 Theme changed to: ${theme}`);
      });

      // Получаем текущую тему
      const initialTheme = telegramThemeService.getCurrentTheme();
      setCurrentTheme(initialTheme);
      setThemeApplied(true);

      console.log(`🎨 Adaptive theme system initialized with: ${initialTheme}`);

      return () => {
        unsubscribe();
      };
    } else {
      // Старая принудительная светлая тема (для отката)
      console.log('🌞 Using forced light theme (legacy mode)');
      
      const forceLightTheme = () => {
        const lightTheme = {
          colorScheme: 'light' as const,
          backgroundColor: '#ffffff',
          textColor: '#000000',
          hintColor: '#999999',
          linkColor: '#48C928',
          buttonColor: '#48C928',
          buttonTextColor: '#ffffff'
        };
        
        // Принудительно устанавливаем светлые CSS переменные
        document.documentElement.style.setProperty('--tg-bg-color', lightTheme.backgroundColor);
        document.documentElement.style.setProperty('--tg-text-color', lightTheme.textColor);
        document.documentElement.style.setProperty('--tg-hint-color', lightTheme.hintColor);
        document.documentElement.style.setProperty('--tg-link-color', lightTheme.linkColor);
        document.documentElement.style.setProperty('--tg-button-color', lightTheme.buttonColor);
        document.documentElement.style.setProperty('--tg-button-text-color', lightTheme.buttonTextColor);
        
        // Убираем любые темные классы и добавляем светлый
        document.body.classList.remove('tg-theme-dark');
        document.body.classList.add('tg-theme-light');
        document.documentElement.setAttribute('data-theme', 'light');
        
        // Отключаем автоматический dark mode
        document.documentElement.style.setProperty('color-scheme', 'light');
        document.body.style.colorScheme = 'light';
      };

      forceLightTheme();
      setThemeApplied(true);
      setCurrentTheme('light');

      return () => {
        document.body.classList.remove('tg-theme-light', 'tg-theme-dark');
      };
    }
  }, [enableAdaptiveTheme]);

  return (
    <div className={`webapp-container ${themeApplied ? 'tg-themed' : ''} theme-${currentTheme}`}>
      {children}
    </div>
  );
}
