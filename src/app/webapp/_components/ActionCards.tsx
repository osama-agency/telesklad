'use client';

import React from 'react';
import Link from 'next/link';
import { IconComponent } from '@/components/webapp/IconComponent';

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
  variant?: 'default' | 'admin';
  external?: boolean;
}

interface ActionCardsProps {
  isAdmin: boolean;
}

const ActionCards: React.FC<ActionCardsProps> = ({ isAdmin }) => {
  // В реальном приложении эти данные будут приходить через API
  const actionItems: ActionCardItem[] = [
    {
      id: 'subscriptions',
      title: 'Товары в ожидании',
      description: 'Отслеживайте поступление товаров',
      icon: 'clock',
      href: '/webapp/subscriptions',
      badge: {
        count: 3,
        text: 'товара',
        type: 'info'
      }
    },
    {
      id: 'orders',
      title: 'История заказов',
      description: 'Ваши покупки и доставки',
      icon: 'cart2',
      href: '/webapp/orders',
      badge: {
        count: 12,
        text: 'заказов',
        type: 'success'
      }
    }
  ];

  if (isAdmin) {
    actionItems.push({
      id: 'admin',
      title: 'Админка',
      description: 'Управление системой',
      icon: 'admin',
      href: '/admin',
      variant: 'admin',
      external: true
    });
  }

  const getBadgeColors = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'danger':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderActionCard = (item: ActionCardItem) => {
    const CardContent = () => (
      <div className={`action-card ${item.variant === 'admin' ? 'action-card-admin' : ''}`}>
        <div className="action-card-content">
          <div className="action-card-icon">
            <IconComponent name={item.icon} size={20} />
          </div>
          
          <div className="action-card-text">
            <div className="action-card-title">
              {item.title}
              {item.badge && (
                <span className={`action-card-badge ${getBadgeColors(item.badge.type)}`}>
                  {item.badge.count}
                </span>
              )}
            </div>
            <div className="action-card-description">
              {item.description}
            </div>
          </div>
          
          <div className="action-card-arrow">
            <IconComponent name="right" size={16} />
          </div>
        </div>
        
        {item.badge && (
          <div className="action-card-footer">
            <span className="action-card-footer-text">
              {item.badge.count} {item.badge.text}
            </span>
          </div>
        )}
      </div>
    );

    if (item.external) {
      return (
        <a 
          key={item.id}
          href={item.href}
          data-turbo="false"
          className="action-card-link"
        >
          <CardContent />
        </a>
      );
    }

    return (
      <Link key={item.id} href={item.href} className="action-card-link">
        <CardContent />
      </Link>
    );
  };

  return (
    <div className="action-cards-container">
      {actionItems.map(renderActionCard)}
    </div>
  );
};

export default ActionCards; 