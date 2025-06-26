"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CartItemComponent } from "../_components/CartItemComponent";
import { IconComponent } from "@/components/webapp/IconComponent";
import SkeletonLoading from "../_components/SkeletonLoading";
import DeliveryForm from "../_components/DeliveryForm";
import CartCheckoutSummary from "../_components/CartCheckoutSummary";
import { useTelegramBackButton } from "../_components/TelegramBackButton";
import TelegramMainButton from '../_components/TelegramMainButton';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';
import { telegramSDK } from '@/lib/telegram-sdk';
import { EmptyCart } from '@/components/ecommerce';

import TelegramCheckoutButton from '../_components/TelegramCheckoutButton';
// Telegram WebApp interface
interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
  };
}

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  image_url?: string;
}

interface DeliveryData {
  address: string;
  street: string;
  home: string;
  apartment: string;
  build: string;
  postal_code: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  phone_number: string;
  city?: string; // добавляем поле city
}

interface UserProfile {
  address?: string;
  street?: string;
  home?: string;
  apartment?: string;
  build?: string;
  postal_code?: number;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  phone_number?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [finalTotal, setFinalTotal] = useState(0);
  const [appliedBonus, setAppliedBonus] = useState(0);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [isTelegramEnv, setIsTelegramEnv] = useState(false);
  const { notificationSuccess, notificationError } = useTelegramHaptic();

  // Кастомная кнопка назад для корзины
  useTelegramBackButton({
    onBack: () => {
      // При выходе из корзины возвращаемся на главную страницу каталога
      window.location.href = '/webapp';
    }
  });

  // Загрузка корзины с изображениями
  const loadCart = async () => {
    const storedCart = localStorage.getItem('webapp_cart');
    if (storedCart) {
      const items: CartItem[] = JSON.parse(storedCart);
      
      // Загружаем изображения через API
      try {
        const response = await fetch('/api/webapp/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cart_items: items })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCartItems(data.cart_items);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading cart images:', error);
      }
      
      // Fallback: используем данные из localStorage без изображений
      setCartItems(items);
    } else {
      setCartItems([]);
    }
  };

