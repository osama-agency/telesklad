'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconComponent } from '@/components/webapp/IconComponent';
import SkeletonLoading from '../_components/SkeletonLoading';

interface Order {
  id: number;
  total_amount: number;
  status: 'unpaid' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
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
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/webapp/orders');
        const data: OrdersApiResponse = await response.json();
        
        if (data.success) {
          setOrders(data.orders);
          setStats(data.stats);
        } else {
          setError(data.error || 'Ошибка загрузки заказов');
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        setError('Не удалось загрузить историю заказов. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

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
          label: 'Не оплачен',
          color: '#D97706',
          bgColor: '#FEF3C7',
          icon: 'clock'
        };
      case 'paid':
        return {
          label: 'Оплачен',
          color: '#2563EB',
          bgColor: '#DBEAFE',
          icon: 'info'
        };
      case 'shipped':
        return {
          label: 'Отправлен',
          color: '#7C3AED',
          bgColor: '#EDE9FE',
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
        
        <SkeletonLoading type="order" count={4} />
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
                <div className="order-info">
                  <div className="order-amount">
                    <span className="amount-value">{formatPrice(order.total_amount)}</span>
                    <span className="items-count">
                      {order.total_items} {order.total_items === 1 ? 'товар' : 'товара'}
                    </span>
                  </div>
                  
                  {order.tracking_number && (
                    <div className="delivery-address">
                      <IconComponent name="right" size={12} />
                      <span>Трек: {order.tracking_number}</span>
                    </div>
                  )}
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

              <div className="order-actions">
                <button 
                  onClick={() => router.push(`/webapp/orders/${order.id}`)}
                  className="btn-details"
                >
                  Подробнее
                </button>
                {(order.status === 'delivered' || order.status === 'cancelled') && (
                  <button 
                    onClick={() => router.push(`/webapp/orders/${order.id}/reorder`)}
                    className="btn-reorder"
                  >
                    Повторить заказ
                  </button>
                )}
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
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .order-info {
          flex: 1;
        }

        .order-amount {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 6px;
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

        .delivery-address {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6B7280;
          margin-top: 4px;
        }

        .order-status {
          flex-shrink: 0;
          margin-left: 12px;
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

        .order-actions {
          display: flex;
          gap: 8px;
        }

        .btn-details {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid #48C928;
          background: white;
          color: #48C928;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-details:hover {
          background: #F0FDF4;
        }

        .btn-reorder {
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: #48C928;
          color: white;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-reorder:hover {
          background: #3AA120;
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
          
          .order-content {
            flex-direction: column;
            gap: 12px;
          }
          
          .order-status {
            margin-left: 0;
            align-self: flex-start;
          }
          
          .order-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default OrdersPage; 