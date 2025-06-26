'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Package, 
  Info, 
  MapPin, 
  Star, 
  Heart,
  Calendar,
  ChevronRight 
} from 'lucide-react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

// 🚀 ИСПОЛЬЗУЕМ LAZY LOADING версии компонентов
import { DeliveryDataSheetLazy, SubscriptionsSheetLazy } from './LazyComponents';

interface ActionCardProps {
  href?: string;
  icon: React.ReactNode;
  title: string;
  variant?: 'primary' | 'default';
  description?: string;
  onClick?: () => void;
  className?: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ 
  href, 
  icon, 
  title, 
  variant = 'default',
  description,
  onClick,
  className = ''
}) => {
  const CardContent = (
    <div className={`action-card ${variant} ${className}`}>
      <div className="action-card-content">
        <div className="action-card-icon">
          {icon}
        </div>
        <div className="action-card-text">
          <h3 className="action-card-title">{title}</h3>
          {description && (
            <p className="action-card-description">{description}</p>
          )}
        </div>
      </div>
      <div className="action-card-arrow">
        <ChevronRight size={20} />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="action-card-wrapper">
        {CardContent}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="action-card-wrapper">
      {CardContent}
    </button>
  );
};

export default function ActionCards() {
  const pathname = usePathname();
  const { user } = useTelegramAuth();
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);

  // Показываем заголовок только на странице профиля
  const showTitle = pathname === '/webapp/profile';

  const handleDeliveryClick = () => {
    console.log('🚚 Opening delivery sheet');
    setIsDeliveryOpen(true);
  };

  const handleCloseDelivery = () => {
    console.log('📦 Closing delivery sheet');
    setIsDeliveryOpen(false);
  };

  const handleSaveDelivery = async (deliveryData: any) => {
    try {
      console.log('💾 Saving delivery data:', deliveryData);
      
      if (user?.tg_id) {
        const response = await fetch('/api/webapp/user/delivery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tg_id: user.tg_id,
            ...deliveryData
          })
        });

        if (response.ok) {
          console.log('✅ Delivery data saved successfully');
          handleCloseDelivery();
        } else {
          console.error('❌ Error saving delivery data:', response.status);
        }
      }
    } catch (error) {
      console.error('❌ Error saving delivery data:', error);
    }
  };

  const handleSubscriptionsClick = () => {
    console.log('📅 Opening subscriptions');
    setIsSubscriptionsOpen(true);
  };

  const handleCloseSubscriptions = () => {
    console.log('📅 Closing subscriptions');
    setIsSubscriptionsOpen(false);
  };

  const handleSaveSubscription = (subscriptionData: any) => {
    console.log('💾 Saving subscription:', subscriptionData);
    // Данные уже сохранены в DeliveryDataSheet через API
    handleCloseSubscriptions();
  };

  const cards = [
    {
      id: 'my-orders',
      href: '/webapp/orders',
      icon: <Package className="w-6 h-6" />,
      title: 'Мои заказы',
      description: 'История и статус заказов',
      variant: 'primary' as const
    },
    {
      id: 'subscriptions',
      onClick: handleSubscriptionsClick,
      icon: <Calendar className="w-6 h-6" />,
      title: 'Подписки',
      description: 'Управление подписками'
    },
    {
      id: 'delivery',
      onClick: handleDeliveryClick,
      icon: <MapPin className="w-6 h-6" />,
      title: 'Адрес доставки',
      description: 'Изменить адрес и способ'
    },
    {
      id: 'favorites',
      href: '/webapp/favorites',
      icon: <Heart className="w-6 h-6" />,
      title: 'Избранное',
      description: 'Сохраненные товары'
    },
    {
      id: 'reviews',
      href: '/webapp/profile/reviews',
      icon: <Star className="w-6 h-6" />,
      title: 'Мои отзывы',
      description: 'Оставленные отзывы'
    },
    {
      id: 'faq',
      href: '/webapp/support',
      icon: <Info className="w-6 h-6" />,
      title: 'Поддержка',
      description: 'Часто задаваемые вопросы'
    }
  ];

  return (
    <>
      <div className="action-cards-section">
        {showTitle && (
          <h2 className="section-title">Быстрые действия</h2>
        )}
        <div className="action-cards-grid">
          {cards.map((card) => (
            <ActionCard
              key={card.id}
              href={card.href}
              onClick={card.onClick}
              icon={card.icon}
              title={card.title}
              description={card.description}
              variant={card.variant}
            />
          ))}
        </div>
      </div>

      {/* 🚀 Используем lazy версию SubscriptionsSheet */}
      {isSubscriptionsOpen && (
        <SubscriptionsSheetLazy
          isOpen={isSubscriptionsOpen}
          onClose={handleCloseSubscriptions}
          onSave={handleSaveSubscription}
        />
      )}

      {/* 🚀 Используем lazy версию DeliveryDataSheet */}
      {isDeliveryOpen && (
        <DeliveryDataSheetLazy
          isOpen={isDeliveryOpen}
          onClose={handleCloseDelivery}
          onSave={handleSaveDelivery}
          defaultValues={user?.metadata?.delivery || undefined}
        />
      )}
    </>
  );
}
