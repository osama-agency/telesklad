"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CartItemComponent } from "../_components/CartItemComponent";
import { IconComponent } from "@/components/webapp/IconComponent";
import LoadingSpinner from "../_components/LoadingSpinner";
import DeliveryForm from "../_components/DeliveryForm";
import CartCheckoutSummary from "../_components/CartCheckoutSummary";

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
      const response = await fetch('/api/webapp/profile');
      
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

  // Обработчик оформления заказа
  const handlePlaceOrder = async () => {
    if (!deliveryData || isOrderLoading) return;

    setIsOrderLoading(true);
    
    try {
      // Создаем заказ с примененными бонусами
      const orderData = {
        delivery_data: deliveryData,
        cart_items: cartItems,
        bonus: appliedBonus,
        total: finalTotal
      };

      const response = await fetch('/api/webapp/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        // Очищаем корзину и сохраненные данные доставки после успешного оформления
        clearCart();
        localStorage.removeItem('webapp_delivery_data');
        
        // Показываем уведомление об успешном оформлении
        alert('Заказ успешно оформлен!');
        
        // Перенаправляем на страницу заказов
        window.location.href = '/webapp/orders';
      } else {
        alert(result.error || 'Ошибка при оформлении заказа');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Ошибка при оформлении заказа');
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
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#FFFFFF');
      tg.setBackgroundColor('#f9f9f9');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="webapp-container cart-page">
        <h1>Корзина</h1>
        <LoadingSpinner variant="page" size="lg" />
      </div>
    );
  }

  // Пустая корзина
  if (cartItems.length === 0) {
    return (
      <>
        <h1>Корзина</h1>
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">
              <IconComponent name="cart-empty" size={64} />
            </div>
            <div className="empty-state-title">Корзина пуста</div>
            <div className="empty-state-subtitle">
              Добавьте товары в корзину для оформления заказа
            </div>
            <Link href="/webapp" className="empty-state-button">
              Вернуться в каталог
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Корзина с товарами
  return (
    <>
      <h1>Корзина</h1>
      
      <div className="main-block mb-5">
        {/* Заголовок корзины - как в Rails */}
        <div className="flex justify-between items-center mb-3">
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
        <div className="cart-items" id="cart_items">
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
      <DeliveryForm
        initialData={userProfile || undefined}
        onDataChange={handleDeliveryDataChange}
        showPersonalInfo={true}
      />

      {/* Система лояльности и итоговая информация */}
      <CartCheckoutSummary
        onTotalChange={setFinalTotal}
        onBonusChange={setAppliedBonus}
      />

      {/* Кнопка оформления заказа */}
      <div className="main-block">
        <button 
          className="webapp-btn webapp-btn-big w-full"
          disabled={!isDeliveryFormValid || isOrderLoading}
          onClick={handlePlaceOrder}
        >
          {isOrderLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner variant="default" size="sm" />
              Оформляем заказ...
            </span>
          ) : (
            'Оформить заказ'
          )}
        </button>
        
        <Link 
          href="/webapp" 
          className="block text-center mt-3 text-gray-600 hover:text-green-600 transition-colors"
        >
          Продолжить покупки
        </Link>
      </div>
    </>
  );
}
