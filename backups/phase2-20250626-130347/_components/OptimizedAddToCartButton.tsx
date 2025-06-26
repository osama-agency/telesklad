"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useOptimizedCart } from "@/hooks/useOptimizedCart";

interface OptimizedAddToCartButtonProps {
  productId: number;
  productName: string;
  productPrice: number;
  maxQuantity?: number;
  imageUrl?: string;
}

export const OptimizedAddToCartButton = memo(function OptimizedAddToCartButton({ 
  productId, 
  productName, 
  productPrice, 
  maxQuantity = 99,
  imageUrl
}: OptimizedAddToCartButtonProps) {
  const { getItemQuantity, updateQuantity, addToCart } = useOptimizedCart();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const quantity = getItemQuantity(productId);

  // Haptic feedback - мемоизированная функция
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Добавить в корзину (первый клик)
  const handleAddToCart = useCallback(() => {
    if (quantity === 0) {
      setIsAnimating(true);
      triggerHaptic('medium');
      
      addToCart({
        product_id: productId,
        product_name: productName,
        product_price: productPrice,
        quantity: 1,
        image_url: imageUrl
      });
      
      // Анимация завершается через 300ms
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [quantity, productId, productName, productPrice, imageUrl, addToCart, triggerHaptic]);

  // Увеличить количество
  const handleIncrease = useCallback(() => {
    if (quantity < maxQuantity) {
      triggerHaptic('light');
      updateQuantity(productId, quantity + 1);
    } else {
      triggerHaptic('heavy'); // Вибрация при достижении лимита
    }
  }, [quantity, maxQuantity, productId, updateQuantity, triggerHaptic]);

  // Уменьшить количество
  const handleDecrease = useCallback(() => {
    if (quantity > 0) {
      triggerHaptic('light');
      updateQuantity(productId, quantity - 1);
    }
  }, [quantity, productId, updateQuantity, triggerHaptic]);

  // Быстрое редактирование количества
  const handleQuantityTap = useCallback(() => {
    setShowQuantityInput(true);
  }, []);

  // Обработка ввода количества
  const handleQuantityChange = useCallback((value: string) => {
    const newQuantity = Math.min(Math.max(parseInt(value) || 0, 0), maxQuantity);
    updateQuantity(productId, newQuantity);
    setShowQuantityInput(false);
    triggerHaptic('medium');
  }, [maxQuantity, productId, updateQuantity, triggerHaptic]);

  // Long press для быстрого добавления
  const handleLongPressStart = useCallback((action: 'increase' | 'decrease') => {
    setIsLongPressing(true);
    const timer = setInterval(() => {
      if (action === 'increase') {
        const current = getItemQuantity(productId);
        if (current < maxQuantity) {
          triggerHaptic('light');
          updateQuantity(productId, current + 1);
        }
      } else if (action === 'decrease') {
        const current = getItemQuantity(productId);
        if (current > 0) {
          triggerHaptic('light');
          updateQuantity(productId, current - 1);
        }
      }
    }, 150); // Быстрое повторение каждые 150ms
    
    setLongPressTimer(timer);
  }, [productId, maxQuantity, updateQuantity, getItemQuantity, triggerHaptic]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer) {
      clearInterval(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(false);
  }, [longPressTimer]);

  // Cleanup long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearInterval(longPressTimer);
      }
    };
  }, [longPressTimer]);

  // Если товара нет в корзине - показываем кнопку "В корзину"
  if (quantity === 0) {
    return (
      <button 
        className={`add-to-cart-btn ${isAnimating ? 'animating' : ''}`}
        onClick={handleAddToCart}
        disabled={isAnimating}
      >
        <span className="btn-text">В корзину</span>
        <div className="btn-particles"></div>
      </button>
    );
  }

  // Если товар в корзине - показываем quantity stepper
  return (
    <div className="quantity-stepper-container">
      <div className="quantity-stepper">
        <button 
          className={`qty-btn minus ${quantity <= 0 ? 'disabled' : ''} ${isLongPressing ? 'long-pressing' : ''}`}
          onClick={handleDecrease}
          onMouseDown={() => handleLongPressStart('decrease')}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchStart={() => handleLongPressStart('decrease')}
          onTouchEnd={handleLongPressEnd}
          disabled={quantity <= 0}
        >
          <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor">
            <rect width="12" height="2" rx="1"/>
          </svg>
        </button>
        
        <div className="qty-display-container">
          {showQuantityInput ? (
            <input 
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              onBlur={() => setShowQuantityInput(false)}
              onKeyDown={(e) => e.key === 'Enter' && setShowQuantityInput(false)}
              className="qty-input"
              min="0"
              max={maxQuantity}
              autoFocus
            />
          ) : (
            <span 
              className="qty-display"
              onDoubleClick={handleQuantityTap}
            >
              {quantity}
            </span>
          )}
        </div>
        
        <button 
          className={`qty-btn plus ${quantity >= maxQuantity ? 'disabled' : ''} ${isLongPressing ? 'long-pressing' : ''}`}
          onClick={handleIncrease}
          onMouseDown={() => handleLongPressStart('increase')}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchStart={() => handleLongPressStart('increase')}
          onTouchEnd={handleLongPressEnd}
          disabled={quantity >= maxQuantity}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="5" y="0" width="2" height="12" rx="1"/>
            <rect x="0" y="5" width="12" height="2" rx="1"/>
          </svg>
        </button>
      </div>
      
      {quantity >= maxQuantity && (
        <div className="qty-limit-warning">
          Максимум {maxQuantity} шт.
        </div>
      )}
    </div>
  );
}); 