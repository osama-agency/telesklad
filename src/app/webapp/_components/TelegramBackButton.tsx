"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface TelegramBackButtonProps {
  show?: boolean;
  onBack?: () => void;
  fallbackPath?: string;
}

export function TelegramBackButton({ 
  show = true, 
  onBack,
  fallbackPath = '/webapp'
}: TelegramBackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Проверяем доступность Telegram WebApp API
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
      return;
    }

    const tg = window.Telegram.WebApp;
    const backButton = tg.BackButton;

    // Показываем кнопку назад если это не главная страница
    const isMainPage = pathname === '/webapp';
    const shouldShow = show && !isMainPage;

    if (shouldShow) {
      // Обработчик нажатия на кнопку назад
      const handleBackClick = () => {
        if (onBack) {
          onBack();
        } else {
          // По умолчанию возвращаемся на предыдущую страницу или на главную
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push(fallbackPath);
          }
        }
      };

      // Добавляем обработчик и показываем кнопку
      backButton.onClick(handleBackClick);
      backButton.show();

      // Cleanup при размонтировании
      return () => {
        backButton.offClick(handleBackClick);
        backButton.hide();
      };
    } else {
      // Скрываем кнопку на главной странице
      backButton.hide();
    }
  }, [pathname, show, onBack, fallbackPath, router]);

  // Этот компонент не рендерит UI, только управляет Telegram API
  return null;
}

// Хук для удобного использования кнопки назад
export function useTelegramBackButton(options?: TelegramBackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
      return;
    }

    const tg = window.Telegram.WebApp;
    const backButton = tg.BackButton;

    const isMainPage = pathname === '/webapp';
    const shouldShow = options?.show !== false && !isMainPage;

    if (shouldShow) {
      const handleBackClick = () => {
        if (options?.onBack) {
          options.onBack();
        } else {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push(options?.fallbackPath || '/webapp');
          }
        }
      };

      backButton.onClick(handleBackClick);
      backButton.show();

      return () => {
        backButton.offClick(handleBackClick);
        backButton.hide();
      };
    } else {
      backButton.hide();
    }
  }, [pathname, options, router]);
} 