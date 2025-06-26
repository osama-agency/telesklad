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
  // Все props остаются опциональными для обратной совместимости
  className?: string;
  enableDesignSystem?: boolean; // Флаг для постепенного внедрения
}

export function TelegramHeader({ 
  className = '', 
  enableDesignSystem = false 
}: TelegramHeaderProps) {
  const pathname = usePathname();
  const { favoritesCount, hasFavorites } = useFavorites();
  const { user, isAuthenticated } = useTelegramAuth();
  const { impactLight } = useTelegramHaptic();
  const { telegramTheme, deviceCapabilities, debounce } = useTelegramDesignSystem();
  
  const [isScrolled, setIsScrolled] = useState(false);

  // Определяем активную страницу (сохраняем оригинальную логику)
  const isActive = (path: string) => pathname.startsWith(path);

  // Оптимизированный scroll handler для Telegram Design Guidelines
  useEffect(() => {
    if (!enableDesignSystem) {
      // Старая логика для обратной совместимости
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 0);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }

    // Новая оптимизированная логика с Telegram Design Guidelines
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
  }, [enableDesignSystem, deviceCapabilities.isLowEnd, debounce]);

  // Haptic feedback с проверкой поддержки (сохраняем старое поведение как fallback)
  const handleButtonClick = useCallback(() => {
    if (enableDesignSystem && deviceCapabilities.supportsHaptic) {
      impactLight();
    } else {
      // Старое поведение - всегда вызывать haptic
      impactLight();
    }
  }, [enableDesignSystem, deviceCapabilities.supportsHaptic, impactLight]);

  // Стили header - используем Telegram Design Guidelines только если включено
  const headerStyles = useMemo(() => {
    if (!enableDesignSystem) {
      return {}; // Используем CSS классы для старого поведения
    }

    return {
      backgroundColor: telegramTheme.header_bg_color || telegramTheme.bg_color,
      color: telegramTheme.text_color,
      paddingTop: `${deviceCapabilities.safeAreaInset.top}px`,
      paddingLeft: `${deviceCapabilities.safeAreaInset.left}px`,
      paddingRight: `${deviceCapabilities.safeAreaInset.right}px`
    };
  }, [enableDesignSystem, telegramTheme, deviceCapabilities.safeAreaInset]);

  // Стили для активных кнопок
  const activeButtonStyles = useMemo(() => {
    if (!enableDesignSystem) {
      return {}; // CSS классы для старого поведения
    }

    return {
      color: telegramTheme.link_color,
    };
  }, [enableDesignSystem, telegramTheme]);

  // Сохраняем оригинальную логику скрытия header на странице корзины
  if (pathname.startsWith('/webapp/cart')) {
    return null;
  }

  const baseHeaderClass = `webapp-header ${isScrolled ? 'scrolled' : ''}`;
  const telegramHeaderClass = enableDesignSystem 
    ? `telegram-design-header ${deviceCapabilities.isLowEnd ? 'low-end' : ''}` 
    : '';
  const finalClassName = `${baseHeaderClass} ${telegramHeaderClass} ${className}`.trim();

  return (
    <header 
      className={finalClassName}
      style={enableDesignSystem ? headerStyles : undefined}
      role="banner"
      aria-label="Навигация приложения"
    >
      <div className="webapp-header-container">
        {/* Поисковая строка - сохраняем оригинальную структуру */}
        <div 
          className="webapp-header-search" 
          role={enableDesignSystem ? "search" : undefined}
        >
          <AlgoliaModernSearch 
            {...(enableDesignSystem && {
              'aria-label': "Поиск товаров",
              placeholder: "Поиск препаратов..."
            })}
          />
        </div>

        {/* Кнопки действий - сохраняем оригинальную структуру DOM */}
        <div 
          className="webapp-header-actions"
          {...(enableDesignSystem && {
            role: "navigation",
            'aria-label': "Основные действия"
          })}
        >
          {/* Избранное - полная совместимость с существующей логикой */}
          <Link 
            href="/webapp/favorites" 
            className={`header-action-button ${isActive('/webapp/favorites') ? 'active' : ''}`}
            onClick={handleButtonClick}
            style={
              !enableDesignSystem 
                ? {
                    // Старые inline стили для обратной совместимости
                    outline: 'none',
                    border: 'none',
                    boxShadow: 'none',
                    textDecoration: 'none',
                    WebkitTapHighlightColor: 'transparent'
                  } as React.CSSProperties
                : isActive('/webapp/favorites') 
                  ? activeButtonStyles 
                  : undefined
            }
            {...(enableDesignSystem && {
              'aria-label': `Избранное${favoritesCount > 0 ? ` (${favoritesCount} товаров)` : ''}`,
              role: "button"
            })}
          >
            <div 
              className="header-action-icon"
              style={
                !enableDesignSystem 
                  ? {
                      outline: 'none',
                      border: 'none',
                      boxShadow: 'none'
                    }
                  : undefined
              }
            >
              <IconComponent 
                name={hasFavorites ? "favorite" : "unfavorite"} 
                size={24}
                {...(enableDesignSystem && { 'aria-hidden': "true" })}
              />
              {favoritesCount > 0 && (
                <span 
                  className="header-action-badge"
                  {...(enableDesignSystem && {
                    'aria-label': `${favoritesCount} избранных товаров`
                  })}
                >
                  {favoritesCount}
                </span>
              )}
            </div>
          </Link>

          {/* Профиль - полная совместимость с существующей логикой */}
          <Link 
            href="/webapp/profile" 
            className={`header-action-button profile-button ${isActive('/webapp/profile') ? 'active' : ''}`}
            onClick={handleButtonClick}
            style={
              !enableDesignSystem 
                ? {
                    // Старые inline стили для обратной совместимости
                    outline: 'none',
                    border: 'none',
                    boxShadow: 'none',
                    textDecoration: 'none',
                    WebkitTapHighlightColor: 'transparent'
                  } as React.CSSProperties
                : isActive('/webapp/profile') 
                  ? activeButtonStyles 
                  : undefined
            }
            {...(enableDesignSystem && {
              'aria-label': user?.first_name ? `Профиль ${user.first_name}` : "Профиль",
              role: "button"
            })}
          >
            <div 
              className="header-action-icon"
              style={
                !enableDesignSystem 
                  ? {
                      outline: 'none',
                      border: 'none',
                      boxShadow: 'none'
                    }
                  : undefined
              }
            >
              {user?.photo_url ? (
                <img 
                  src={user.photo_url} 
                  alt="Профиль" 
                  className="header-profile-avatar"
                  style={
                    !enableDesignSystem 
                      ? {
                          outline: 'none',
                          border: '2px solid #fff',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }
                      : undefined
                  }
                />
              ) : (
                <IconComponent 
                  name="profile" 
                  size={24}
                  {...(enableDesignSystem && { 'aria-hidden': "true" })}
                />
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
} 