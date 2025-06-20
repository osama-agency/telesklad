'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconComponent } from '@/components/webapp/IconComponent';
import SkeletonLoading from '../_components/SkeletonLoading';

interface Product {
  id: number;
  title: string;
  price: number;
  old_price?: number;
  image_url?: string;
  is_available: boolean;
}

const SubscriptionsPage: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Сбрасываем состояние навигации в родительском компоненте
    const resetNavigationState = () => {
      // Этот эффект сработает когда страница загрузится
      // ActionCards компонент будет размонтирован и состояние загрузки сбросится
    };
    
    resetNavigationState();
    
    // Set document title for Telegram Web App
    document.title = "Товары в ожидании";
    
    // Telegram Web App initialization
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#FFFFFF');
      tg.setBackgroundColor('#f9f9f9');
    }

    // Загрузка данных подписок
    const loadSubscriptions = async () => {
      try {
        // Имитируем загрузку данных
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Мок данные
        const mockSubscriptions: Product[] = [
          {
            id: 1,
            title: "iPhone 15 Pro Max 256GB",
            price: 120000,
            old_price: 130000,
            image_url: undefined,
            is_available: false
          },
          {
            id: 2,
            title: "MacBook Air M3 13''",
            price: 95000,
            image_url: undefined,
            is_available: false
          },
          {
            id: 3,
            title: "AirPods Pro 2",
            price: 24990,
            image_url: undefined,
            is_available: true
          }
        ];
        
        setProducts(mockSubscriptions);
      } catch (error) {
        console.error('Error loading subscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleUnsubscribe = (productId: number) => {
    // Здесь будет запрос к API для отписки от уведомлений
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="webapp-container">
        <div className="header-with-back">
          <button onClick={handleBack} className="back-btn">
            <IconComponent name="left" size={20} />
          </button>
          <h1>Товары в ожидании</h1>
        </div>
        
        <SkeletonLoading type="subscription" count={3} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="webapp-container">
        <div className="header-with-back">
          <button onClick={handleBack} className="back-btn">
            <IconComponent name="left" size={20} />
          </button>
          <h1>Товары в ожидании</h1>
        </div>
        
        <div className="empty-state">
          <div className="empty-state-icon">
            <IconComponent name="clock" size={64} />
          </div>
          <h3>Нет товаров в ожидании</h3>
          <p>Когда вы добавите товары в список ожидания, они появятся здесь</p>
          <button 
            onClick={() => router.push('/webapp')}
            className="webapp-btn"
          >
            Перейти к каталогу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="webapp-container">
      <div className="header-with-back">
        <button onClick={handleBack} className="back-btn">
          <IconComponent name="left" size={20} />
        </button>
        <h1>Товары в ожидании</h1>
      </div>

      <div className="subscriptions-info fade-in">
        <p>Мы уведомим вас, когда эти товары появятся в наличии или изменится цена</p>
      </div>

      <div className="products-list fade-in">
        {products.map(product => (
          <div key={product.id} className="subscription-item">
            <div className="product-image">
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} />
              ) : (
                <IconComponent name="no-image" size={32} />
              )}
            </div>
            
            <div className="product-info">
              <h3 className="product-title">{product.title}</h3>
              <div className="product-price">
                <span className="current-price">{formatPrice(product.price)}</span>
                {product.old_price && (
                  <span className="old-price">{formatPrice(product.old_price)}</span>
                )}
              </div>
              
              <div className="product-status">
                {product.is_available ? (
                  <span className="status-available">
                    <IconComponent name="info" size={14} />
                    Товар поступил в продажу!
                  </span>
                ) : (
                  <span className="status-waiting">
                    <IconComponent name="clock" size={14} />
                    Ожидается поступление
                  </span>
                )}
              </div>
            </div>
            
            <div className="subscription-actions">
              {product.is_available ? (
                <button 
                  onClick={() => router.push(`/webapp/product/${product.id}`)}
                  className="btn-view"
                >
                  Посмотреть
                </button>
              ) : (
                <button 
                  onClick={() => handleUnsubscribe(product.id)}
                  className="btn-unsubscribe"
                  title="Отписаться от уведомлений"
                >
                  <IconComponent name="close" size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .header-with-back {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding: 0 4px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          background-color: #F3F4F6;
          border-radius: 10px;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background-color: #E5E7EB;
        }

        .back-btn:active {
          transform: scale(0.95);
        }

        .subscriptions-info {
          background: #EFF6FF;
          border: 1px solid #DBEAFE;
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 20px;
        }

        .subscriptions-info p {
          margin: 0;
          color: #1E40AF;
          font-size: 14px;
          line-height: 1.4;
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .subscription-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          border: 1px solid #f0f0f0;
        }

        .product-image {
          width: 60px;
          height: 60px;
          background: #F3F4F6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #9CA3AF;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        .product-info {
          flex: 1;
          min-width: 0;
        }

        .product-title {
          font-size: 14px;
          font-weight: 600;
          color: #1F2937;
          margin: 0 0 6px 0;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .product-price {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .current-price {
          font-weight: 700;
          font-size: 16px;
          color: #48C928;
        }

        .old-price {
          font-size: 12px;
          color: #9CA3AF;
          text-decoration: line-through;
        }

        .product-status {
          display: flex;
          align-items: center;
        }

        .status-available {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #059669;
          font-weight: 500;
        }

        .status-waiting {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #D97706;
          font-weight: 500;
        }

        .subscription-actions {
          flex-shrink: 0;
        }

        .btn-view {
          background: #48C928;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-view:hover {
          background: #3AA120;
        }

        .btn-unsubscribe {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: #FEF2F2;
          border-radius: 8px;
          color: #DC2626;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-unsubscribe:hover {
          background: #FEE2E2;
        }

        .btn-unsubscribe:active {
          transform: scale(0.95);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state-icon {
          margin-bottom: 20px;
          color: #D1D5DB;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          color: #6B7280;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        /* Адаптивность */
        @media (max-width: 640px) {
          .subscription-item {
            padding: 12px;
          }
          
          .product-image {
            width: 50px;
            height: 50px;
          }
          
          .product-title {
            font-size: 13px;
          }
          
          .current-price {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionsPage; 