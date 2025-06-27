import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useBackButton(isVisible: boolean = true, customOnClick?: () => void) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    if (isVisible) {
      // Показываем кнопку "Назад"
      tg.BackButton.show();
      
      // Устанавливаем обработчик
      const handleBackClick = customOnClick || (() => router.back());
      tg.BackButton.onClick(handleBackClick);

      // Cleanup функция
      return () => {
        tg.BackButton.hide();
        tg.BackButton.offClick(handleBackClick);
      };
    } else {
      // Скрываем кнопку
      tg.BackButton.hide();
    }
  }, [isVisible, customOnClick, router]);
} 