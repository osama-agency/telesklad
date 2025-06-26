"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTelegramAuth } from './TelegramAuthContext';

interface FavoritesContextType {
  favoritesCount: number;
  setFavoritesCount: (count: number) => void;
  hasFavorites: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const { user, isAuthenticated } = useTelegramAuth();
  const pathname = usePathname();

  // Загрузка количества избранных товаров
  const loadFavoritesCount = async () => {
    if (!isAuthenticated || !user?.tg_id) {
      console.log('🔄 FavoritesContext: Not authenticated, setting count to 0');
      setFavoritesCount(0);
      return;
    }

    try {
      console.log('🔄 FavoritesContext: Loading favorites count for user', user.tg_id);
      const response = await fetch(`/api/webapp/favorites?tg_id=${user.tg_id}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        const count = data.favorites?.length || 0;
        console.log('✅ FavoritesContext: Loaded favorites count:', count);
        setFavoritesCount(count);
      } else {
        console.log('❌ FavoritesContext: Failed to load favorites, setting count to 0');
        setFavoritesCount(0);
      }
    } catch (error) {
      console.error('Error loading favorites count:', error);
      setFavoritesCount(0);
    }
  };

  // Загружаем количество при изменении аутентификации или перехода на страницу избранного
  useEffect(() => {
    // Не загружаем количество на странице избранного - страница сама загрузит и обновит контекст
    if (pathname === '/webapp/favorites') {
      console.log('🔄 FavoritesContext: Skipping load on favorites page');
      return;
    }
    
    loadFavoritesCount();
  }, [isAuthenticated, user?.tg_id, pathname]);

  // Слушаем события добавления/удаления из избранного
  useEffect(() => {
    const handleFavoriteAdded = () => {
      console.log('🔄 FavoritesContext: favoriteAdded event received');
      loadFavoritesCount();
    };

    const handleFavoriteRemoved = () => {
      console.log('🔄 FavoritesContext: favoriteRemoved event received');
      loadFavoritesCount();
    };

    const handleFavoritesSync = () => {
      console.log('🔄 FavoritesContext: favoritesSync event received');
      loadFavoritesCount();
    };

    window.addEventListener('favoriteAdded', handleFavoriteAdded);
    window.addEventListener('favoriteRemoved', handleFavoriteRemoved);
    window.addEventListener('favoritesSync', handleFavoritesSync);

    return () => {
      window.removeEventListener('favoriteAdded', handleFavoriteAdded);
      window.removeEventListener('favoriteRemoved', handleFavoriteRemoved);
      window.removeEventListener('favoritesSync', handleFavoritesSync);
    };
  }, [isAuthenticated, user?.tg_id]);

  const value = {
    favoritesCount,
    setFavoritesCount,
    hasFavorites: favoritesCount > 0
  };

  console.log('🔄 FavoritesProvider render:', { 
    favoritesCount, 
    hasFavorites: favoritesCount > 0,
    pathname,
    isAuthenticated 
  });

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
} 