  // Загрузка профиля пользователя для предзаполнения данных доставки
  const loadUserProfile = async () => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Добавляем Telegram initData если доступен
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initData) {
        headers['X-Telegram-Init-Data'] = (window as any).Telegram.WebApp.initData;
      }

      const response = await fetch('/api/webapp/profile', {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.user) {
          const profile: UserProfile = {
            address: data.user.address,
            street: data.user.street,
            home: data.user.home,
            apartment: data.user.apartment,
            build: data.user.build,
            postal_code: data.user.postal_code,
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            middle_name: data.user.middle_name,
            phone_number: data.user.phone_number
          };
          
          setUserProfile(profile);
        }
      } else {
        console.error('Profile loading failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      await loadCart();
      await loadUserProfile();
      setIsLoading(false);
    };

    initializePage();

    // Слушаем изменения корзины
    const handleCartUpdate = async () => {
      await loadCart();
    };

    // Слушаем фокус на странице для обновления данных
    const handlePageFocus = async () => {
      await loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('focus', handlePageFocus);
    window.addEventListener('visibilitychange', handlePageFocus);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('focus', handlePageFocus);
      window.removeEventListener('visibilitychange', handlePageFocus);
    };
  }, []);

  // Обновление количества товара
  const updateQuantity = async (productId: number, direction: 'up' | 'down') => {
    const updatedItems = cartItems.map(item => {
      if (item.product_id === productId) {
        const newQuantity = direction === 'up' 
          ? item.quantity + 1 
          : Math.max(0, item.quantity - 1);
        
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0); // Удаляем товары с количеством 0

    // Обновляем localStorage без изображений (для быстроты)
    const itemsForStorage = updatedItems.map(item => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity
    }));

    localStorage.setItem('webapp_cart', JSON.stringify(itemsForStorage));
    
    // Обновляем состояние с изображениями
    setCartItems(updatedItems);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Очистка всей корзины
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('webapp_cart');
    localStorage.removeItem('webapp_cart_enriched');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Обработчик изменения данных доставки (вызывается автоматически из DeliveryForm)
  const handleDeliveryDataChange = useCallback((data: DeliveryData) => {
    setDeliveryData(data);
  }, []);

  // Обработчик оформления заказа с Telegram WebApp интеграцией
  const handlePlaceOrder = async () => {
    if (!deliveryData || isOrderLoading) return;

    setIsOrderLoading(true);
    
    try {
      // Создаем заказ с примененными бонусами
      const orderData = {
        delivery_data: {
          ...deliveryData,
          city: deliveryData.address // передаем город как city
        },
        cart_items: cartItems,
        bonus: appliedBonus,
        total: finalTotal,
        telegram_user: (window as any).Telegram?.WebApp?.initDataUnsafe?.user || null
      };

      const response = await fetch('/api/webapp/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...((window as any).Telegram?.WebApp?.initData && {
            'X-Telegram-Init-Data': (window as any).Telegram.WebApp.initData
          })
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        // Очищаем корзину и сохраненные данные доставки после успешного оформления
        clearCart();
        localStorage.removeItem('webapp_delivery_data');
        
        // Отправляем данные в Telegram бот для уведомления
        if ((window as any).Telegram?.WebApp) {
          const telegramData = {
            action: 'order_placed',
            order_id: result.order_id,
            total: finalTotal,
            items_count: cartItems.length,
            delivery_address: `${deliveryData.address}, ${deliveryData.street}, ${deliveryData.home}`,
            customer_name: `${deliveryData.first_name} ${deliveryData.last_name}`,
            customer_phone: deliveryData.phone_number
          };
          
          try {
            (window as any).Telegram.WebApp.sendData(JSON.stringify(telegramData));
            console.log('📱 Order data sent to Telegram bot:', telegramData);
          } catch (error) {
            console.error('Error sending data to Telegram:', error);
          }
          
          // Закрываем WebApp через небольшую задержку
          setTimeout(() => {
            try {
              (window as any).Telegram.WebApp.close();
              console.log('📱 Telegram WebApp closed');
            } catch (error) {
              console.error('Error closing Telegram WebApp:', error);
              // Для обычного браузера просто перенаправляем без alert
              window.location.href = '/webapp/orders';
            }
          }, 500); // Уменьшаем задержку
        } else {
          // Для обычного браузера просто перенаправляем без alert
          window.location.href = '/webapp/orders';
        }
      } else {
        console.error('Order creation failed:', result.error);
        // Просто логируем ошибку без alert
      }
    } catch (error) {
      console.error('Order creation error:', error);
      // Просто логируем ошибку без alert
    } finally {
      setIsOrderLoading(false);
    }
  };

  // Подсчёт общих значений
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Проверка заполненности формы доставки
  const isDeliveryFormValid = deliveryData && 
    deliveryData.address && 
    deliveryData.street && 
    deliveryData.home && 
    deliveryData.first_name && 
    deliveryData.phone_number;

  // Set document title for Telegram Web App
  useEffect(() => {
    document.title = "Корзина";
    
    // Telegram Web App initialization
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      try {
        tg.ready();
        tg.expand();
        
        // Определяем что мы в Telegram окружении
        setIsTelegramEnv(true);
        console.log('🚀 Telegram environment detected');
        
        // Принудительно устанавливаем светлую тему для корзины
        // чтобы нижняя панель была белой даже в темной теме
        tg.setHeaderColor('#FFFFFF');
        tg.setBackgroundColor('#FFFFFF');
        
        // КРИТИЧЕСКИ ВАЖНО: Устанавливаем цвет нижней панели для MainButton
        if (tg.setBottomBarColor) {
          tg.setBottomBarColor('#FFFFFF');
          console.log('🎯 Цвет нижней панели установлен в корзине');
        }
        
        // Дополнительная попытка установить светлые цвета
        if (tg.themeParams) {
          // Переопределяем параметры темы для светлого фона
          tg.themeParams.bg_color = '#FFFFFF';
          tg.themeParams.secondary_bg_color = '#F7F7F7';
        }
        
        console.log('📱 Telegram WebApp initialized for cart page with light theme');
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
      }
    } else {
      setIsTelegramEnv(false);
      console.log('🌐 Browser environment detected');
    }
  }, []);

  // MainButton теперь управляется TelegramCheckoutButton компонентом

  const handleTelegramCheckout = async () => {
    if (!deliveryData || isOrderLoading) return;

    // Добавляем haptic feedback
    notificationSuccess();
    
    try {
      // Используем существующую логику оформления заказа
      await handlePlaceOrder();
      // После успешного заказа ничего не показываем - сразу закрываем WebApp
      
    } catch (error) {
      notificationError();
      console.error('Telegram checkout error:', error);
      // Просто логируем ошибку без popup
    }
  };

  // Генерируем className с учетом Telegram окружения
  const containerClassName = `webapp-container cart-page px-4 py-6${isTelegramEnv ? ' telegram-env' : ''}`;

  if (isLoading) {
    return (
      <div className={containerClassName}>
        <SkeletonLoading type="cart" />
      </div>
    );
  }

  // Пустая корзина
  if (cartItems.length === 0) {
    return (
      <div className={containerClassName}>
        <EmptyCart 
          title="Корзина пуста"
          description="Добавьте товары в корзину для оформления заказа"
          actionText="Вернуться в каталог"
          actionHref="/webapp"
        />
      </div>
    );
  }

  // Корзина с товарами
  return (
    <div className={containerClassName}>
      <h1 className="mb-6">Корзина</h1>
      
      <div className="main-block mb-6 cart-items-block">
        {/* Заголовок корзины - как в Rails */}
        <div className="flex justify-between items-center mb-6">
          <div className="font-semibold">
            Товаров: {totalQuantity}
          </div>
          <button
            className="btn-clear-cart"
            onClick={clearCart}
          >
            <div className="flex items-center gap-1 active:text-red-600">
              Очистить корзину
              <IconComponent name="trash" size={16} />
            </div>
          </button>
        </div>

        {/* Список товаров в контейнере cart-items */}
        <div className="cart-items space-y-2" id="cart_items">
          {cartItems.map(item => (
            <CartItemComponent
              key={item.product_id}
              item={item}
              onUpdateQuantity={updateQuantity}
            />
          ))}
        </div>
      </div>

      {/* Форма данных для доставки с автосохранением */}
      <div className="mb-6">
        <DeliveryForm
          initialData={userProfile || undefined}
          onDataChange={handleDeliveryDataChange}
          showPersonalInfo={true}
        />
      </div>

      {/* Система лояльности и итоговая информация */}
      <div className="mb-6">
        <CartCheckoutSummary
          onTotalChange={setFinalTotal}
          onBonusChange={setAppliedBonus}
        />
      </div>

      {/* 🚀 Telegram MainButton для оформления заказа */}
      {cartItems.length > 0 && isDeliveryFormValid && (
        <TelegramCheckoutButton
          total={finalTotal}
          isLoading={isOrderLoading}
          isDisabled={!isDeliveryFormValid}
          onCheckout={handleTelegramCheckout}
        />
      )}
    </div>
  );
}
