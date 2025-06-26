"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconComponent } from '@/components/webapp/IconComponent';
import { AlgoliaModernSearch } from './AlgoliaModernSearch';
import { useFavorites } from '@/context/FavoritesContext';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';

interface TelegramTheme {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
}

interface DeviceCapabilities {
  isLowEnd: boolean;
  supportsHaptic: boolean;
  safeAreaInset: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export function TelegramDesignHeader() {
  const pathname = usePathname();
  const { favoritesCount, hasFavorites } = useFavorites();
  const { user, isAuthenticated } = useTelegramAuth();
  const { impactLight } = useTelegramHaptic();
  
  // State для темы и устройства
  const [isScrolled, setIsScrolled] = useState(false);
  const [telegramTheme, setTelegramTheme] = useState<TelegramTheme>({});
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    isLowEnd: false,
    supportsHaptic: true,
    safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  // Мемоизация активной страницы
  const isActive = useCallback((path: string) => pathname.startsWith(path), [pathname]);

  // Получение Telegram theme params согласно Guidelines
  useEffect(() => {
    const getTelegramTheme = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Получаем theme params из Telegram
        const themeParams = tg.themeParams || {};
        setTelegramTheme(themeParams);

        // Получаем safe area insets для fullscreen support
        if (tg.safeAreaInset) {
          setDeviceCapabilities(prev => ({
            ...prev,
            safeAreaInset: tg.safeAreaInset
          }));
        }

        // Проверяем производительность устройства (Android optimization)
        const userAgent = navigator.userAgent.toLowerCase();
        const isAndroid = userAgent.includes('android');
        if (isAndroid) {
          // Определяем low-end устройство по User-Agent
          const isLowEnd = userAgent.includes('android 8') || 
                          userAgent.includes('android 9') ||
                          userAgent.includes('sm-a') ||
                          userAgent.includes('sm-j');
          
          setDeviceCapabilities(prev => ({
            ...prev,
            isLowEnd
          }));
        }

        // Проверяем поддержку haptic feedback
        setDeviceCapabilities(prev => ({
          ...prev,
          supportsHaptic: !!tg.HapticFeedback
        }));
      }
    };

    getTelegramTheme();

    // Подписываемся на изменения темы в реальном времени
    const handleThemeChange = () => getTelegramTheme();
    window.addEventListener('themeChanged', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  // Оптимизированный scroll handler с requestAnimationFrame для 60fps
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Для low-end устройств используем debounced version
    const optimizedHandler = deviceCapabilities.isLowEnd 
      ? debounce(handleScroll, 16) // ~60fps
      : handleScroll;

    window.addEventListener('scroll', optimizedHandler, { passive: true });
    return () => window.removeEventListener('scroll', optimizedHandler);
  }, [deviceCapabilities.isLowEnd]);

  // Haptic feedback с проверкой поддержки
  const handleButtonClick = useCallback(() => {
    if (deviceCapabilities.supportsHaptic) {
      impactLight();
    }
  }, [deviceCapabilities.supportsHaptic, impactLight]);

  // Динамические стили на основе Telegram theme
  const headerStyles = useMemo(() => ({
    backgroundColor: telegramTheme.header_bg_color || telegramTheme.bg_color || '#ffffff',
    color: telegramTheme.text_color || '#000000',
    paddingTop: `${deviceCapabilities.safeAreaInset.top}px`,
    paddingLeft: `${deviceCapabilities.safeAreaInset.left}px`,
    paddingRight: `${deviceCapabilities.safeAreaInset.right}px`
  }), [telegramTheme, deviceCapabilities.safeAreaInset]);

  // Стили для кнопок активного состояния
  const activeButtonStyles = useMemo(() => ({
    color: telegramTheme.link_color || '#48C928',
    backgroundColor: telegramTheme.secondary_bg_color || '#f0fcf0'
  }), [telegramTheme]);

  // Не показываем header на страницах корзины и избранного
  if (pathname.startsWith('/webapp/cart') || pathname.startsWith('/webapp/favorites')) {
    return null;
  }

  return (
    <header 
      className={`telegram-design-header ${isScrolled ? 'scrolled' : ''} ${deviceCapabilities.isLowEnd ? 'low-end' : ''}`}
      style={headerStyles}
      role="banner"
      aria-label="Навигация приложения"
    >
      <div className="header-container">
        {/* Поисковая строка с accessibility */}
        <div className="header-search" role="search">
          <AlgoliaModernSearch 
            aria-label="Поиск товаров"
            placeholder="Поиск препаратов..."
          />
        </div>

        {/* Кнопки действий */}
        <nav className="header-actions" role="navigation" aria-label="Основные действия">
          {/* Избранное с accessibility */}
          <Link 
            href="/webapp/favorites" 
            className={`header-action-button ${isActive('/webapp/favorites') ? 'active' : ''}`}
            onClick={handleButtonClick}
            style={isActive('/webapp/favorites') ? activeButtonStyles : undefined}
            aria-label={`Избранное${favoritesCount > 0 ? ` (${favoritesCount} товаров)` : ''}`}
            role="button"
          >
            <div className="header-action-icon">
              <IconComponent 
                name={hasFavorites ? "favorite" : "unfavorite"} 
                size={24}
                aria-hidden="true"
              />
              {favoritesCount > 0 && (
                <span 
                  className="header-action-badge"
                  aria-label={`${favoritesCount} избранных товаров`}
                >
                  {favoritesCount}
                </span>
              )}
            </div>
          </Link>

          {/* Профиль с accessibility */}
          <Link 
            href="/webapp/profile" 
            className={`header-action-button profile-button ${isActive('/webapp/profile') ? 'active' : ''}`}
            onClick={handleButtonClick}
            style={isActive('/webapp/profile') ? activeButtonStyles : undefined}
            aria-label={user?.first_name ? `Профиль - ${user.first_name}` : 'Профиль пользователя'}
            role="button"
          >
            <div className="header-action-icon">
              {user?.photo_url ? (
                <img 
                  src={user.photo_url} 
                  alt={`Аватар ${user.first_name || 'пользователя'}`}
                  className="header-profile-avatar"
                  loading="lazy"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              ) : (
                <IconComponent 
                  name="profile" 
                  size={24}
                  aria-hidden="true"
                />
              )}
            </div>
          </Link>
        </nav>
      </div>
    </header>
  );
}

// Utility функция для debounce (для low-end устройств)
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
} 