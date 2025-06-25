"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconComponent } from "@/components/webapp/IconComponent";

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
}

export function CartSummary() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();

  // Загрузка корзины и отслеживание изменений
  useEffect(() => {
    const loadCart = () => {
      const storedCart = localStorage.getItem('webapp_cart');
      if (storedCart) {
        const items: CartItem[] = JSON.parse(storedCart);
        setCartItems(items);
        setTotalPrice(items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0));
        setTotalCount(items.reduce((sum, item) => sum + item.quantity, 0));
      } else {
        setCartItems([]);
        setTotalPrice(0);
        setTotalCount(0);
      }
    };

    // Загружаем при монтировании
    loadCart();

    // Слушаем изменения localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'webapp_cart') {
        loadCart();
      }
    };

    // Слушаем кастомное событие для изменений корзины
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Слушаем состояние модальных окон для скрытия плашки
  useEffect(() => {
    const handleModalStateChange = (event: any) => {
      setIsModalOpen(event.detail?.isModalOpen || false);
    };

    window.addEventListener('modalStateChanged', handleModalStateChange);

    return () => {
      window.removeEventListener('modalStateChanged', handleModalStateChange);
    };
  }, []);

  // Проверяем, нужно ли показывать плашку
  const shouldShow = cartItems.length > 0 && pathname !== '/webapp/cart' && !isModalOpen;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="cart-summary visible">
      <Link href="/webapp/cart" className="cart-summary-link">
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