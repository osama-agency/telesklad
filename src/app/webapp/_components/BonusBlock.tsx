'use client';

import { useState, useEffect } from 'react';

interface AccountTier {
  id: string;
  title: string;
  bonus_percentage: number;
  order_threshold: number;
  orders_to_next?: number;
}

interface LoyaltyData {
  user: {
    id: string;
    bonus_balance: number;
    order_count: number;
    current_tier: AccountTier | null;
    next_tier: AccountTier | null;
  };
  settings: {
    bonus_threshold: number;
    delivery_price: number;
  };
  all_tiers: AccountTier[];
}

const getTelegramUserData = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  // Для разработки используем тестового пользователя
  return { id: 9999 };
};

export default function BonusBlock() {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTierModal, setShowTierModal] = useState(false);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bonus-block animate-pulse">
        <div className="p-5">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </div>
      </div>
    );
  }

  if (!loyaltyData) return null;

  const { user } = loyaltyData;
  const currentTier = user.current_tier;
  const nextTier = user.next_tier;

  return (
    <>
      <div className="bonus-block">
        <div className="p-5">
          <div className="text-sm text-gray-600 mb-1">Ваши бонусы</div>
          <div className="bonus-balance">{user.bonus_balance}₽</div>
          
          {currentTier && (
            <div 
              className="account-tier"
              onClick={() => setShowTierModal(true)}
            >
              <span>Уровень: {currentTier.title}</span>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 12l-4-4h8l-4 4z"/>
              </svg>
            </div>
          )}
        </div>
        
        {currentTier && (
          <div className="bonus-block-footer">
            <div className="text-sm mb-1">
              Кэшбек с покупок: {currentTier.bonus_percentage}%
            </div>
            {nextTier && (
              <div className="text-xs opacity-80">
                До уровня &quot;{nextTier.title}&quot;: {nextTier.orders_to_next} заказов
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно с информацией об уровнях */}
      {showTierModal && (
        <div className="modal-account-tier open">
          <div className="modal-wrapper">
            <div className="modal-title">
              <h3>Уровни лояльности</h3>
              <button 
                className="close"
                onClick={() => setShowTierModal(false)}
              >
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {loyaltyData.all_tiers?.map((tier: AccountTier) => (
                <div 
                  key={tier.id} 
                  className={`modal-body ${currentTier?.id === tier.id ? 'bg-green-50 border-green-200' : ''}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="title">{tier.title}</div>
                    {currentTier?.id === tier.id && (
                      <div className="text-xs text-green-600 font-semibold">Текущий</div>
                    )}
                  </div>
                  <div className="desc text-gray-600">
                    Кэшбек: {tier.bonus_percentage}% • От {tier.order_threshold} заказов
                  </div>
                  {tier.id === nextTier?.id && (
                    <div className="text-xs text-blue-600 mt-1">
                      До этого уровня: {nextTier.orders_to_next} заказов
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 