'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconComponent } from '@/components/webapp/IconComponent';
import BonusBlock from '../_components/BonusBlock';
import ActionCards from '../_components/ActionCards';
import SkeletonLoading from '../_components/SkeletonLoading';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { webAppFetch } from '@/lib/utils/webapp-fetch';

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
  const { user: authUser, isAuthenticated } = useTelegramAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (isAuthenticated && authUser?.tg_id) {
      loadData();
    }

    // Слушаем событие обновления профиля
    const handleProfileUpdate = () => {
      loadData();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [isAuthenticated, authUser]);

  const loadData = async () => {
    if (!authUser?.tg_id) return;

    try {
      setIsLoading(true);
      
      const [profileResponse, subscriptionsResponse] = await Promise.all([
        webAppFetch('/api/webapp/profile'),
        webAppFetch('/api/webapp/subscriptions')
      ]);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.success) {
          setProfileData(profileData);
          // Запускаем анимацию при обновлении данных
          setAnimationKey(prev => prev + 1);
        }
      }

      if (subscriptionsResponse.ok) {
        const subscriptionsData = await subscriptionsResponse.json();
        setSubscriptions(subscriptionsData.subscriptions || []);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdminOrManagerOrModerator = (role: number) => {
    return role >= 1; // 1: manager, 2: moderator, 3: admin
  };

  if (isLoading) {
    return (
      <div className="webapp-container profile-page px-4 py-6">
        <SkeletonLoading type="profile" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="webapp-container profile-page px-4 py-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-6">{error}</div>
          <button 
            onClick={loadData}
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
      {/* Единый контейнер с фиксированными отступами */}
      <div className="profile-content-stack">
        
        {/* Заголовок профиля */}
        <div className="profile-header">
          <div className="flex items-center gap-3">
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
            <h2 className="text-xl font-semibold">
              Привет, {user.first_name || user.first_name_raw} <span key={animationKey} className="waving-hand">👋</span>
            </h2>
          </div>
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
    </div>
  );
};

export default ProfilePage; 