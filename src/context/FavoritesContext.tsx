"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useTelegramAuth } from './TelegramAuthContext';

interface FavoritesContextType {
  favoritesCount: number;
  setFavoritesCount: (count: number) => void;
  hasFavorites: boolean;
  favoriteIds: number[];
  toggleFavorite: (productId: number) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const pathname = usePathname();

  const FAVORITES_KEY = "tgapp_favorites";

  // Загрузка избранных товаров
  const loadFavorites = useCallback(async () => {
    // Ждем завершения загрузки аутентификации
    if (authLoading) {
      console.log('🔄 FavoritesContext: Auth still loading, waiting...');
      return;
    }

    if (!isAuthenticated || !user?.tg_id) {
      console.log('🔄 FavoritesContext: Not authenticated, setting count to 0', {
        isAuthenticated,
        hasUser: !!user,
        tgId: user?.tg_id,
        userStarted: user?.started,
        userBlocked: user?.is_blocked,
        authLoading
      });
      setFavoritesCount(0);
      setFavoriteIds([]);
      // Очищаем localStorage при выходе
      localStorage.removeItem(FAVORITES_KEY);
      return;
    }

    try {
      console.log('🔄 FavoritesContext: Loading favorites for user', user.tg_id);
      const response = await fetch(`/api/webapp/favorites?tg_id=${user.tg_id}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        const ids = data.favorites?.map((fav: any) => fav.product_id) || [];
        console.log('✅ FavoritesContext: Loaded favorites:', ids.length);
        setFavoriteIds(ids);
        setFavoritesCount(ids.length);
        
        // Синхронизируем с localStorage
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
      } else {
        console.log('❌ FavoritesContext: Failed to load favorites');
        setFavoriteIds([]);
        setFavoritesCount(0);
        localStorage.removeItem(FAVORITES_KEY);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      // При ошибке сети пытаемся загрузить из localStorage
      const localFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      setFavoriteIds(localFavorites);
      setFavoritesCount(localFavorites.length);
    }
  }, [isAuthenticated, user?.tg_id, authLoading]);

  // Функция переключения избранного
  const toggleFavorite = useCallback(async (productId: number) => {
    const tgId = user?.tg_id;
    if (!tgId) {
      throw new Error("No Telegram user ID found");
    }

    const isFavorite = favoriteIds.includes(productId);
    
    // Оптимистичное обновление UI
    let newFavoriteIds: number[];
    if (isFavorite) {
      newFavoriteIds = favoriteIds.filter(id => id !== productId);
    } else {
      newFavoriteIds = [...favoriteIds, productId];
    }
    
    // Мгновенно обновляем состояние
    setFavoriteIds(newFavoriteIds);
    setFavoritesCount(newFavoriteIds.length);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavoriteIds));

    try {
      if (isFavorite) {
        // Удаляем из избранного
        const response = await fetch(`/api/webapp/favorites?tg_id=${tgId}&product_id=${productId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove from favorites');
        }
      } else {
        // Добавляем в избранное
        const response = await fetch('/api/webapp/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tg_id: tgId, product_id: productId }),
        });

        const data = await response.json();

        if (!response.ok && response.status !== 409) {
          // 409 означает, что товар уже в избранном - это нормальная ситуация
          throw new Error(data.error || 'Failed to add to favorites');
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      
      // Откатываем изменения при ошибке
      setFavoriteIds(favoriteIds);
      setFavoritesCount(favoriteIds.length);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
      
      throw error;
    }
  }, [favoriteIds, user?.tg_id]);

  // Функция для принудительного обновления избранного
  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  // Загружаем при изменении аутентификации
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const value = {
    favoritesCount,
    setFavoritesCount,
    hasFavorites: favoritesCount > 0,
    favoriteIds,
    toggleFavorite,
    refreshFavorites
  };

  console.log('🔄 FavoritesProvider render:', { 
    favoritesCount, 
    hasFavorites: favoritesCount > 0,
    favoriteIds: favoriteIds.length,
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