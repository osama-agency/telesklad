'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconComponent } from '@/components/webapp/IconComponent';
import BonusBlock from '../_components/BonusBlock';
import ProfileForm from '../_components/ProfileForm';
import ActionCards from '../_components/ActionCards';

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

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/webapp/profile');
      const data = await response.json();

      if (data.success) {
        setProfileData(data);
      } else {
        setError(data.error || 'Ошибка загрузки профиля');
      }
    } catch (err) {
      setError('Ошибка загрузки профиля');
      console.error('Profile loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (userData: Partial<User>) => {
    try {
      const response = await fetch('/api/webapp/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        // Обновляем данные профиля
        if (profileData) {
          setProfileData({
            ...profileData,
            user: { ...profileData.user, ...userData }
          });
        }
        
        // Показываем уведомление об успехе
        const event = new CustomEvent('webapp:notification', {
          detail: { message: 'Профиль успешно обновлен', type: 'success' }
        });
        window.dispatchEvent(event);
      } else {
        throw new Error(data.error || 'Ошибка обновления профиля');
      }
    } catch (error: any) {
      throw error; // Пробрасываем ошибку в форму
    }
  };

  const isAdminOrManagerOrModerator = (role: number) => {
    return role >= 1; // 1: manager, 2: moderator, 3: admin
  };

  if (isLoading) {
    return (
      <div className="webapp-container">
        <div className="text-center py-8">
          <div className="text-gray-600">Загрузка профиля...</div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="webapp-container">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={loadProfile}
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
    <div className="webapp-container">
      {/* Заголовок профиля */}
      <div className="flex items-center gap-3 mb-4">
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
      <BonusBlock
        user={user}
        accountTiers={account_tiers}
        remainingToNextTier={remaining_to_next_tier}
        nextTier={next_tier}
      />

      {/* Меню действий */}
      <ActionCards isAdmin={isAdminOrManagerOrModerator(user.role)} />

      {/* Форма редактирования профиля */}
      <ProfileForm 
        user={user}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default ProfilePage; 