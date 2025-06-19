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

interface ActionCardsProps {
  isAdmin: boolean;
  user: User;
}

const ActionCards: React.FC<ActionCardsProps> = ({ isAdmin, user }) => {
  // Форматируем данные пользователя для отображения
  const formatUserData = () => {
    const lastName = user.middle_name || ''; // middle_name это фамилия в схеме БД
    const firstName = user.first_name || '';
    const middleName = user.last_name || ''; // last_name это отчество в схеме БД
    const street = user.street || '';
    const home = user.home || '';
    const apartment = user.apartment || '';
    const phone = user.phone_number || '';
    
    // Проверяем, есть ли вообще данные
    if (!lastName && !firstName && !middleName && !street && !home && !phone) {
      return 'Заполните данные для доставки';
    }
    
    const lines = [];
    
    // 1. ФИО (первая строка)
    const nameComponents = [lastName, firstName, middleName].filter(Boolean);
    if (nameComponents.length > 0) {
      lines.push(nameComponents.join(' '));
    }
    
    // 2. Адрес (вторая строка)
    let addressPart = '';
    if (street && home) {
      addressPart = `${street}, ${home}`;
      if (apartment) {
        addressPart += `, кв. ${apartment}`;
      }
    } else if (street || home) {
      addressPart = street || home;
      if (apartment) {
        addressPart += `, кв. ${apartment}`;
      }
    }
    if (addressPart) {
      lines.push(addressPart);
    }
    
    // 3. Телефон в формате +7 999 999 99 99 (третья строка)
    if (phone) {
      // Форматируем телефон в нужный формат
      const cleanPhone = phone.replace(/\D/g, '');
      let formattedPhone = phone; // По умолчанию оставляем как есть
      
      if (cleanPhone.length === 11 && cleanPhone.startsWith('7')) {
        formattedPhone = `+7 ${cleanPhone.slice(1, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7, 9)} ${cleanPhone.slice(9, 11)}`;
      } else if (cleanPhone.length === 10) {
        formattedPhone = `+7 ${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6, 8)} ${cleanPhone.slice(8, 10)}`;
      }
      
      lines.push(formattedPhone);
    }
    
    return lines.length > 0 ? lines.join('\n') : 'Заполните данные для доставки';
  };

  // В реальном приложении эти данные будут приходить через API
  const actionItems: ActionCardItem[] = [
    {
      id: 'delivery-data',
      title: 'Данные для доставки',
      description: 'Управление адресом и контактами',
      icon: 'profile',
      href: '/webapp/profile/delivery'
    },
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
              {item.badge && item.id !== 'delivery-data' && (
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
        
        {item.badge && item.id !== 'delivery-data' && (
          <div className="action-card-footer">
            <span className="action-card-footer-text">
              {item.badge.count} {item.badge.text}
            </span>
          </div>
        )}
        
        {item.id === 'delivery-data' && (
          <div className="action-card-footer">
            <span className="action-card-footer-text delivery-data">
              {formatUserData()}
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