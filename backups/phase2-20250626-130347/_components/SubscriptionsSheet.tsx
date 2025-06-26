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
        <div className="error-container">
          <div className="error-banner">
            <IconComponent name="warning" size={16} />
            Необходима авторизация для просмотра подписок
          </div>
        </div>
      ) : isLoading ? (
        <div className="loading-container">
          <SubscriptionItemsSkeleton count={3} />
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-banner">
            <IconComponent name="warning" size={16} />
            {error}
          </div>
          <button onClick={loadSubscriptions} className="retry-btn">
            Попробовать снова
          </button>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="empty-state">
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
                      <div className="spinner" />
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

      <style jsx>{`
        /* Стили для компонента skeleton подписок */
        .subscription-skeleton-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px 0;
        }

        .subscription-skeleton-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #F9FAFB;
          border-radius: 12px;
          border: 1px solid #F3F4F6;
        }

        .skeleton-image {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          background: #E5E7EB;
          border-radius: 8px;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .skeleton-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .skeleton-title {
          height: 18px;
          background: #E5E7EB;
          border-radius: 4px;
          width: 80%;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .skeleton-price {
          height: 16px;
          background: #E5E7EB;
          border-radius: 4px;
          width: 60%;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .skeleton-availability {
          height: 14px;
          background: #E5E7EB;
          border-radius: 4px;
          width: 70%;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .skeleton-date {
          height: 12px;
          background: #E5E7EB;
          border-radius: 4px;
          width: 50%;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .skeleton-action {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          background: #E5E7EB;
          border-radius: 6px;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .loading-container {
          padding: 20px 0;
          min-height: 200px; /* Минимальная высота для предотвращения прыжков */
          transition: all 0.3s ease; /* Плавный переход */
        }

        .error-container {
          padding: 20px 0;
          min-height: 120px; /* Минимальная высота для ошибок */
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .retry-btn {
          width: 100%;
          padding: 12px 16px;
          background: #48C928;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .retry-btn:hover {
          background: #3AA120;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          min-height: 200px; /* Минимальная высота для пустого состояния */
        }

        .empty-state-icon {
          color: #9CA3AF;
          margin-bottom: 16px;
        }

        .empty-state-title {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .empty-state-subtitle {
          color: #6B7280;
          line-height: 1.5;
          max-width: 300px;
        }

        .subscriptions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.3s ease; /* Плавный переход */
        }

        .subscriptions-header {
          padding-bottom: 16px;
          border-bottom: 1px solid #F3F4F6;
        }

        .subscriptions-count {
          color: #6B7280;
          font-size: 14px;
          margin: 0;
        }

        .subscriptions-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .subscription-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #F9FAFB;
          border-radius: 12px;
          border: 1px solid #F3F4F6;
          transition: all 0.2s ease;
          opacity: 1;
        }

        .subscription-item.deleting {
          pointer-events: none;
          opacity: 0.6;
          background: #FEF2F2;
          border-color: #FECACA;
        }

        .subscription-item.animate-out {
          opacity: 0;
          transform: scale(0.95);
        }

        .subscription-image {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        .product-image-placeholder {
          width: 100%;
          height: 100%;
          background: #E5E7EB;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9CA3AF;
        }

        .subscription-info {
          flex: 1;
          min-width: 0;
        }

        .product-name {
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .product-price {
          font-weight: 600;
          color: #48C928;
          margin-bottom: 4px;
        }

        .product-availability {
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 4px;
        }

        .subscription-date {
          font-size: 12px;
          color: #9CA3AF;
        }

        .subscription-actions {
          flex-shrink: 0;
          display: flex;
          align-items: flex-start;
        }

        .unsubscribe-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 6px;
          color: #DC2626;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .unsubscribe-btn:hover:not(:disabled) {
          background: #FEE2E2;
          border-color: #FCA5A5;
        }

        .unsubscribe-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .unsubscribe-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .unsubscribe-btn.loading {
          background: #FEF2F2;
          border-color: #FECACA;
          opacity: 0.7;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #FECACA;
          border-top: 2px solid #DC2626;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Адаптивность */
        @media (max-width: 640px) {
          .subscription-item, .subscription-skeleton-item {
            padding: 12px;
          }

          .subscription-image, .skeleton-image {
            width: 50px;
            height: 50px;
          }

          .product-name {
            font-size: 14px;
          }
        }
      `}</style>
    </Sheet>
  );
};

export default SubscriptionsSheet; 