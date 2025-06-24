'use client';
import { useEffect, useState } from 'react';

export default function CloudFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    // Загрузка избранного из облачного хранилища Telegram
    const tg = window.Telegram?.WebApp;
    if (!tg?.CloudStorage) return;

    tg.CloudStorage.getItem('favorites', (error, value) => {
      if (!error && value) {
        try {
          setFavorites(JSON.parse(value));
        } catch (e) {
          console.error('Error parsing favorites:', e);
        }
      }
    });
  }, []);

  const saveFavorites = (newFavorites: number[]) => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.CloudStorage) return;

    tg.CloudStorage.setItem('favorites', JSON.stringify(newFavorites), (error) => {
      if (!error) {
        setFavorites(newFavorites);
      }
    });
  };

  return { favorites, saveFavorites };
} 