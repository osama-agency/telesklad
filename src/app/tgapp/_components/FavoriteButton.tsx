"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

interface FavoriteButtonProps {
  productId: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export default function FavoriteButton({ 
  productId, 
  size = "md",
  showCount = false 
}: FavoriteButtonProps) {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Используем только состояние из контекста - единый источник истины
  const isFavorite = favoriteIds.includes(productId);
  const favoritesCount = favoriteIds.length;

  // Размеры иконки в зависимости от size
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const buttonSizes = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-10 h-10"
  };

  const triggerHaptic = (type: "light" | "medium" = "light") => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred(type);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Проверяем авторизацию
    const tgId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (!tgId) {
      console.error("No Telegram user ID found");
      (window as any).Telegram?.WebApp?.showAlert("Необходима авторизация в Telegram");
      return;
    }

    // Запускаем анимацию только для этой кнопки
    setIsAnimating(true);
    triggerHaptic(isFavorite ? "light" : "medium");

    try {
      // Используем только функцию из контекста - она сама управляет оптимистическим обновлением
      await toggleFavorite(productId);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      (window as any).Telegram?.WebApp?.showAlert("Ошибка при обновлении избранного. Попробуйте еще раз.");
    } finally {
      // Задержка для завершения анимации
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isAnimating}
      className={`
        ${buttonSizes[size]}
        relative
        flex items-center justify-center
        bg-white dark:bg-gray-800
        rounded-lg
        shadow-sm
        border border-gray-200 dark:border-gray-700
        transition-all duration-200
        hover:scale-105
        disabled:cursor-not-allowed
        group
        ${isFavorite ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800" : ""}
        ${isAnimating ? "scale-95 opacity-80" : ""}
      `}
      aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
    >
      <Heart 
        className={`
          ${iconSizes[size]}
          transition-all duration-200
          ${isFavorite ? "fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400" : "text-gray-400 dark:text-gray-600"}
          ${isAnimating ? "scale-110" : ""}
        `}
      />
      {showCount && favoritesCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm dark:shadow-black/30">
          {favoritesCount}
        </span>
      )}
    </button>
  );
} 