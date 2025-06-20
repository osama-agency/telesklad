"use client";

import { useState, useEffect } from "react";
import { IconComponent } from "@/components/webapp/IconComponent";

interface FavoriteButtonProps {
  productId: number;
  className?: string;
}

export function FavoriteButton({ productId, className = "" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем состояние избранного из localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('webapp_favorites') || '[]');
    setIsFavorite(favorites.includes(productId));
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
    
    // Уведомляем об изменениях
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  // Обработчик клика по кнопке
  const handleToggleFavorite = async () => {
    if (isLoading) return;

    setIsLoading(true);
    triggerHaptic('medium');

    try {
      const newIsFavorite = !isFavorite;

      if (newIsFavorite) {
        // Добавляем в избранное
        const response = await fetch('/api/webapp/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_id: productId }),
        });

        if (response.ok) {
          setIsFavorite(true);
          updateLocalStorage(true);
        } else {
          throw new Error('Ошибка добавления в избранное');
        }
      } else {
        // Удаляем из избранного
        const response = await fetch(`/api/webapp/favorites?product_id=${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsFavorite(false);
          updateLocalStorage(false);
        } else {
          throw new Error('Ошибка удаления из избранного');
        }
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      // В случае ошибки API всё равно обновляем localStorage
      const newIsFavorite = !isFavorite;
      setIsFavorite(newIsFavorite);
      updateLocalStorage(newIsFavorite);
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