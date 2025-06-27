'use client';

import React, { useState, useEffect } from 'react';
import Sheet from '@/components/ui/sheet';
import { IconComponent } from '@/components/webapp/IconComponent';
import toast from 'react-hot-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

// Специальный компонент скелетона для подписок
const SubscriptionItemsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="subscription-skeleton-container">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="subscription-skeleton-item">
          <div className="skeleton-image" />
          <div className="skeleton-content">
            <div className="skeleton-title" />
            <div className="skeleton-price" />
            <div className="skeleton-availability" />
            <div className="skeleton-date" />
          </div>
          <div className="skeleton-action" />
        </div>
      ))}
    </div>
  );
};

interface Product {
  id: number;
  name: string;
  price: number | null;
  old_price: number | null;
  quantity: number;
  available: boolean;
  image_url?: string;
}

interface Subscription {
  id: number;
  product_id: number;
  product: Product;
  created_at: string;
  updated_at: string;
}

interface SubscriptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionsSheet: React.FC<SubscriptionsSheetProps> = ({
  isOpen,
  onClose
}) => {
  const { user, isAuthenticated } = useTelegramAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());
  const [animatingOut, setAnimatingOut] = useState<Set<number>>(new Set());

  // Загружаем подписки при открытии модального окна
  useEffect(() => {
    if (isOpen && user?.tg_id) {
      loadSubscriptions();
    }
  }, [isOpen, user?.tg_id]);

  const loadSubscriptions = async () => {
    if (!user?.tg_id) {
      setError('Пользователь не аутентифицирован');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/webapp/subscriptions?tg_id=${user.tg_id}`);
      const data = await response.json();

      if (response.ok) {
        setSubscriptions(data.subscriptions || []);
      } else {
        setError(data.error || 'Ошибка загрузки подписок');
      }
    } catch (err) {
      setError('Ошибка загрузки подписок');
      console.error('Subscriptions loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Haptic feedback (только для мобильных устройств)
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const handleUnsubscribe = async (subscriptionId: number) => {
    // Haptic feedback
    triggerHaptic('light');
    
    // Показываем анимацию удаления
    setDeletingItems(prev => new Set([...prev, subscriptionId]));
    
    try {
      const response = await fetch(`/api/webapp/subscriptions/${subscriptionId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        // Запускаем анимацию исчезновения
        setAnimatingOut(prev => new Set([...prev, subscriptionId]));
        
        // Haptic feedback для успеха
        triggerHaptic('medium');
        
        // Через 300ms убираем элемент из списка
        setTimeout(() => {
          setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
          setDeletingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(subscriptionId);
            return newSet;
          });
          setAnimatingOut(prev => {
            const newSet = new Set(prev);
            newSet.delete(subscriptionId);
            return newSet;
          });
          
          // Уведомляем другие компоненты об обновлении (без перезагрузки)
          window.dispatchEvent(new CustomEvent('subscriptionsUpdated', {
            detail: { subscriptionId, action: 'deleted' }
          }));
        }, 300);
        
      } else {
        // Убираем состояние удаления при ошибке
        setDeletingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(subscriptionId);
          return newSet;
        });
        
        // Haptic feedback для ошибки
        triggerHaptic('heavy');
        
        // Показываем тост вместо alert
        toast.error(data.error || 'Ошибка при отписке');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      
      // Убираем состояние удаления при ошибке
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(subscriptionId);
        return newSet;
      });
      
      // Haptic feedback для ошибки
      triggerHaptic('heavy');
      
      toast.error('Ошибка при отписке');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Цена не указана';
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  return (
    <Sheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Товары в ожидании"
      className="subscriptions-sheet"
    >
      {!isAuthenticated || !user ? (
        <div className="subscriptions-error">
          <div className="error-banner">
            <IconComponent name="warning" size={16} />
            Необходима авторизация для просмотра подписок
          </div>
        </div>
      ) : isLoading ? (
        <div className="subscriptions-loading">
          <SubscriptionItemsSkeleton count={3} />
        </div>
      ) : error ? (
        <div className="subscriptions-error">
          <div className="error-banner">
            <IconComponent name="warning" size={16} />
            {error}
          </div>
          <button onClick={loadSubscriptions} className="retry-btn">
            Попробовать снова
          </button>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="subscriptions-empty">
          <div className="empty-state-icon">
            <IconComponent name="clock" size={48} />
          </div>
          <div className="empty-state-title">Нет товаров в ожидании</div>
          <div className="empty-state-subtitle">
            Подпишитесь на товары, которые временно отсутствуют, чтобы получить уведомление о поступлении
          </div>
        </div>
      ) : (
        <div className="subscriptions-list">
          <div className="subscriptions-header">
            <p className="subscriptions-count">
              {subscriptions.length} {subscriptions.length === 1 ? 'товар' : 
                subscriptions.length < 5 ? 'товара' : 'товаров'} в ожидании
            </p>
          </div>

          <div className="subscriptions-items">
            {subscriptions.map((subscription) => (
              <div 
                key={subscription.id} 
                className={`subscription-item ${
                  animatingOut.has(subscription.id) ? 'animate-out' : ''
                } ${deletingItems.has(subscription.id) ? 'deleting' : ''}`}
              >
                <div className="subscription-image">
                  {subscription.product.image_url ? (
                    <img 
                      src={subscription.product.image_url} 
                      alt={subscription.product.name}
                      className="product-image"
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      <IconComponent name="image" size={24} />
                    </div>
                  )}
                </div>

                <div className="subscription-info">
                  <div className="product-name">{subscription.product.name}</div>
                  
                  <div className="product-price">
                    {formatPrice(subscription.product.price)}
                  </div>
                  
                  <div className="product-availability">
                    {subscription.product.available ? 
                      `В наличии: ${subscription.product.quantity} шт.` : 
                      'Нет в наличии'
                    }
                  </div>
                  
                  <div className="subscription-date">
                    Подписка с {formatDate(subscription.created_at)}
                  </div>
                </div>

                <div className="subscription-actions">
                  <button
                    onClick={() => handleUnsubscribe(subscription.id)}
                    className={`unsubscribe-btn ${deletingItems.has(subscription.id) ? 'loading' : ''}`}
                    disabled={deletingItems.has(subscription.id)}
                    title={deletingItems.has(subscription.id) ? 'Удаление...' : 'Отписаться'}
                  >
                    {deletingItems.has(subscription.id) ? (
                      <div className="subscriptions-spinner" />
                    ) : (
                      <IconComponent name="close" size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Sheet>
  );
};

export default SubscriptionsSheet;
