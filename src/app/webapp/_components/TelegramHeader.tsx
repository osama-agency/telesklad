"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconComponent } from '@/components/webapp/IconComponent';
import { AlgoliaModernSearch } from './AlgoliaModernSearch';
import { useFavorites } from '@/context/FavoritesContext';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';
import { useTelegramDesignSystem } from '@/hooks/useTelegramDesignSystem';

interface TelegramHeaderProps {
  className?: string;
}

// Конфигурация страниц где показывать header
const CATALOG_PAGES = [
  '/webapp',              // Главная страница каталога
  '/webapp/search'        // Страница поиска
];

export function TelegramHeader({ className = '' }: TelegramHeaderProps) {
  const pathname = usePathname();
  const { favoritesCount, hasFavorites } = useFavorites();
  const { user, isAuthenticated } = useTelegramAuth();
  const { impactLight } = useTelegramHaptic();
  const { telegramTheme, deviceCapabilities, debounce } = useTelegramDesignSystem();
  
  const [isScrolled, setIsScrolled] = useState(false);

  // Определяем активную страницу
  const isActive = (path: string) => pathname.startsWith(path);

  // Оптимизированный scroll handler
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
  }, [deviceCapabilities.isLowEnd, debounce]);

  // Haptic feedback с проверкой поддержки
  const handleButtonClick = useCallback(() => {
    if (deviceCapabilities.supportsHaptic) {
      impactLight();
    }
  }, [deviceCapabilities.supportsHaptic, impactLight]);

  // Стили header на основе Telegram theme
  const headerStyles = useMemo(() => ({
    backgroundColor: telegramTheme.header_bg_color || '#F9F9F9', // Используем #F9F9F9 вместо белого
    color: telegramTheme.text_color,
    paddingTop: `${deviceCapabilities.safeAreaInset.top}px`,
    paddingLeft: `${deviceCapabilities.safeAreaInset.left}px`,
    paddingRight: `${deviceCapabilities.safeAreaInset.right}px`
  }), [telegramTheme, deviceCapabilities.safeAreaInset]);

  // Стили для активных кнопок
  const activeButtonStyles = useMemo(() => ({
    color: telegramTheme.link_color,
  }), [telegramTheme]);

  // Проверяем, нужно ли показывать header
  const shouldShowHeader = CATALOG_PAGES.some(page => 
    page.endsWith('/') ? pathname.startsWith(page) : pathname === page
  );
  
  if (!shouldShowHeader) {
    return null;
  }

  const finalClassName = `webapp-header telegram-design-header ${isScrolled ? 'scrolled' : ''} ${deviceCapabilities.isLowEnd ? 'low-end' : ''} ${className}`.trim();

  return (
    <header 
      className={finalClassName}
      style={headerStyles}
      role="banner"
      aria-label="Навигация приложения"
    >
      <div className="webapp-header-container">
        {/* Поисковая строка */}
        <div className="webapp-header-search" role="search">
          <AlgoliaModernSearch />
        </div>

        {/* Кнопки действий */}
        <div 
          className="webapp-header-actions"
          role="navigation"
          aria-label="Основные действия"
        >
          {/* Избранное */}
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

          {/* Профиль */}
          <Link 
            href="/webapp/profile" 
            className={`header-action-button profile-button ${isActive('/webapp/profile') ? 'active' : ''}`}
            onClick={handleButtonClick}
            style={isActive('/webapp/profile') ? activeButtonStyles : undefined}
            aria-label={user?.first_name ? `Профиль ${user.first_name}` : "Профиль"}
            role="button"
          >
            <div className="header-action-icon">
              {user?.photo_url ? (
                <img 
                  src={user.photo_url} 
                  alt="Профиль" 
                  className="header-profile-avatar"
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
        </div>
      </div>
    </header>
  );
} 