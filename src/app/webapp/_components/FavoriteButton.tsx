"use client";

import { useState, useEffect } from "react";
import { IconComponent } from "@/components/webapp/IconComponent";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

interface FavoriteButtonProps {
  productId: number;
  className?: string;
  onRemoved?: () => void;
}

export function FavoriteButton({ productId, className = "", onRemoved }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useTelegramAuth();

  // Загружаем состояние избранного из localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('webapp_favorites') || '[]');
    const isFav = favorites.includes(productId);
    console.log(`Product ${productId}: favorites in localStorage:`, favorites, 'isFavorite:', isFav);
    setIsFavorite(isFav);
  }, [productId]);

  // Слушаем изменения localStorage для синхронизации состояния
  useEffect(() => {
    const handleStorageChange = () => {
      const favorites = JSON.parse(localStorage.getItem('webapp_favorites') || '[]');
      setIsFavorite(favorites.includes(productId));
    };

    // Слушаем события обновления избранного
    window.addEventListener('favoriteAdded', handleStorageChange);
    window.addEventListener('favoriteRemoved', handleStorageChange);
    window.addEventListener('favoritesSync', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('favoriteAdded', handleStorageChange);
      window.removeEventListener('favoriteRemoved', handleStorageChange);
      window.removeEventListener('favoritesSync', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [productId]);

  // Haptic feedback
  const triggerHaptic = (type: 'light' | 'medium' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Обновление локального хранилища
  const updateLocalStorage = (newIsFavorite: boolean) => {
    const favorites = JSON.parse(localStorage.getItem('webapp_favorites') || '[]');
    
    if (newIsFavorite) {
      // Добавляем в избранное
      if (!favorites.includes(productId)) {
        favorites.push(productId);
      }
    } else {
      // Удаляем из избранного
      const index = favorites.indexOf(productId);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }
    
    localStorage.setItem('webapp_favorites', JSON.stringify(favorites));
    
    // Уведомляем об изменениях с конкретными событиями
    if (newIsFavorite) {
      window.dispatchEvent(new CustomEvent('favoriteAdded', { 
        detail: { productId } 
      }));
    } else {
      window.dispatchEvent(new CustomEvent('favoriteRemoved', { 
        detail: { productId } 
      }));
      // Вызываем callback для анимации удаления
      onRemoved?.();
    }
  };

  // Обработчик клика по кнопке
  const handleToggleFavorite = async () => {
    if (isLoading) return;

    const newIsFavorite = !isFavorite;
    
    // 🚀 ОПТИМИСТИЧЕСКОЕ ОБНОВЛЕНИЕ - мгновенно меняем состояние
    setIsFavorite(newIsFavorite);
    updateLocalStorage(newIsFavorite);
    triggerHaptic('medium');

    // Проверяем аутентификацию
    if (!isAuthenticated || !user?.tg_id) {
      console.warn('User not authenticated, using localStorage only');
      return;
    }

    setIsLoading(true);

    try {

      if (newIsFavorite) {
        // Добавляем в избранное
        const response = await fetch('/api/webapp/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            product_id: productId,
            tg_id: user.tg_id 
          }),
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          console.log(`✅ Product ${productId} added to favorites for user ${user.tg_id}`);
          if (data.message) {
            console.log(`ℹ️ ${data.message}`);
          }
        } else {
          // Для статуса 409 (уже в избранном) обрабатываем как успех
          if (response.status === 409) {
            console.log(`ℹ️ Product ${productId} already in favorites for user ${user.tg_id}`);
        } else {
          throw new Error(data.error || 'Ошибка добавления в избранное');
          }
        }
      } else {
        // Удаляем из избранного
        const response = await fetch(`/api/webapp/favorites?product_id=${productId}&tg_id=${user.tg_id}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          console.log(`✅ Product ${productId} removed from favorites for user ${user.tg_id}`);
        } else {
          throw new Error(data.error || 'Ошибка удаления из избранного');
        }
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      // В случае ошибки API откатываем состояние обратно
      setIsFavorite(!newIsFavorite);
      updateLocalStorage(!newIsFavorite);
      
      // Показываем пользователю уведомление об ошибке (опционально)
      // Можно добавить toast notification здесь
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`fav-btn ${isFavorite ? 'favorite' : ''} ${isLoading ? 'loading' : ''} ${className}`}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <IconComponent 
        name={isFavorite ? 'favorite' : 'unfavorite'} 
        size={20} 
      />
    </button>
  );
} 