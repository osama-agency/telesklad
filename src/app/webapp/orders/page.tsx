'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconComponent } from '@/components/webapp/IconComponent';
import SkeletonLoading from '../_components/SkeletonLoading';
import LoadingSpinner from '../_components/LoadingSpinner';
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import Link from 'next/link';
import { webAppFetch } from '@/lib/utils/webapp-fetch';

interface Order {
  id: number;
  total_amount: number;
  status: 'unpaid' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'processing';
  status_label: string;
  created_at: string;
  paid_at?: string;
  shipped_at?: string;
  tracking_number?: string;
  has_delivery: boolean;
  bonus: number;
  msg_id?: number;
  bank_card?: {
    id: number;
    name: string;
    number: string;
  };
  items: Array<{
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
    image_url?: string;
  }>;
  items_count: number;
  total_items: number;
}

interface OrderStats {
  total_orders: number;
  unpaid_orders: number;
  paid_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_amount: number;
  total_bonus_earned: number;
}

interface OrdersApiResponse {
  success: boolean;
  orders: Order[];
  stats: OrderStats;
  count: number;
  error?: string;
}

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useTelegramAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Сбрасываем состояние навигации в родительском компоненте
    const resetNavigationState = () => {
      // Этот эффект сработает когда страница загрузится
      // ActionCards компонент будет размонтирован и состояние загрузки сбросится
    };
    
    resetNavigationState();
    
    // Set document title for Telegram Web App
    document.title = "История заказов";
    
    // Telegram Web App initialization
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#FFFFFF');
      tg.setBackgroundColor('#f9f9f9');
    }

    // Загрузка данных заказов из API
    const loadOrders = async () => {
      if (!authUser?.tg_id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await webAppFetch('/api/webapp/orders');
        
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
          setStats(data.stats);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Ошибка загрузки заказов');
        }
      } catch (err) {
        setError('Ошибка соединения');
        console.error('Orders loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && authUser?.tg_id) {
      loadOrders();
    }
  }, [isAuthenticated, authUser]);

  const handleBack = () => {
    router.back();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'unpaid':
        return {
          label: 'Ожидает оплаты',
          color: '#D97706',
          bgColor: '#FEF3C7',
          icon: 'clock'
        };
      case 'paid':
        return {
          label: 'Проверка оплаты',
          color: '#2563EB',
          bgColor: '#DBEAFE',
          icon: 'info'
        };
      case 'processing':
        return {
          label: 'Обрабатывается',
          color: '#7C3AED',
          bgColor: '#EDE9FE',
          icon: 'arrow-right'
        };
      case 'shipped':
        return {
          label: 'Отправлен',
          color: '#059669',
          bgColor: '#D1FAE5',
          icon: 'arrow-right'
        };
      case 'delivered':
        return {
          label: 'Доставлен',
          color: '#059669',
          bgColor: '#D1FAE5',
          icon: 'info'
        };
      case 'cancelled':
        return {
          label: 'Отменён',
          color: '#DC2626',
          bgColor: '#FEE2E2',
          icon: 'close'
        };
      default:
        return {
          label: 'Неизвестно',
          color: '#6B7280',
          bgColor: '#F3F4F6',
          icon: 'info'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="webapp-container">
        <div className="header-with-back">
          <button onClick={handleBack} className="back-btn">
            <IconComponent name="left" size={20} />
          </button>
          <h1>История заказов</h1>
        </div>
        
        <LoadingSpinner variant="page" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="webapp-container">
        <div className="header-with-back">
          <button onClick={handleBack} className="back-btn">
            <IconComponent name="left" size={20} />
          </button>
          <h1>История заказов</h1>
        </div>
        <div className="main-block">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="webapp-btn-secondary mt-4"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="webapp-container">
        <div className="header-with-back">
          <button onClick={handleBack} className="back-btn">
            <IconComponent name="left" size={20} />
          </button>
          <h1>История заказов</h1>
        </div>
        
        <div className="empty-state">
          <div className="empty-state-icon">
            <IconComponent name="cart2" size={64} />
          </div>
          <h3>Нет заказов</h3>
          <p>Когда вы сделаете первый заказ, он появится здесь</p>
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
        <h1>История заказов</h1>
      </div>

      {stats && (
        <div className="orders-stats fade-in">
          <div className="stat-item">
            <span className="stat-value">{stats.total_orders}</span>
            <span className="stat-label">Всего заказов</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {formatPrice(stats.total_amount)}
            </span>
            <span className="stat-label">Общая сумма</span>
          </div>
        </div>
      )}

      <div className="orders-list fade-in">
        {orders.map(order => {
          const statusInfo = getStatusInfo(order.status);
          
          return (
            <div key={order.id} className="order-item">
              <div className="order-header">
                <div className="order-number">
                  <span className="order-label">Заказ</span>
                  <span className="order-value">#{order.id}</span>
                </div>
                <div className="order-date">
                  {formatDate(order.created_at)}
                </div>
              </div>

              <div className="order-content">
                <div className="order-summary">
                  <div className="order-amount">
                    <span className="amount-value">{formatPrice(order.total_amount)}</span>
                    <span className="items-count">
                      {order.total_items} {order.total_items === 1 ? 'товар' : order.total_items < 5 ? 'товара' : 'товаров'}
                    </span>
                  </div>

                  <div className="order-status">
                    <span 
                      className="status-badge"
                      style={{ 
                        color: statusInfo.color,
                        backgroundColor: statusInfo.bgColor
                      }}
                    >
                      <IconComponent name={statusInfo.icon} size={12} />
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Список товаров */}
                {order.items && order.items.length > 0 && (
                  <div className="order-items">
                    <div className="items-header">Товары в заказе:</div>
                    <div className="items-list">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item-row">
                          {/* Изображение товара */}
                          <div className="item-image">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.product_name}
                                className="product-image"
                              />
                            ) : (
                              <div className="no-image-placeholder">
                                <IconComponent name="no-image" size={16} />
                              </div>
                            )}
                          </div>
                          
                          <div className="item-info">
                            <span className="item-name">{item.product_name}</span>
                            <span className="item-quantity">×{item.quantity}</span>
                          </div>
                          <span className="item-price">{formatPrice(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Дополнительная информация */}
                <div className="order-details">
                  {order.tracking_number && (
                    <div className="tracking-section">
                      <div className="detail-row">
                        <IconComponent name="right" size={14} />
                        <span className="detail-label">Трек-номер:</span>
                        <span className="detail-value">{order.tracking_number}</span>
                      </div>
                      <button 
                        onClick={() => window.open(`https://track24.ru/tracking/${order.tracking_number}`, '_blank')}
                        className="track-button"
                      >
                        <IconComponent name="right" size={16} />
                        Отследить посылку
                      </button>
                    </div>
                  )}
                  
                  {order.paid_at && (
                    <div className="detail-row">
                      <IconComponent name="info" size={14} />
                      <span className="detail-label">Проверка оплаты:</span>
                      <span className="detail-value">{formatDate(order.paid_at)}</span>
                    </div>
                  )}
                  
                  {order.shipped_at && (
                    <div className="detail-row">
                      <IconComponent name="arrow-right" size={14} />
                      <span className="detail-label">Отправлен:</span>
                      <span className="detail-value">{formatDate(order.shipped_at)}</span>
                    </div>
                  )}
                  
                  {order.bonus > 0 && (
                    <div className="detail-row bonus-row">
                      <IconComponent name="star" size={14} />
                      <span className="detail-label">Бонусы:</span>
                      <span className="detail-value bonus-value">+{order.bonus}₽</span>
                    </div>
                  )}
                </div>
              </div>


            </div>
          );
        })}
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

        .orders-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .stat-item {
          background: white;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          border: 1px solid #f0f0f0;
        }

        .stat-value {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #48C928;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #6B7280;
          font-weight: 500;
        }

        .orders-list {
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

        .order-item {
          background: white;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          border: 1px solid #f0f0f0;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #F3F4F6;
        }

        .order-number {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .order-label {
          font-size: 11px;
          color: #9CA3AF;
          font-weight: 500;
          text-transform: uppercase;
        }

        .order-value {
          font-size: 14px;
          font-weight: 600;
          color: #1F2937;
        }

        .order-date {
          font-size: 12px;
          color: #6B7280;
          font-weight: 500;
        }

        .order-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 16px;
        }

        .order-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .order-amount {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .amount-value {
          font-size: 18px;
          font-weight: 700;
          color: #48C928;
        }

        .items-count {
          font-size: 12px;
          color: #6B7280;
          font-weight: 500;
        }

        .order-status {
          flex-shrink: 0;
        }

        /* Список товаров */
        .order-items {
          background: #F9FAFB;
          border-radius: 12px;
          padding: 12px;
        }

        .items-header {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .order-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
        }

        .item-image {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          overflow: hidden;
          margin-right: 12px;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image-placeholder {
          width: 100%;
          height: 100%;
          background-color: #F3F4F6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9CA3AF;
        }

        .item-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .item-name {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
          line-height: 1.3;
        }

        .item-quantity {
          font-size: 11px;
          color: #6B7280;
          font-weight: 600;
          background: #E5E7EB;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .item-price {
          font-size: 13px;
          font-weight: 600;
          color: #48C928;
        }

        /* Дополнительная информация */
        .order-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
        }

        .detail-label {
          font-size: 12px;
          color: #6B7280;
          font-weight: 500;
          min-width: 80px;
        }

        .detail-value {
          font-size: 12px;
          color: #374151;
          font-weight: 500;
        }

        .bonus-row {
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          border-radius: 8px;
          padding: 8px 12px;
          margin: 4px 0;
        }

        .bonus-value {
          color: #D97706;
          font-weight: 700;
        }

        /* Трек-номер и отслеживание */
        .tracking-section {
          background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%);
          border: 1px solid #BBF7D0;
          border-radius: 12px;
          padding: 12px;
          margin: 8px 0;
        }



        .track-button {
          width: 100%;
          margin-top: 8px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #48C928 0%, #3AA120 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .track-button:hover {
          background: linear-gradient(135deg, #3AA120 0%, #2E8B1C 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(72, 201, 40, 0.3);
        }

        .track-button:active {
          transform: scale(0.98);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
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
          .orders-stats {
            grid-template-columns: 1fr;
          }
          
          .order-item {
            padding: 14px;
          }
          
          .order-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .order-summary {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .order-items {
            padding: 10px;
          }
          
          .order-item-row {
            flex-wrap: wrap;
            gap: 4px;
          }
          
          .item-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .detail-row {
            gap: 6px;
          }
          
          .detail-label {
            min-width: 70px;
            font-size: 11px;
          }
          
          .detail-value {
            font-size: 11px;
          }
          
          .tracking-section {
            padding: 10px;
            margin: 6px 0;
          }
          

          
          .track-button {
            padding: 8px 12px;
            font-size: 12px;
            margin-top: 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default OrdersPage; 