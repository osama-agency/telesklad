'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';
import { telegramSDK } from '@/lib/telegram-sdk';

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
}

export default function TelegramCartButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { impactMedium } = useTelegramHaptic();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isConfiguredRef = useRef(false);

  // Загрузка корзины из localStorage
  const loadCart = () => {
    const storedCart = localStorage.getItem('webapp_cart');
    if (storedCart) {
      const items: CartItem[] = JSON.parse(storedCart);
      setCartItems(items);
      
      // Подсчет общей суммы
      const cartTotal = items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
      
      // Добавляем стоимость доставки если она включена
      const deliveryEnabled = localStorage.getItem('webapp_delivery_enabled') === 'true';
      const finalTotal = deliveryEnabled ? cartTotal + 500 : cartTotal;
      
      setTotal(finalTotal);
    } else {
      setCartItems([]);
      setTotal(0);
    }
  };

  // Слушаем изменения корзины
  useEffect(() => {
    loadCart();

    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  // Показываем кнопку только на главной странице и странице избранного
  const shouldShowButton = (pathname === '/webapp' || pathname === '/webapp/favorites') && cartItems.length > 0;

  // Настройка MainButton
  useEffect(() => {
    if (!telegramSDK.isAvailable() || !shouldShowButton) {
      // Скрываем кнопку если не нужна
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
        isConfiguredRef.current = false;
      }
      return;
    }

    if (isConfiguredRef.current) {
      // Обновляем только текст если кнопка уже настроена
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.MainButton) {
        const buttonText = `Корзина ${total.toLocaleString('ru-RU')} ₽`;
        tg.MainButton.setText(buttonText);
      }
      return;
    }

    console.log('🛒 Настройка Telegram Cart Button');

    const handleClick = () => {
      console.log('🛒 Переход в корзину');
      impactMedium();
      router.push('/webapp/cart');
    };

    // Настраиваем светлую тему для каталога (как в корзине)
    telegramSDK.setLightTheme();
    
    // Настраиваем MainButton с зеленым цветом как в корзине
    const cleanup = telegramSDK.configureMainButton({
      text: `Корзина ${total.toLocaleString('ru-RU')} ₽`,
      color: '#48C928', // Зеленый цвет как на странице оформления
      textColor: '#FFFFFF',
      onClick: handleClick,
      show: true,
      enable: true
    });

    cleanupRef.current = cleanup;
    isConfiguredRef.current = true;

    console.log('✅ Cart Button настроена');

    return () => {
      console.log('🧹 Очистка Cart Button');
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      isConfiguredRef.current = false;
    };
  }, [shouldShowButton, total, router]);

  // Fallback кнопка для обычного браузера
  if (!telegramSDK.isAvailable() && shouldShowButton) {
    return (
      <button 
        onClick={() => {
          impactMedium();
          router.push('/webapp/cart');
        }}
        className="cart-button-fallback"
        style={{
          backgroundColor: '#48C928',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '16px 24px',
          fontSize: '16px',
          fontWeight: '600',
          width: 'calc(100% - 32px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
          position: 'fixed',
          bottom: '20px',
          left: '16px',
          right: '16px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(72, 201, 40, 0.3)',
          maxWidth: '500px',
          margin: '0 auto'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 20C9 21.1 8.1 22 7 22S5 21.1 5 20 5.9 18 7 18 9 18.9 9 20ZM20 20C20 21.1 19.1 22 18 22S16 21.1 16 20 16.9 18 18 18 20 18.9 20 20Z"/>
          <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"/>
        </svg>
        Корзина {total.toLocaleString('ru-RU')} ₽
      </button>
    );
  }

  // В Telegram используем только MainButton (возвращаем null)
  return null;
} 