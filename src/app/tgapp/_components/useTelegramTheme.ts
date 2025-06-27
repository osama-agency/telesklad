import { useEffect, useState } from 'react';

export function useTelegramTheme() {
  const [isDark, setIsDark] = useState(false);
  const [themeParams, setThemeParams] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    // Получаем параметры темы
    const params = tg.themeParams || {};
    setThemeParams(params);

    // Определяем темную тему по цвету фона
    const bgColor = params.bg_color || params.secondary_bg_color;
    const isDarkTheme = bgColor && isColorDark(bgColor);
    setIsDark(isDarkTheme);

    // Применяем CSS переменные для темы
    applyThemeVariables(params, isDarkTheme);

    console.log('🎨 Telegram Theme:', {
      isDark: isDarkTheme,
      themeParams: params
    });

  }, []);

  return { isDark, themeParams };
}

function isColorDark(color: string): boolean {
  // Убираем # если есть
  const hex = color.replace('#', '');
  
  // Конвертируем в RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Вычисляем яркость
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness < 128;
}

function applyThemeVariables(params: any, isDark: boolean) {
  const root = document.documentElement;
  
  if (isDark) {
    // Темная тема
    root.style.setProperty('--tg-bg-color', params.bg_color || '#1c1c1e');
    root.style.setProperty('--tg-secondary-bg-color', params.secondary_bg_color || '#2c2c2e');
    root.style.setProperty('--tg-text-color', params.text_color || '#ffffff');
    root.style.setProperty('--tg-hint-color', params.hint_color || '#8e8e93');
    root.style.setProperty('--tg-link-color', params.link_color || '#007aff');
    root.style.setProperty('--tg-button-color', params.button_color || '#007aff');
    root.style.setProperty('--tg-button-text-color', params.button_text_color || '#ffffff');
    
    // Добавляем класс для темной темы
    document.body.classList.add('tg-dark-theme');
    document.body.classList.remove('tg-light-theme');
  } else {
    // Светлая тема
    root.style.setProperty('--tg-bg-color', params.bg_color || '#ffffff');
    root.style.setProperty('--tg-secondary-bg-color', params.secondary_bg_color || '#f1f5f9');
    root.style.setProperty('--tg-text-color', params.text_color || '#000000');
    root.style.setProperty('--tg-hint-color', params.hint_color || '#8e8e93');
    root.style.setProperty('--tg-link-color', params.link_color || '#007aff');
    root.style.setProperty('--tg-button-color', params.button_color || '#22c55e');
    root.style.setProperty('--tg-button-text-color', params.button_text_color || '#ffffff');
    
    // Добавляем класс для светлой темы
    document.body.classList.add('tg-light-theme');
    document.body.classList.remove('tg-dark-theme');
  }
} 