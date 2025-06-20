'use client';

import { useState, useEffect } from 'react';
import BonusSelector from './BonusSelector';

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
}

interface LoyaltyData {
  user: {
    bonus_balance: number;
    current_tier: {
      bonus_percentage: number;
    } | null;
  };
  settings: {
    bonus_threshold: number;
    delivery_price: number;
  };
}

interface CartCheckoutSummaryProps {
  onTotalChange: (total: number) => void;
  onBonusChange: (bonus: number) => void;
}

const getTelegramUserData = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  // Для разработки используем тестового пользователя
  return { id: 9999 };
};

export default function CartCheckoutSummary({ onTotalChange, onBonusChange }: CartCheckoutSummaryProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [appliedBonus, setAppliedBonus] = useState(0);
  const [useDelivery, setUseDelivery] = useState(false);

  useEffect(() => {
    loadCart();
    fetchLoyaltyData();

    // Слушаем изменения корзины
    const handleCartUpdate = () => {
      // console.log('CartCheckoutSummary: Cart update event received');
      // Небольшая задержка чтобы убедиться что localStorage обновился
      setTimeout(() => {
        loadCart();
      }, 50);
    };

    // Слушаем фокус на странице для обновления данных
    const handlePageFocus = () => {
      loadCart();
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

  const loadCart = () => {
    const storedCart = localStorage.getItem('webapp_cart');
    if (storedCart) {
      const items: CartItem[] = JSON.parse(storedCart);
      // console.log('CartCheckoutSummary: Loading cart items:', items);
      setCartItems(items);
      
      // Автоматически добавляем доставку если в корзине 1 товар с количеством 1
      const needsDelivery = items.length === 1 && items[0].quantity === 1;
      setUseDelivery(needsDelivery);
    } else {
      // Если корзина пуста, сбрасываем состояние
      // console.log('CartCheckoutSummary: Cart is empty');
      setCartItems([]);
      setUseDelivery(false);
    }
  };

  const fetchLoyaltyData = async () => {
    try {
      const tgUser = getTelegramUserData();
      if (!tgUser?.id) return;

      const response = await fetch(`/api/webapp/loyalty?tg_id=${tgUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setLoyaltyData(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных лояльности:', error);
    }
  };

  // Вычисления
  const itemsTotal = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  const deliveryFee = useDelivery ? (loyaltyData?.settings.delivery_price || 500) : 0;
  const finalTotal = itemsTotal + deliveryFee - appliedBonus;
  
  // console.log('CartCheckoutSummary calculations:', {
  //   cartItems: cartItems.length,
  //   itemsTotal,
  //   deliveryFee,
  //   appliedBonus,
  //   finalTotal
  // });

  // Расчет будущего кэшбека
  const futureBonus = loyaltyData?.user.current_tier?.bonus_percentage 
    ? Math.floor((itemsTotal * loyaltyData.user.current_tier.bonus_percentage / 100) / 50) * 50
    : 0;

  const bonusThreshold = loyaltyData?.settings.bonus_threshold || 5000;
  const showFutureBonus = appliedBonus === 0 && 
                          loyaltyData?.user.current_tier && 
                          itemsTotal >= bonusThreshold && 
                          futureBonus > 0;

  // Уведомляем родительский компонент об изменениях
  useEffect(() => {
    onTotalChange(finalTotal);
  }, [finalTotal, onTotalChange]);

  useEffect(() => {
    onBonusChange(appliedBonus);
  }, [appliedBonus, onBonusChange]);

  // Сбрасываем примененные бонусы если корзина изменилась и они больше не применимы
  useEffect(() => {
    if (appliedBonus > 0 && (itemsTotal < bonusThreshold || appliedBonus > itemsTotal)) {
      setAppliedBonus(0);
    }
  }, [itemsTotal, appliedBonus, bonusThreshold]);

  const handleBonusChange = (amount: number) => {
    setAppliedBonus(amount);
  };

  if (!loyaltyData) {
    return <div className="animate-pulse h-32 bg-gray-200 rounded"></div>;
  }

  return (
    <div className="cart-checkout-summary">
      {/* Компонент выбора бонусов */}
      {loyaltyData.user.bonus_balance > 0 && (
        <BonusSelector
          userBonus={loyaltyData.user.bonus_balance}
          totalPrice={itemsTotal}
          bonusThreshold={bonusThreshold}
          onBonusChange={handleBonusChange}
        />
      )}

      {/* Итоговый расчет */}
      <div className="main-block">
        <h3 className="mb-4">Итого</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="price-title">Товары:</div>
            <div className="font-medium">{itemsTotal}₽</div>
          </div>
          
          {appliedBonus > 0 && (
            <div className="flex justify-between">
              <div className="price-title">Скидка:</div>
              <div className="font-medium green">-{appliedBonus}₽</div>
            </div>
          )}
          
          <div className="flex justify-between">
            <div className="price-title">Доставка:</div>
            <div className="font-medium">{deliveryFee}₽</div>
          </div>
          
          <hr className="my-3" />
          
          <div className="flex justify-between">
            <div className="price-title font-semibold">Итоговая стоимость:</div>
            <div className="end-price">{finalTotal}₽</div>
          </div>
          
          {/* Информация о будущем кэшбеке */}
          {showFutureBonus && (
            <div className="bonus-user-up mt-3">
              Начислим кэшбек после оплаты:
              <span className="price">{futureBonus}₽</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 