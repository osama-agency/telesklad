"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconComponent } from "@/components/webapp/IconComponent";

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
}

interface CartSummaryProps {
  isVisible: boolean;
  onHide: () => void;
}

export function CartSummary({ isVisible, onHide }: CartSummaryProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Симуляция загрузки корзины (в реальном проекте здесь будет API)
  useEffect(() => {
    if (isVisible) {
      // Временно используем localStorage для симуляции корзины
      const storedCart = localStorage.getItem('webapp_cart');
      if (storedCart) {
        const items: CartItem[] = JSON.parse(storedCart);
        setCartItems(items);
        setTotalPrice(items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0));
        setTotalCount(items.reduce((sum, item) => sum + item.quantity, 0));
      }
    }
  }, [isVisible]);

  // Обработчик клика на плашку (переход в корзину)
  const handleCartClick = () => {
    onHide(); // Скрываем плашку при переходе в корзину
  };

  if (!isVisible || cartItems.length === 0) {
    return null;
  }

  return (
    <div className={`cart-summary ${isVisible ? 'visible' : ''}`}>
      <Link href="/webapp/cart" className="cart-summary-link" onClick={handleCartClick}>
        <div className="container mx-auto px-5">
          <div className="py-3 flex justify-between items-center">
            <div className="flex justify-center gap-3">
              <div className="relative">
                <IconComponent name="cart" size={40} />
                <div className="cart-counter">{totalCount}</div>
              </div>
              <div>
                <div>Корзина {Math.floor(totalPrice)} ₽</div>
                <div>Перейти в корзину</div>
              </div>
            </div>
            <div className="right-arrow">
              <IconComponent name="arrow-right" size={24} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
} 