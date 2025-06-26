'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconComponent } from '@/components/webapp/IconComponent';
import DeliveryDataSheet from './DeliveryDataSheet';
import SkeletonLoading from './SkeletonLoading';
import SubscriptionsSheet from './SubscriptionsSheet';
import SupportSheet from './SupportSheet';
import toast from 'react-hot-toast';

interface ActionCardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  badge?: {
    count: number;
    text: string;
    type: 'info' | 'warning' | 'success' | 'danger';
  };
  variant?: 'default' | 'admin' | 'primary';
  external?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

interface User {
  first_name: string;
  last_name: string;
  middle_name: string;
  phone_number: string;
  address: string;
  street: string;
  home: string;
  apartment: string;
}

interface ActionCardsV2Props {
  isAdmin: boolean;
  user: User;
  subscriptionsCount?: number;
  ordersCount?: number;
  loading?: boolean;
}

const ActionCardsV2: React.FC<ActionCardsV2Props> = ({ 
  isAdmin, 
  user, 
  subscriptionsCount, 
  ordersCount,
  loading = false 
}) => {
  const router = useRouter();
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isSubscriptionsModalOpen, setIsSubscriptionsModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportMode, setSupportMode] = useState<'faq' | 'contact'>('faq');

  // Уведомляем о состоянии модальных окон для скрытия плашки корзины
  useEffect(() => {
    const isAnyModalOpen = isDeliveryModalOpen || isSubscriptionsModalOpen || isSupportModalOpen;
    
    window.dispatchEvent(new CustomEvent('modalStateChanged', {
      detail: { isModalOpen: isAnyModalOpen }
    }));
  }, [isDeliveryModalOpen, isSubscriptionsModalOpen, isSupportModalOpen]);

  // Слушаем события обновления подписок
  const [currentSubscriptionsCount, setCurrentSubscriptionsCount] = useState(subscriptionsCount);

  useEffect(() => {
    const handleSubscriptionsUpdate = (event: any) => {
      if (event.detail?.action === 'deleted') {
        setCurrentSubscriptionsCount(prev => Math.max(0, (prev || 0) - 1));
        
        // Haptic feedback
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([20, 100, 20]);
        }
        
        toast.success('Товар удален из ожидания');
      }
    };

    window.addEventListener('subscriptionsUpdated', handleSubscriptionsUpdate);
    return () => window.removeEventListener('subscriptionsUpdated', handleSubscriptionsUpdate);
  }, []);

  useEffect(() => {
    setCurrentSubscriptionsCount(subscriptionsCount);
  }, [subscriptionsCount]);

  const handleSaveDeliveryData = async (data: any) => {
    try {
      console.log('Delivery data saved:', data);
    } catch (error) {
      console.error('Error handling delivery data save:', error);
      throw error;
    }
  };

  const handleNavigation = (href: string, id: string) => {
    if (id === 'subscriptions') {
      setIsSubscriptionsModalOpen(true);
      return;
    }
    
    if (id === 'faq') {
      setSupportMode('faq');
      setIsSupportModalOpen(true);
      return;
    }
    
    if (id === 'support-contact') {
      setSupportMode('contact');  
      setIsSupportModalOpen(true);
      return;
    }
    
    router.push(href);
  };

  const actionItems: ActionCardItem[] = [
    {
      id: 'delivery-data',
      title: 'Данные для доставки',
      description: 'Управление адресом и контактами',
      icon: 'profile',
      href: '/webapp/profile/delivery',
      variant: 'primary'
    },
    {
      id: 'subscriptions',
      title: 'Товары в ожидании',
      description: 'Уведомления о поступлении',
      icon: 'hourglass',
      href: '/webapp/subscriptions',
      badge: currentSubscriptionsCount && currentSubscriptionsCount > 0 ? {
        count: currentSubscriptionsCount,
        text: '',
        type: 'info'
      } : undefined
    },
    {
      id: 'orders',
      title: 'История заказов',
      description: 'Просмотр и отслеживание заказов',
      icon: 'history',
      href: '/webapp/orders',
      badge: ordersCount && ordersCount > 0 ? {
        count: ordersCount,
        text: 'активных',
        type: 'info'
      } : undefined
    },
    {
      id: 'faq',
      title: 'Частые вопросы',
      description: 'Ответы на популярные вопросы',
      icon: 'help-circle',
      href: '#'
    },
    {
      id: 'support-contact',
      title: 'Связаться с поддержкой',
      description: 'Telegram, время работы',
      icon: 'support',
      href: '#'
    }
  ];

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'info':
        return 'action-badge--info';
      case 'warning':
        return 'action-badge--warning';
      case 'success':
        return 'action-badge--success';
      case 'danger':
        return 'action-badge--danger';
      default:
        return 'action-badge--info';
    }
  };

  const getItemClass = (item: ActionCardItem) => {
    let classes = ['action-item'];
    
    if (item.variant === 'admin') classes.push('action-item--admin');
    if (item.variant === 'primary') classes.push('action-item--primary');
    if (item.loading || loading) classes.push('action-item--loading');
    if (item.disabled) classes.push('action-item--disabled');
    
    return classes.join(' ');
  };

  const renderActionCard = (item: ActionCardItem) => {
    const CardContent = () => (
      <div className={getItemClass(item)}>
        <div className="action-content">
          <div className="action-icon">
            <IconComponent name={item.icon} size={20} />
          </div>
          
          <div className="action-text">
            <div className="action-title">
              {item.title}
              {item.badge && item.id !== 'delivery-data' && (
                <span className={`action-badge ${getBadgeClass(item.badge.type)}`}>
                  {item.badge.count}
                </span>
              )}
            </div>
            {item.description && (
              <div className="action-description">
                {item.description}
              </div>
            )}
          </div>
          
          <div className="action-arrow">
            <IconComponent name="right" size={16} />
          </div>
        </div>
      </div>
    );

    // Специальная обработка для карточки доставки
    if (item.id === 'delivery-data') {
      return (
        <div 
          key={item.id}
          onClick={() => setIsDeliveryModalOpen(true)}
          className="action-link"
        >
          <CardContent />
        </div>
      );
    }

    if (item.external) {
      return (
        <a 
          key={item.id}
          href={item.href}
          data-turbo="false"
          className="action-link"
        >
          <CardContent />
        </a>
      );
    }

    // Для карточек с навигацией
    if (['subscriptions', 'orders', 'faq', 'support-contact'].includes(item.id)) {
      return (
        <div 
          key={item.id}
          onClick={() => handleNavigation(item.href, item.id)}
          className="action-link"
        >
          <CardContent />
        </div>
      );
    }

    // Обычная навигация
    return (
      <Link key={item.id} href={item.href} className="action-link">
        <CardContent />
      </Link>
    );
  };

  if (loading) {
    return <SkeletonLoading />;
  }

  return (
    <>
      <div className="action-container">
        {actionItems.map(renderActionCard)}
      </div>

      {/* Модальные окна */}
      <DeliveryDataSheet
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        user={user}
        onSave={handleSaveDeliveryData}
      />

      <SubscriptionsSheet
        isOpen={isSubscriptionsModalOpen}
        onClose={() => setIsSubscriptionsModalOpen(false)}
      />

      <SupportSheet
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        mode={supportMode}
      />
    </>
  );
};

export default ActionCardsV2; 