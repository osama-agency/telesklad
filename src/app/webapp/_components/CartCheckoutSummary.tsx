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

import { useTelegramAuth } from "@/context/TelegramAuthContext";

export default function CartCheckoutSummary({ onTotalChange, onBonusChange }: CartCheckoutSummaryProps) {
  const { user: authUser, isAuthenticated } = useTelegramAuth();
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
      if (!authUser?.tg_id) return;

      const response = await fetch(`/api/webapp/loyalty?tg_id=${authUser.tg_id}`);
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
    return <div className="animate-pulse h-32 bg-gray-200 rounded-2xl"></div>;
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

      {/* Улучшенный блок итогового расчета */}
      <div className="checkout-summary-card">
        <div className="summary-header">
          <div className="summary-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3 className="summary-title">Итого</h3>
        </div>
        
        <div className="summary-details">
          <div className="summary-row">
            <div className="summary-label">
              <span className="label-icon">🛍️</span>
              <span>Товары</span>
            </div>
            <div className="summary-value">{itemsTotal.toLocaleString('ru-RU')}₽</div>
          </div>
          
          {appliedBonus > 0 && (
            <div className="summary-row discount-row">
              <div className="summary-label">
                <span className="label-icon">🎁</span>
                <span>Скидка</span>
              </div>
              <div className="summary-value discount-value">-{appliedBonus.toLocaleString('ru-RU')}₽</div>
            </div>
          )}
          
          <div className="summary-row">
            <div className="summary-label">
              <span className="label-icon">🚚</span>
              <span>Доставка</span>
            </div>
            <div className="summary-value">{deliveryFee.toLocaleString('ru-RU')}₽</div>
          </div>
          
          <div className="summary-divider"></div>
          
          <div className="summary-row total-row">
            <div className="summary-label">
              <span className="label-icon">💰</span>
              <span>Итоговая стоимость</span>
            </div>
            <div className="summary-total">{finalTotal.toLocaleString('ru-RU')}₽</div>
          </div>
          
          {/* Информация о будущем кэшбеке */}
          {showFutureBonus && (
            <div className="future-bonus-card">
              <div className="bonus-icon">✨</div>
              <div className="bonus-content">
                <div className="bonus-text">Начислим кэшбек после оплаты</div>
                <div className="bonus-amount">{futureBonus.toLocaleString('ru-RU')}₽</div>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
} 