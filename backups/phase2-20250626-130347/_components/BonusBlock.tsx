'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconComponent } from '@/components/webapp/IconComponent';

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

import { useTelegramAuth } from "@/context/TelegramAuthContext";

export default function BonusBlock() {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useTelegramAuth();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && authUser?.tg_id) {
      fetchLoyaltyData();
    }
  }, [isAuthenticated, authUser]);

  // Закрываем модальные окна при размонтировании компонента
  useEffect(() => {
    const handleRouteChange = () => {
      setShowTierModal(false);
      setShowInfoModal(false);
    };

    window.addEventListener('beforeunload', handleRouteChange);
    
    return () => {
      setShowTierModal(false);
      setShowInfoModal(false);
      window.removeEventListener('beforeunload', handleRouteChange);
    };
  }, []);

  // Обработка клавиши Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowTierModal(false);
        setShowInfoModal(false);
      }
    };

    if (showTierModal || showInfoModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showTierModal, showInfoModal]);

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
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!loyaltyData?.user.current_tier || !loyaltyData?.user.next_tier) return 0;
    
    const currentOrders = loyaltyData.user.order_count;
    const currentThreshold = loyaltyData.user.current_tier.order_threshold;
    const nextThreshold = loyaltyData.user.next_tier.order_threshold;
    
    if (currentOrders >= nextThreshold) return 100;
    
    const progress = ((currentOrders - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#48C928'; // Зеленый
    if (progress >= 50) return '#FFA929'; // Оранжевый
    return '#48C928'; // Зеленый по умолчанию
  };

  const getTierIcon = (tierTitle: string) => {
    const title = tierTitle?.toLowerCase();
    if (title?.includes('бронз') || title?.includes('bronze')) return '🥉';
    if (title?.includes('серебр') || title?.includes('silver')) return '🥈';
    if (title?.includes('золот') || title?.includes('gold')) return '🥇';
    if (title?.includes('платин') || title?.includes('platinum')) return '💎';
    if (title?.includes('алмаз') || title?.includes('diamond')) return '💍';
    return '🏆';
  };

  if (loading) {
    return (
      <div className="modern-bonus-block">
        <div className="bonus-skeleton">
          <div className="skeleton-line short"></div>
          <div className="skeleton-line medium"></div>
          <div className="skeleton-line long"></div>
          <div className="skeleton-progress"></div>
        </div>
      </div>
    );
  }

  if (!loyaltyData) return null;

  const { user } = loyaltyData;
  const currentTier = user.current_tier;
  const nextTier = user.next_tier;
  const progress = calculateProgress();

  return (
    <>
      <div className="modern-bonus-block">
        {/* Заголовок с информацией */}
        <div className="bonus-header">
          <div className="bonus-title-group">
            <h3 className="bonus-title">Бонусная система</h3>
            <button 
              className="info-button"
              onClick={() => setShowInfoModal(true)}
              aria-label="Информация о бонусной системе"
            >
              <IconComponent name="help" size={16} />
            </button>
          </div>
          
          <div className="bonus-balance-group">
            <div className="bonus-balance-label">Ваши бонусы</div>
            <div className="bonus-balance-amount">{user.bonus_balance}₽</div>
          </div>
        </div>

        {/* Информация об уровне */}
        {currentTier && (
          <div className="bonus-tier-section">
            <div className="current-tier-info">
              <div className="tier-badge">
                <span className="tier-icon">{getTierIcon(currentTier.title)}</span>
                <div className="tier-details">
                  <div className="tier-name">{currentTier.title}</div>
                  <div className="tier-benefit">Кэшбек {currentTier.bonus_percentage}%</div>
                </div>
              </div>
              
              <button 
                className="view-all-tiers"
                onClick={() => setShowTierModal(true)}
              >
                <span>Все уровни</span>
                <IconComponent name="right" size={14} />
              </button>
            </div>

            {/* Прогресс до следующего уровня */}
            {nextTier && (
              <div className="progress-section">
                <div className="progress-header">
                  <div className="progress-label">
                    До уровня "{nextTier.title}"
                  </div>
                  <div className="progress-counter">
                    {nextTier.orders_to_next} {nextTier.orders_to_next === 1 ? 'заказ' : 
                     nextTier.orders_to_next < 5 ? 'заказа' : 'заказов'}
                  </div>
                </div>
                
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: getProgressColor(progress)
                    }}
                  />
                </div>
                
                <div className="progress-milestones">
                  <span className="milestone current">
                    {user.order_count} заказов
                  </span>
                  <span className="milestone target">
                    {nextTier.order_threshold} заказов
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Стартовый экран для новых пользователей */}
        {!currentTier && (
          <div className="welcome-section">
            <div className="welcome-icon">🎉</div>
            <div className="welcome-content">
              <h4>Добро пожаловать в бонусную программу!</h4>
              <p>Совершите первый заказ и начните получать кэшбек с каждой покупки</p>
              <button 
                className="learn-more-btn"
                onClick={() => setShowTierModal(true)}
              >
                Узнать больше
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно с информацией о бонусной системе */}
      {showInfoModal && (
        <div 
          className="bonus-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInfoModal(false);
            }
          }}
        >
          <div className="bonus-modal">
            <div className="modal-header">
              <h3>О бонусной системе</h3>
              <button 
                className="modal-close"
                onClick={() => setShowInfoModal(false)}
              >
                <IconComponent name="close" size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="info-section">
                <div className="info-icon">💰</div>
                <div className="info-text">
                  <h4>Как работают бонусы?</h4>
                  <p>За каждую покупку вы получаете кэшбек в виде бонусных рублей. Чем выше ваш уровень, тем больше процент кэшбека.</p>
                </div>
              </div>
              
              <div className="info-section">
                <div className="info-icon">⬆️</div>
                <div className="info-text">
                  <h4>Как повысить уровень?</h4>
                  <p>Совершайте заказы! Каждый заказ приближает вас к следующему уровню и увеличивает процент кэшбека.</p>
                </div>
              </div>
              
              <div className="info-section">
                <div className="info-icon">💎</div>
                <div className="info-text">
                  <h4>Как использовать бонусы?</h4>
                  <p>Накопленные бонусы можно использовать для оплаты следующих заказов. 1 бонус = 1 рубль.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно с уровнями лояльности */}
      {showTierModal && (
        <div 
          className="bonus-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTierModal(false);
            }
          }}
        >
          <div className="bonus-modal">
            <div className="modal-header">
              <h3>Уровни лояльности</h3>
              <button 
                className="modal-close"
                onClick={() => setShowTierModal(false)}
              >
                <IconComponent name="close" size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="tiers-list">
                {loyaltyData.all_tiers?.map((tier: AccountTier, index: number) => (
                  <div 
                    key={tier.id} 
                    className={`tier-card ${currentTier?.id === tier.id ? 'current' : ''} ${
                      user.order_count >= tier.order_threshold ? 'achieved' : 'locked'
                    }`}
                  >
                    <div className="tier-card-header">
                      <div className="tier-card-icon">
                        {getTierIcon(tier.title)}
                      </div>
                      <div className="tier-card-info">
                        <div className="tier-card-name">{tier.title}</div>
                        <div className="tier-card-benefit">Кэшбек {tier.bonus_percentage}%</div>
                      </div>
                      <div className="tier-card-status">
                        {currentTier?.id === tier.id && (
                          <span className="status-badge current">Текущий</span>
                        )}
                        {user.order_count >= tier.order_threshold && currentTier?.id !== tier.id && (
                          <span className="status-badge achieved">Достигнут</span>
                        )}
                        {user.order_count < tier.order_threshold && (
                          <span className="status-badge locked">Заблокирован</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="tier-card-requirement">
                      От {tier.order_threshold} {tier.order_threshold === 1 ? 'заказа' : 
                         tier.order_threshold < 5 ? 'заказов' : 'заказов'}
                    </div>
                    
                    {tier.id === nextTier?.id && (
                      <div className="tier-card-progress">
                        <div className="progress-info">
                          Осталось: {nextTier.orders_to_next} {nextTier.orders_to_next === 1 ? 'заказ' : 
                                   nextTier.orders_to_next < 5 ? 'заказа' : 'заказов'}
                        </div>
                        <div className="mini-progress-bar">
                          <div 
                            className="mini-progress-fill"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}