import { useEffect } from 'react';

interface MainButtonConfig {
  text: string;
  color?: string;
  textColor?: string;
  isVisible?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export function useMainButton(config: MainButtonConfig | null) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    if (config) {
      // Настраиваем MainButton
      tg.MainButton.text = config.text;
      if (config.color) tg.MainButton.color = config.color;
      if (config.textColor) tg.MainButton.textColor = config.textColor;

      // Устанавливаем обработчик клика
      if (config.onClick) {
        tg.MainButton.onClick(config.onClick);
      }

      // Показываем или скрываем кнопку
      if (config.isVisible !== false) {
        if (config.isActive !== false) {
          tg.MainButton.enable();
        } else {
          tg.MainButton.disable();
        }
        tg.MainButton.show();
      } else {
        tg.MainButton.hide();
      }

      // Cleanup функция
      return () => {
        if (config.onClick) {
          tg.MainButton.offClick(config.onClick);
        }
      };
    } else {
      // Скрываем кнопку если config null
      tg.MainButton.hide();
    }
  }, [config]);
}

// Хук для обновления корзины в MainButton
export function useCartMainButton() {
  const updateMainButton = () => {
    if (typeof window === 'undefined') return;

    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    try {
      const cartDataRaw = localStorage.getItem('tgapp_cart') || localStorage.getItem('webapp_cart') || '[]';
      const cartData = JSON.parse(cartDataRaw);
      const totalItems = cartData.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const totalPrice = cartData.reduce((sum: number, item: any) => sum + (item.product_price * item.quantity), 0);

      if (totalItems > 0) {
        tg.MainButton.text = `🛒 Корзина (${totalItems}) • ${totalPrice}₽`;
        tg.MainButton.color = "#22c55e";
        tg.MainButton.textColor = "#ffffff";
        tg.MainButton.show();
        tg.MainButton.enable();

        // Устанавливаем обработчик перехода в корзину
        const handleCartClick = () => {
          window.location.href = '/tgapp/cart';
        };

        tg.MainButton.onClick(handleCartClick);
      } else {
        tg.MainButton.hide();
      }
    } catch (error) {
      console.error('Error updating main button:', error);
    }
  };

  useEffect(() => {
    // Обновляем при загрузке
    updateMainButton();

    // Слушаем изменения в localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tgapp_cart' || e.key === 'webapp_cart') {
        updateMainButton();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Также слушаем кастомное событие для обновления корзины
    const handleCartUpdate = () => updateMainButton();
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  return { updateMainButton };
} 