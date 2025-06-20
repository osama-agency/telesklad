"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconComponent } from "@/components/webapp/IconComponent";

interface CartItemProps {
  item: {
    id: number;
    product_id: number;
    product_name: string;
    product_price: number;
    quantity: number;
    image_url?: string;
  };
  onUpdateQuantity: (productId: number, direction: 'up' | 'down') => void;
}

export function CartItemComponent({ item, onUpdateQuantity }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Haptic feedback
  const triggerHaptic = (type: 'light' | 'medium' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Обработчик изменения количества с haptic feedback
  const handleQuantityChange = async (direction: 'up' | 'down') => {
    setIsUpdating(true);
    triggerHaptic('light');
    
    // Небольшая задержка для визуального feedback
    setTimeout(() => {
      onUpdateQuantity(item.product_id, direction);
      setIsUpdating(false);
    }, 100);
  };

  // Long press обработчики
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const handleLongPressStart = (direction: 'up' | 'down') => {
    setIsLongPressing(true);
    const timer = setInterval(() => {
      triggerHaptic('light');
      onUpdateQuantity(item.product_id, direction);
    }, 150);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearInterval(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(false);
  };

  const totalItemPrice = item.product_price * item.quantity;

  return (
    <div className="cart-item">
      {/* Левая часть: изображение и информация о товаре */}
      <div className="flex items-center gap-4">
        {/* Изображение товара - точно как в Rails */}
        <div className="cart-item-image">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.product_name}
              width={72}
              height={72}
              className="object-cover"
            />
          ) : (
            <div className="cart-item-placeholder">
              <IconComponent name="no-image" size={32} />
            </div>
          )}
        </div>

        {/* Информация о товаре */}
        <div className="cart-item-info">
          <Link href={`/webapp/products/${item.product_id}`}>
            {item.product_name}
          </Link>
          <div className="cart-item-price">
            {Math.floor(item.product_price)}₽/шт
          </div>
        </div>
      </div>

      {/* Правая часть: управление количеством - точно как в Rails */}
      <div className="cart-quantity-controls">
        <button
          className={`buy-btn ${item.quantity <= 1 ? 'disabled' : ''}`}
          onClick={() => handleQuantityChange('down')}
          onMouseDown={() => handleLongPressStart('down')}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchStart={() => handleLongPressStart('down')}
          onTouchEnd={handleLongPressEnd}
          disabled={isUpdating || item.quantity <= 1}
        >
          <div className="minus-ico"></div>
        </button>

        {/* Количество и общая стоимость - точный Rails формат */}
        <div className="cart-quantity-info">
          <div className="count">
            {item.quantity} шт
          </div>
          <div className="price">
            {Math.floor(totalItemPrice)}₽
          </div>
        </div>

        <button
          className="buy-btn"
          onClick={() => handleQuantityChange('up')}
          onMouseDown={() => handleLongPressStart('up')}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchStart={() => handleLongPressStart('up')}
          onTouchEnd={handleLongPressEnd}
          disabled={isUpdating}
        >
          <div className="plus-ico"></div>
        </button>
      </div>
    </div>
  );
} 