"use client";

import { useState, useEffect } from "react";
import { IconComponent } from "@/components/webapp/IconComponent";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';

interface OptimizedFavoriteButtonProps {
  productId: number;
  className?: string;
  onRemoved?: () => void;
  initialIsFavorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

export function OptimizedFavoriteButton({ productId, className = "", onRemoved, initialIsFavorite = false, onToggle }: OptimizedFavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useTelegramAuth();
  const { impactLight, notificationSuccess, notificationError } = useTelegramHaptic();

  // Загружаем состояние избранного из localStorage при монтировании
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('webapp_favorites') || '[]');
    setIsFavorite(favorites.includes(productId));
  }, [productId]);

  // Слушаем изменения localStorage для синхронизации состояния между компонентами
  useEffect(() => {
    const handleStorageChange = () => {
      const favorites = JSON.parse(localStorage.getItem('webapp_favorites') || '[]');
      setIsFavorite(favorites.includes(productId));
    };

    window.addEventListener('favoriteAdded', handleStorageChange);
    window.addEventListener('favoriteRemoved', handleStorageChange);
    window.addEventListener('favoritesSync', handleStorageChange);

    return () => {
      window.removeEventListener('favoriteAdded', handleStorageChange);
      window.removeEventListener('favoriteRemoved', handleStorageChange);
      window.removeEventListener('favoritesSync', handleStorageChange);
    };
  }, [productId]);

  // Обновление локального хранилища
  const updateLocalStorage = (newIsFavorite: boolean) => {
    const favorites = JSON.parse(localStorage.getItem('webapp_favorites') || '[]');
    
    if (newIsFavorite) {
      if (!favorites.includes(productId)) {
        favorites.push(productId);
      }
    } else {
      const index = favorites.indexOf(productId);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }
    
    localStorage.setItem('webapp_favorites', JSON.stringify(favorites));
    
    // Уведомляем другие компоненты об изменениях
    if (newIsFavorite) {
      window.dispatchEvent(new CustomEvent('favoriteAdded', { detail: { productId } }));
    } else {
      window.dispatchEvent(new CustomEvent('favoriteRemoved', { detail: { productId } }));
      onRemoved?.();
    }
  };

  // Основная логика переключения избранного
  const handleToggleFavorite = async () => {
    if (isLoading) return;

    const newIsFavorite = !isFavorite;
    
    // 🚀 ОПТИМИСТИЧЕСКОЕ ОБНОВЛЕНИЕ - мгновенно меняем состояние
    setIsFavorite(newIsFavorite);
    updateLocalStorage(newIsFavorite);
    impactLight();
    
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            product_id: productId,
            tg_id: user.tg_id 
          }),
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          notificationSuccess();
          if (onToggle) {
            onToggle(true);
          }
          if (data.message) {
            console.log(`ℹ️ ${data.message}`);
          }
        } else {
          // Для статуса 409 (уже в избранном) обрабатываем как успех
          if (response.status === 409) {
            notificationSuccess();
            if (onToggle) {
              onToggle(true);
            }
            console.log(`ℹ️ Product ${productId} already in favorites`);
        } else {
          throw new Error(data.error || 'Failed to add to favorites');
          }
        }
      } else {
        // Удаляем из избранного
        const response = await fetch(`/api/webapp/favorites?product_id=${productId}&tg_id=${user.tg_id}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          notificationSuccess();
          if (onToggle) {
            onToggle(false);
          }
        } else {
          throw new Error(data.error || 'Failed to remove from favorites');
        }
      }
    } catch (error) {
      notificationError();
      console.error('Favorite toggle error:', error);
      // В случае ошибки API откатываем состояние обратно
      setIsFavorite(!newIsFavorite);
      updateLocalStorage(!newIsFavorite);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`optimized-fav-btn haptic-feedback ${isFavorite ? 'favorite' : ''} ${isLoading ? 'loading' : ''} ${className}`}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <IconComponent 
        name={isFavorite ? 'favorite' : 'unfavorite'} 
        size={18} 
      />
    </button>
  );
} 