/**
 * Служба управления темами Telegram WebApp
 * Обеспечивает плавный переход между светлой и темной темами
 */

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ThemeVariant = 'light' | 'dark';

export interface TelegramThemeColors {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
  header_bg_color?: string;
}

export interface AppThemeConfig {
  variant: ThemeVariant;
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
    emptyIcon: string;
    emptyText: string;
  };
}

class TelegramThemeService {
  private static instance: TelegramThemeService;
  private currentTheme: ThemeVariant = 'light';
  private themeMode: ThemeMode = 'auto';
  private listeners: Set<(theme: ThemeVariant) => void> = new Set();
  private isTransitioning = false;

  // Конфигурация тем
  private readonly themeConfigs: Record<ThemeVariant, AppThemeConfig> = {
    light: {
      variant: 'light',
      colors: {
        primary: '#48C928',
        primaryDark: '#3AA120',
        secondary: '#92e200',
        accent: '#d7f369',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#000000',
        textSecondary: '#666666',
        border: '#e0e0e0',
        shadow: 'rgba(0, 0, 0, 0.1)',
        emptyIcon: '#D1D5DB',
        emptyText: '#6B7280'
      }
    },
    dark: {
      variant: 'dark',
      colors: {
        primary: '#2d7a1e',
        primaryDark: '#1f5415',
        secondary: '#5c8f00',
        accent: '#8fb347',
        background: '#1a1a1a',
        surface: '#2d2d2d',
        text: '#ffffff',
        textSecondary: '#b0b0b0',
        border: '#3d3d3d',
        shadow: 'rgba(0, 0, 0, 0.5)',
        emptyIcon: '#4B5563',
        emptyText: '#9CA3AF'
      }
    }
  };

  static getInstance(): TelegramThemeService {
    if (!TelegramThemeService.instance) {
      TelegramThemeService.instance = new TelegramThemeService();
    }
    return TelegramThemeService.instance;
  }

  private constructor() {
    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined') return;

    // Определяем начальную тему
    this.detectAndApplyTheme();

    // Подписываемся на изменения темы Telegram
    this.subscribeToTelegramThemeChanges();
  }

  private detectTheme(): ThemeVariant {
    // 1. Приоритет: Telegram WebApp тема
    if (this.isTelegramAvailable()) {
      const telegramTheme = this.getTelegramTheme();
      if (telegramTheme) {
        return this.analyzeTelegramTheme(telegramTheme);
      }
    }

    // 2. Fallback: Светлая тема
    return 'light';
  }

  private isTelegramAvailable(): boolean {
    return typeof window !== 'undefined' && 
           window.Telegram?.WebApp !== undefined;
  }

  private getTelegramTheme(): TelegramThemeColors | null {
    if (!this.isTelegramAvailable()) return null;

    try {
      const tg = window.Telegram.WebApp;
      return tg.themeParams as TelegramThemeColors || null;
    } catch (error) {
      console.warn('Failed to get Telegram theme:', error);
      return null;
    }
  }

  private analyzeTelegramTheme(themeColors: TelegramThemeColors): ThemeVariant {
    const bgColor = themeColors.bg_color || '#ffffff';
    const brightness = this.getBrightness(bgColor);
    return brightness < 128 ? 'dark' : 'light';
  }

  private getBrightness(hexColor: string): number {
    const color = hexColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  private detectAndApplyTheme() {
    const newTheme = this.detectTheme();
    if (newTheme !== this.currentTheme) {
      this.applyTheme(newTheme);
    }
  }

  private applyTheme(theme: ThemeVariant) {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    this.currentTheme = theme;

    // Применяем CSS переменные
    this.applyCSSVariables(theme);

    // Устанавливаем data-theme атрибут
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    // Уведомляем подписчиков
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        console.error('Theme listener error:', error);
      }
    });

    setTimeout(() => {
      this.isTransitioning = false;
    }, 300);

    console.log(`🎨 Theme applied: ${theme}`);
  }

  private applyCSSVariables(theme: ThemeVariant) {
    const config = this.themeConfigs[theme];
    const root = document.documentElement;

    Object.entries(config.colors).forEach(([key, value]) => {
      const cssVar = `--tg-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    root.style.setProperty('--tg-theme-variant', theme);
    root.style.setProperty('--tg-is-dark', theme === 'dark' ? '1' : '0');
  }

  private subscribeToTelegramThemeChanges() {
    if (!this.isTelegramAvailable()) return;

    try {
      window.addEventListener('themeChanged', () => {
        this.detectAndApplyTheme();
      });
    } catch (error) {
      console.warn('Failed to subscribe to Telegram theme changes:', error);
    }
  }

  // Публичное API
  getCurrentTheme(): ThemeVariant {
    return this.currentTheme;
  }

  setTheme(theme: ThemeVariant) {
    this.applyTheme(theme);
  }

  getCurrentThemeConfig(): AppThemeConfig {
    return this.themeConfigs[this.currentTheme];
  }

  subscribe(listener: (theme: ThemeVariant) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  isThemeTransitioning(): boolean {
    return this.isTransitioning;
  }
}

export const telegramThemeService = TelegramThemeService.getInstance();
export default telegramThemeService;
