"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconComponent } from '@/components/webapp/IconComponent';
import { AlgoliaModernSearch } from './AlgoliaModernSearch';
import { useFavorites } from '@/context/FavoritesContext';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';

export function Header() {
  const pathname = usePathname();
  const { favoritesCount, hasFavorites } = useFavorites();
  const { user, isAuthenticated } = useTelegramAuth();
  const { impactLight } = useTelegramHaptic();
  const [isScrolled, setIsScrolled] = useState(false);

  // Определяем активную страницу
  const isActive = (path: string) => pathname.startsWith(path);

  // Отслеживаем скролл для добавления тени
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleButtonClick = () => {
    impactLight();
  };

  // Не показываем header на странице корзины
  if (pathname.startsWith('/webapp/cart')) {
    return null;
  }

  return (
    <header className={`webapp-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="webapp-header-container">
        {/* Поисковая строка */}
        <div className="webapp-header-search">
          <AlgoliaModernSearch />
        </div>

        {/* Кнопки действий */}
        <div className="webapp-header-actions">
          {/* Избранное */}
          <Link 
            href="/webapp/favorites" 
            className={`header-action-button ${isActive('/webapp/favorites') ? 'active' : ''}`}
            onClick={handleButtonClick}
            style={{
              outline: 'none',
              border: 'none',
              boxShadow: 'none',
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent'
            } as React.CSSProperties}
          >
            <div 
              className="header-action-icon"
              style={{
                outline: 'none',
                border: 'none',
                boxShadow: 'none'
              }}
            >
              <IconComponent 
                name={hasFavorites ? "favorite" : "unfavorite"} 
                size={24} 
              />
              {favoritesCount > 0 && (
                <span className="header-action-badge">{favoritesCount}</span>
              )}
            </div>
          </Link>

          {/* Профиль */}
          <Link 
            href="/webapp/profile" 
            className={`header-action-button profile-button ${isActive('/webapp/profile') ? 'active' : ''}`}
            onClick={handleButtonClick}
            style={{
              outline: 'none',
              border: 'none',
              boxShadow: 'none',
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent'
            } as React.CSSProperties}
          >
            <div 
              className="header-action-icon"
              style={{
                outline: 'none',
                border: 'none',
                boxShadow: 'none'
              }}
            >
              {user?.photo_url ? (
                <img 
                  src={user.photo_url} 
                  alt="Профиль" 
                  className="header-profile-avatar"
                  style={{
                    outline: 'none',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                />
              ) : (
                <IconComponent name="profile" size={24} />
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
} 