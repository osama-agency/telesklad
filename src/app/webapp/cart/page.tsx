"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CartItemComponent } from "../_components/CartItemComponent";
import { IconComponent } from "@/components/webapp/IconComponent";

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  image_url?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка корзины
  const loadCart = () => {
    const storedCart = localStorage.getItem('webapp_cart');
    if (storedCart) {
      const items: CartItem[] = JSON.parse(storedCart);
      setCartItems(items);
    } else {
      setCartItems([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCart();

    // Слушаем изменения корзины
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Обновление количества товара
  const updateQuantity = (productId: number, direction: 'up' | 'down') => {
    const updatedItems = cartItems.map(item => {
      if (item.product_id === productId) {
        const newQuantity = direction === 'up' 
          ? item.quantity + 1 
          : Math.max(0, item.quantity - 1);
        
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0); // Удаляем товары с количеством 0

    setCartItems(updatedItems);
    localStorage.setItem('webapp_cart', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Очистка всей корзины
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('webapp_cart');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Подсчёт общих значений
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);

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
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
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

      {/* Итоговая информация и кнопка оформления */}
      <div className="main-block cart-summary-info">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Итого:</span>
          <span className="text-xl font-bold text-green-600">
            {Math.floor(totalPrice)} ₽
          </span>
        </div>
        
        <button className="webapp-btn webapp-btn-big w-full">
          Оформить заказ
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