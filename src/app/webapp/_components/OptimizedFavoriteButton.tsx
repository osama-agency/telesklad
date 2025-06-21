"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { IconComponent } from "@/components/webapp/IconComponent";
import { webappCache } from "@/lib/services/webappCache";

interface OptimizedFavoriteButtonProps {
  productId: number;
  className?: string;
  onFavoriteChange?: (isFavorite: boolean) => void;
}

export const OptimizedFavoriteButton = memo(function OptimizedFavoriteButton({ 
  productId, 
  className = "",
  onFavoriteChange 
}: OptimizedFavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем состояние избранного из localStorage
  useEffect(() => {
    try {
      const favorites = JSON.parse(localStorage.getItem('webapp_favorites') || '[]');
      const favoriteState = favorites.includes(productId);
      setIsFavorite(favoriteState);
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      setIsFavorite(false);
    }
  }, [productId]);

  // Haptic feedback - мемоизированная функция
  const triggerHaptic = useCallback((type: 'light' | 'medium' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Обновление локального хранилища - мемоизированная функция
  const updateLocalStorage = useCallback((newIsFavorite: boolean) => {
    try {
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
      
      // Уведомляем об изменениях
      window.dispatchEvent(new CustomEvent('favoritesUpdated', { 
        detail: { productId, isFavorite: newIsFavorite } 
      }));
      
      // Инвалидируем кэш избранного
      webappCache.clear('favorites');
      
      // Уведомляем родительский компонент
      onFavoriteChange?.(newIsFavorite);
    } catch (error) {
      console.error('Error updating favorites in localStorage:', error);
    }
  }, [productId, onFavoriteChange]);

  // Обработчик клика по кнопке - мемоизированная функция
  const handleToggleFavorite = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    triggerHaptic('medium');

    const newIsFavorite = !isFavorite;

    try {
      if (newIsFavorite) {
        // Добавляем в избранное
        const response = await fetch('/api/webapp/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_id: productId }),
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          setIsFavorite(true);
          updateLocalStorage(true);
        } else {
          // Если товар уже в избранном, просто обновляем состояние
          if (data.error?.includes('уже в избранном')) {
            setIsFavorite(true);
            updateLocalStorage(true);
          } else {
            throw new Error(data.error || 'Ошибка добавления в избранное');
          }
        }
      } else {
        // Удаляем из избранного
        const response = await fetch(`/api/webapp/favorites?product_id=${productId}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          setIsFavorite(false);
          updateLocalStorage(false);
        } else {
          // Если товара нет в избранном, просто обновляем состояние
          if (data.error?.includes('не найден в избранном')) {
            setIsFavorite(false);
            updateLocalStorage(false);
          } else {
            throw new Error(data.error || 'Ошибка удаления из избранного');
          }
        }
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      
      // В случае сетевой ошибки обновляем localStorage для лучшего UX
      // Это позволяет работать в офлайн режиме
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setIsFavorite(newIsFavorite);
        updateLocalStorage(newIsFavorite);
        console.log('Working in offline mode for favorites');
      } else {
        // Для других ошибок показываем уведомление
        console.error('API error:', error);
        triggerHaptic('medium'); // Дополнительная вибрация при ошибке
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isFavorite, productId, triggerHaptic, updateLocalStorage]);

  return (
    <button
      className={`fav-btn ${isFavorite ? 'favorite' : ''} ${isLoading ? 'loading' : ''} ${className}`}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
      aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <IconComponent 
          name={isFavorite ? 'favorite' : 'unfavorite'} 
          size={20} 
        />
      )}
    </button>
  );
}); 