"use client";

import React from 'react';
import { Header } from './Header'; // Оригинальный компонент
import { TelegramHeader } from './TelegramHeader'; // Новый компонент

interface HeaderProviderProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * HeaderProvider - безопасный способ управления переходом на Telegram Design System
 * 
 * Использование:
 * 1. По умолчанию использует старый Header для обратной совместимости
 * 2. Можно включить новый дизайн через переменную NEXT_PUBLIC_ENABLE_TELEGRAM_DESIGN
 * 3. Можно принудительно включить через props enableTelegramDesign
 */
export function HeaderProvider({ className }: HeaderProviderProps) {
  // Проверяем переменную окружения (безопасно, с fallback)
  const envFlag = process.env.NEXT_PUBLIC_ENABLE_TELEGRAM_DESIGN === 'true';
  
  // Для A/B тестирования можно добавить логику на основе user ID
  // const { user } = useTelegramAuth();
  // const isUserInExperimentGroup = user?.tg_id ? (user.tg_id % 10) < 1 : false; // 10% пользователей
  
  // По умолчанию используем старый компонент для безопасности
  const useTelegramDesign = envFlag; // || isUserInExperimentGroup;
  
  // Рендерим соответствующий header
  if (useTelegramDesign) {
    return (
      <TelegramHeader 
        enableDesignSystem={true}
        className={className}
      />
    );
  }
  
  // Fallback на оригинальный компонент
  return <Header />;
}

/**
 * Utility hook для проверки активного режима
 */
export function useHeaderMode() {
  const envFlag = process.env.NEXT_PUBLIC_ENABLE_TELEGRAM_DESIGN === 'true';
  
  return {
    isTelegramDesignEnabled: envFlag,
    isLegacyMode: !envFlag
  };
} 