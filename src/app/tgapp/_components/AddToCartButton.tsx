"use client";

import { useState, useEffect } from "react";

interface AddToCartButtonProps {
  productId: number;
  productName: string;
  productPrice: number;
  maxQuantity?: number;
  imageUrl?: string;
  onCartChange?: (quantity: number) => void;
}

export function AddToCartButton({ 
  productId,
  productName,
  productPrice,
  maxQuantity = 99,
  imageUrl,
  onCartChange 
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showQuantityInput, setShowQuantityInput] = useState(false);

  // Загружаем количество из localStorage при монтировании
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('webapp_cart') || '[]');
    const existingItem = cart.find((item: any) => item.product_id === productId);
    if (existingItem) {
      setQuantity(existingItem.quantity);
    }
  }, [productId]);

  // Haptic feedback (только для мобильных устройств)
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Обновляем корзину в localStorage
  const updateCart = (newQuantity: number) => {
    const cart = JSON.parse(localStorage.getItem('webapp_cart') || '[]');

      if (newQuantity === 0) {
      // Удаляем товар из корзины
      const updatedCart = cart.filter((item: any) => item.product_id !== productId);
      localStorage.setItem('webapp_cart', JSON.stringify(updatedCart));
      } else {
             // Обновляем или добавляем товар
       const existingIndex = cart.findIndex((item: any) => item.product_id === productId);
      
        if (existingIndex >= 0) {
          cart[existingIndex].quantity = newQuantity;
        } else {
          cart.push({
            id: Date.now(),
            product_id: productId,
            product_name: productName,
            product_price: productPrice,
            quantity: newQuantity,
          image_url: imageUrl
          });
      }

      localStorage.setItem('webapp_cart', JSON.stringify(cart));
    }
    
    // Уведомляем об изменениях корзины
    window.dispatchEvent(new Event('cartUpdated'));
      onCartChange?.(newQuantity);
  };

  // Добавить в корзину (первый клик)
  const handleAddToCart = () => {
    if (quantity === 0) {
      setIsAnimating(true);
      triggerHaptic('medium');
      
      const newQuantity = 1;
      setQuantity(newQuantity);
      updateCart(newQuantity);
      
      // Анимация завершается через 300ms
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  // Увеличить количество
  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      triggerHaptic('light');
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      updateCart(newQuantity);
    } else {
      triggerHaptic('heavy'); // Вибрация при достижении лимита
    }
  };

  // Уменьшить количество
  const handleDecrease = () => {
    if (quantity > 0) {
      triggerHaptic('light');
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      updateCart(newQuantity);
    }
  };

  // Быстрое редактирование количества
  const handleQuantityTap = () => {
    setShowQuantityInput(true);
  };

  // Обработка ввода количества
  const handleQuantityChange = (value: string) => {
    const newQuantity = Math.min(Math.max(parseInt(value) || 0, 0), maxQuantity);
    setQuantity(newQuantity);
    updateCart(newQuantity);
    setShowQuantityInput(false);
    triggerHaptic('medium');
  };

  // Long press для быстрого добавления
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const handleLongPressStart = (action: 'increase' | 'decrease') => {
    setIsLongPressing(true);
    const timer = setInterval(() => {
      if (action === 'increase' && quantity < maxQuantity) {
        setQuantity(prev => {
          const newQuantity = prev + 1;
          updateCart(newQuantity);
          triggerHaptic('light');
          return newQuantity;
        });
      } else if (action === 'decrease' && quantity > 0) {
        setQuantity(prev => {
          const newQuantity = prev - 1;
          updateCart(newQuantity);
          triggerHaptic('light');
          return newQuantity;
        });
      }
    }, 150); // Быстрое повторение каждые 150ms
    
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearInterval(longPressTimer);
    setLongPressTimer(null);
    }
    setIsLongPressing(false);
  };

  // Если товара нет в корзине - показываем кнопку "В корзину"
  if (quantity === 0) {
    return (
      <button
        className={`
          w-full py-2.5 px-4 
          bg-telegram-primary hover:bg-telegram-primary/90 
          text-white font-medium text-sm 
          rounded-lg 
          transition-all duration-200 
          active:scale-95 
          disabled:opacity-60 disabled:cursor-not-allowed
          shadow-sm hover:shadow-md
          ${isAnimating ? 'scale-95 bg-telegram-primary/90' : ''}
        `}
        onClick={handleAddToCart}
        disabled={isAnimating}
      >
        В корзину
      </button>
    );
  }

  // Если товар в корзине - показываем quantity stepper
  return (
    <div className="w-full">
    <div className="flex items-center justify-between w-full bg-gray-50 dark:bg-gray-900/50 rounded-lg p-1 border border-gray-200 dark:border-gray-700/50">
      <button
        className={`
          w-9 h-9 
          flex items-center justify-center 
          bg-white dark:bg-gray-800 
          text-gray-700 dark:text-gray-400 
          rounded-md 
          border border-gray-200 dark:border-gray-700/50
          transition-all duration-200
            hover:bg-telegram-primary hover:text-white hover:border-telegram-primary
          active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800 disabled:hover:text-gray-700
            ${isLongPressing ? 'scale-95' : ''}
        `}
        onClick={handleDecrease}
          onMouseDown={() => handleLongPressStart('decrease')}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
          onTouchStart={() => handleLongPressStart('decrease')}
        onTouchEnd={handleLongPressEnd}
        disabled={quantity <= 0}
      >
        <span className="text-lg font-medium leading-none">−</span>
      </button>

      {showQuantityInput ? (
        <input
          type="number"
          value={quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          onBlur={() => setShowQuantityInput(false)}
            onKeyDown={(e) => e.key === 'Enter' && setShowQuantityInput(false)}
          className="w-12 mx-2 text-center text-sm font-semibold text-gray-900 dark:text-gray-200 bg-transparent outline-none"
          min={0}
          max={maxQuantity}
          autoFocus
        />
      ) : (
        <span 
          className="min-w-[3rem] text-center text-sm font-semibold text-gray-900 dark:text-gray-200 select-none cursor-pointer"
          onDoubleClick={handleQuantityTap}
        >
          {quantity}
        </span>
      )}

      <button
        className={`
          w-9 h-9 
          flex items-center justify-center 
          bg-white dark:bg-gray-800 
          text-gray-700 dark:text-gray-400 
          rounded-md 
          border border-gray-200 dark:border-gray-700/50
          transition-all duration-200
            hover:bg-telegram-primary hover:text-white hover:border-telegram-primary
          active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800 disabled:hover:text-gray-700
            ${isLongPressing ? 'scale-95' : ''}
        `}
        onClick={handleIncrease}
          onMouseDown={() => handleLongPressStart('increase')}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
          onTouchStart={() => handleLongPressStart('increase')}
        onTouchEnd={handleLongPressEnd}
        disabled={quantity >= maxQuantity}
      >
        <span className="text-lg font-medium leading-none">+</span>
      </button>
      </div>
      
      {quantity >= maxQuantity && (
        <div className="text-xs text-orange-600 dark:text-orange-400 text-center mt-1">
          Максимум {maxQuantity} шт.
        </div>
      )}
    </div>
  );
} 