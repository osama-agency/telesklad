"use client";

import { useEffect, useState } from "react";
import { useBackButton } from "../_components/useBackButton";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import Image from "next/image";

interface CartItem {
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Показываем кнопку "Назад" в Telegram
  useBackButton(true);

  const loadCart = () => {
    try {
      const cartData = JSON.parse(localStorage.getItem('tgapp_cart') || '[]');
      setCartItems(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateCart = (newCartItems: CartItem[]) => {
    setCartItems(newCartItems);
    localStorage.setItem('tgapp_cart', JSON.stringify(newCartItems));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const updateQuantity = (productId: number, delta: number) => {
    const newCartItems = cartItems.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.productPrice * newQuantity
        };
      }
      return item;
    });
    updateCart(newCartItems);
  };

  const removeItem = (productId: number) => {
    const newCartItems = cartItems.filter(item => item.productId !== productId);
    updateCart(newCartItems);
  };

  const clearCart = () => {
    updateCart([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Состояние загрузки
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        {/* Фиксированный заголовок */}
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700/50">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-200">Корзина</h1>
        </div>

        {/* Основной контент */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Загрузка корзины...</p>
          </div>
        </div>
      </div>
    );
  }

  // Пустая корзина
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Фиксированный заголовок */}
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700/50">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-200">Корзина</h1>
        </div>

        {/* Основной контент */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gray-100 dark:bg-gray-800">
              <ShoppingCart className="w-10 h-10 text-gray-400 dark:text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-2">
              Корзина пуста
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6">
              Добавьте товары из каталога для оформления заказа
            </p>
            <button
              onClick={() => window.location.href = '/tgapp/catalog'}
              className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium text-sm rounded-lg transition-all duration-200 active:scale-95"
            >
              Перейти в каталог
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Корзина с товарами
  return (
    <div className="flex flex-col h-full">
      {/* Фиксированный заголовок */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
            Корзина
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {getTotalItems()} {getTotalItems() === 1 ? 'товар' : getTotalItems() < 5 ? 'товара' : 'товаров'}
          </span>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        {/* Список товаров */}
        <div className="px-4 py-4 space-y-3">
          {cartItems.map((item) => (
            <div 
              key={item.productId} 
              className="bg-white dark:bg-gray-800/60 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                {/* Изображение товара */}
                {item.imageUrl && (
                  <div className="relative w-16 h-16 bg-gray-50 dark:bg-gray-700/30 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-contain"
                      unoptimized
                      sizes="64px"
                    />
                  </div>
                )}
                
                {/* Информация о товаре */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200 line-clamp-2 leading-tight">
                    {item.productName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {item.productPrice.toLocaleString('ru-RU')} ₽ за шт.
                  </p>
                </div>
                
                {/* Кнопка удаления */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 active:scale-95"
                  title="Удалить товар"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {/* Управление количеством и общая цена */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                {/* Управление количеством */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, -1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <span className="min-w-[3rem] text-center text-sm font-medium text-gray-900 dark:text-gray-200">
                    {item.quantity}
                  </span>
                  
                  <button
                    onClick={() => updateQuantity(item.productId, 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Общая цена за товар */}
                <div className="text-lg font-bold text-webapp-brand dark:text-webapp-brand">
                  {item.totalPrice.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Итоговая информация и кнопки */}
        <div className="px-4 pb-4">
          <div className="bg-white dark:bg-gray-800/60 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
            {/* Общая сумма */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                Итого:
              </span>
              <span className="text-xl font-bold text-webapp-brand dark:text-webapp-brand">
                {getTotalPrice().toLocaleString('ru-RU')} ₽
              </span>
            </div>
            
            {/* Кнопки действий */}
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 active:scale-95"
              >
                Очистить
              </button>
              <button
                className="flex-[2] py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white font-medium text-sm rounded-lg transition-all duration-200 active:scale-95"
                onClick={() => {
                  // Здесь будет логика оформления заказа
                  alert('Функция оформления заказа будет добавлена позже');
                }}
              >
                Оформить заказ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 