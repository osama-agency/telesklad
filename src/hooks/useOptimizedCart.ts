import { useState, useEffect, useCallback, useMemo } from 'react';

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  image_url?: string;
}

interface UseOptimizedCartReturn {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;
}

const CART_STORAGE_KEY = 'webapp_cart';
const DEBOUNCE_DELAY = 300;

// Debounced localStorage update
let updateTimeout: NodeJS.Timeout | null = null;

const debouncedUpdateStorage = (cart: CartItem[]) => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  
  updateTimeout = setTimeout(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      // Уведомляем другие компоненты об изменении корзины
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    } catch (error) {
      console.error('Failed to update cart in localStorage:', error);
    }
  }, DEBOUNCE_DELAY);
};

export function useOptimizedCart(): UseOptimizedCartReturn {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Загружаем корзину из localStorage только один раз
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(Array.isArray(parsedCart) ? parsedCart : []);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      setCart([]);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Сохраняем корзину в localStorage с debouncing
  useEffect(() => {
    if (isInitialized) {
      debouncedUpdateStorage(cart);
    }
  }, [cart, isInitialized]);

  // Мемоизированные вычисления
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product_price * item.quantity), 0);
  }, [cart]);

  // Оптимизированные функции
  const addToCart = useCallback((newItem: Omit<CartItem, 'id'>) => {
    setCart(currentCart => {
      const existingIndex = currentCart.findIndex(item => item.product_id === newItem.product_id);
      
      if (existingIndex >= 0) {
        // Обновляем существующий товар
        const updatedCart = [...currentCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + newItem.quantity
        };
        return updatedCart;
      } else {
        // Добавляем новый товар
        return [...currentCart, { ...newItem, id: Date.now() }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart(currentCart => currentCart.filter(item => item.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(currentCart => {
      const existingIndex = currentCart.findIndex(item => item.product_id === productId);
      
      if (existingIndex >= 0) {
        const updatedCart = [...currentCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity
        };
        return updatedCart;
      }
      
      return currentCart;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getItemQuantity = useCallback((productId: number) => {
    const item = cart.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  }, [cart]);

  return {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity
  };
} 