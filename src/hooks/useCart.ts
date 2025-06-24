import { useState, useEffect } from 'react';

interface CartItem {
  id: number;
  quantity: number;
  price: number;
}

interface Cart {
  items: CartItem[];
  total: number;
}

export function useCart() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });

  useEffect(() => {
    // Загрузка корзины из localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (e) {
        console.error('Ошибка при загрузке корзины:', e);
      }
    }
  }, []);

  return { cart };
} 