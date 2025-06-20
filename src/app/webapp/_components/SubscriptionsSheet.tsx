'use client';

import React, { useState, useEffect } from 'react';
import Sheet from '@/components/ui/sheet';
import { IconComponent } from '@/components/webapp/IconComponent';
import LoadingSpinner from './LoadingSpinner';

interface Product {
  id: number;
  name: string;
  price: number | null;
  image_url: string | null;
  category_id: number;
  category: {
    name: string;
  } | null;
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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем подписки при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      loadSubscriptions();
    }
  }, [isOpen]);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/webapp/subscriptions');
      const data = await response.json();

      if (data.success) {
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

  const handleUnsubscribe = async (subscriptionId: number) => {
    try {
      const response = await fetch(`/api/webapp/subscriptions/${subscriptionId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        // Обновляем список подписок
        setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
        
        // Уведомляем другие компоненты об обновлении
        window.dispatchEvent(new Event('subscriptionsUpdated'));
      } else {
        alert(data.error || 'Ошибка при отписке');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      alert('Ошибка при отписке');
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
      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner variant="default" size="lg" />
          <p>Загружаем ваши подписки...</p>
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
              <div key={subscription.id} className="subscription-item">
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
                  
                  {subscription.product.category && (
                    <div className="product-category">
                      {subscription.product.category.name}
                    </div>
                  )}
                  
                  <div className="product-price">
                    {formatPrice(subscription.product.price)}
                  </div>
                  
                  <div className="subscription-date">
                    Подписка с {formatDate(subscription.created_at)}
                  </div>
                </div>

                <div className="subscription-actions">
                  <button
                    onClick={() => handleUnsubscribe(subscription.id)}
                    className="unsubscribe-btn"
                    title="Отписаться"
                  >
                    <IconComponent name="close" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
        }

        .loading-container p {
          margin-top: 16px;
          color: #6B7280;
        }

        .error-container {
          padding: 20px 0;
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

        .product-category {
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 4px;
        }

        .product-price {
          font-weight: 600;
          color: #48C928;
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
          transition: all 0.2s;
        }

        .unsubscribe-btn:hover {
          background: #FEE2E2;
          border-color: #FCA5A5;
        }

        .unsubscribe-btn:active {
          transform: scale(0.95);
        }

        /* Адаптивность */
        @media (max-width: 640px) {
          .subscription-item {
            padding: 12px;
          }

          .subscription-image {
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