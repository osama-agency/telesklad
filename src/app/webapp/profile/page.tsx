'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconComponent } from '@/components/webapp/IconComponent';
import BonusBlock from '../_components/BonusBlock';
import ActionCards from '../_components/ActionCards';
import LoadingSpinner from '../_components/LoadingSpinner';

interface AccountTier {
  id: number;
  title: string;
  order_threshold: number;
  bonus_percentage: number;
  order_min_amount: number;
}

interface User {
  id: number;
  email: string;
  tg_id: number;
  username: string;
  first_name: string;
  first_name_raw: string;
  last_name: string;
  last_name_raw: string;
  middle_name: string;
  phone_number: string;
  photo_url: string | null;
  address: string;
  street: string;
  home: string;
  apartment: string;
  build: string;
  postal_code: number;
  bonus_balance: number;
  order_count: number;
  account_tier: AccountTier | null;
  role: number;
  is_blocked: boolean;
  started: boolean;
}

interface ProfileData {
  user: User;
  account_tiers: AccountTier[];
  remaining_to_next_tier: number | null;
  next_tier: AccountTier | null;
}

interface Subscription {
  id: number;
  product_id: number;
  product: any;
  created_at: string;
  updated_at: string;
}

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Параллельно загружаем профиль и подписки
      const [profileResponse, subscriptionsResponse] = await Promise.all([
        fetch('/api/webapp/profile'),
        fetch('/api/webapp/subscriptions')
      ]);

      // Проверяем статус ответов перед парсингом JSON
      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('Profile API error:', profileResponse.status, errorText);
        setError(`Ошибка загрузки профиля: ${profileResponse.status}`);
        return;
      }

      const profileData = await profileResponse.json();
      const subscriptionsData = subscriptionsResponse.ok 
        ? await subscriptionsResponse.json()
        : { subscriptions: [] };

      if (profileData.success) {
        setProfileData(profileData);
        // API теперь возвращает объект с полем subscriptions
        setSubscriptions(subscriptionsData.subscriptions || []);
      } else {
        setError(profileData.error || 'Ошибка загрузки профиля');
      }
    } catch (err) {
      setError('Ошибка загрузки профиля');
      console.error('Profile loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdminOrManagerOrModerator = (role: number) => {
    return role >= 1; // 1: manager, 2: moderator, 3: admin
  };

  if (isLoading) {
    return (
      <div className="webapp-container profile-page">
        <LoadingSpinner variant="page" size="lg" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="webapp-container profile-page">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={loadProfileData}
            className="btn btn-secondary"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const { user, account_tiers, remaining_to_next_tier, next_tier } = profileData;

  return (
    <div className="webapp-container profile-page">
      {/* Заголовок профиля */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center profile-avatar">
          {user.photo_url ? (
            <img 
              src={user.photo_url} 
              alt="Аватар"
              className="w-full h-full object-cover"
            />
          ) : (
            <IconComponent name="profile" size={20} />
          )}
        </div>
        <h2 className="!mb-0 text-xl font-semibold">
          Привет, {user.first_name || user.first_name_raw} 👋
        </h2>
      </div>

      {/* Блок бонусной программы */}
      <BonusBlock />

      {/* Меню действий */}
      <ActionCards 
        isAdmin={isAdminOrManagerOrModerator(user.role)} 
        user={user}
        subscriptionsCount={subscriptions.length}
        ordersCount={user.order_count}
      />
    </div>
  );
};

export default ProfilePage; 