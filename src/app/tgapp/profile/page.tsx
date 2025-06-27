"use client";

import { useEffect, useState } from "react";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { ChevronRight, User, Package, MapPin, Clock, HelpCircle } from "lucide-react";
import { useBackButton } from "../_components/useBackButton";
import SubscriptionsSheet from "../_components/SubscriptionsSheet";

interface AccountTier {
  id: number;
  title: string;
  bonus_percentage: number;
  order_threshold: number;
}

interface UserProfile {
  id: number;
  first_name: string;
  first_name_raw: string;
  photo_url: string | null;
  order_count: number;
  bonus_balance: number;
  role: number;
  account_tier: AccountTier | null;
  tg_id: string;
}

interface ProfileDataResponse {
  success: boolean;
  user: UserProfile;
  account_tiers: AccountTier[];
  remaining_to_next_tier: number | null;
  next_tier: AccountTier | null;
}

export default function TgappProfilePage() {
  const { isAuthenticated, user } = useTelegramAuth();
  const [loading, setLoading] = useState(true);
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);
  const [data, setData] = useState<ProfileDataResponse | null>(null);

  // Показываем кнопку "Назад" в Telegram
  useBackButton(true);

  const load = async () => {
    if (!isAuthenticated || !user?.tg_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/webapp/profile?tg_id=${user.tg_id}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isAuthenticated, user?.tg_id]);

  if (loading) {
    return (
      <div className="tgapp-profile">
        <div className="tgapp-skeleton" style={{ height: '80px', marginBottom: '1rem' }}></div>
        <div className="tgapp-skeleton" style={{ height: '120px', marginBottom: '1rem' }}></div>
        <div className="tgapp-skeleton" style={{ height: '200px' }}></div>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="tgapp-profile">
        <div className="tgapp-error">
          <div className="tgapp-error-title">Ошибка загрузки профиля</div>
          <div className="tgapp-error-message">Попробуйте обновить страницу</div>
        </div>
      </div>
    );
  }

  const { user: profileUser } = data;
  const greetName = profileUser.first_name || profileUser.first_name_raw;

  return (
    <div className="tgapp-profile">
      {/* Profile Header */}
      <div className="tgapp-profile-header">
        <h1 className="tgapp-profile-greeting">Привет, {greetName}! 👋</h1>
      </div>

      {/* Bonus Block */}
      <div className="tgapp-bonus-block">
        <div className="tgapp-bonus-title">Бонусная система</div>
        <div className="tgapp-bonus-amount">{profileUser.bonus_balance}₽</div>
        <div className="tgapp-bonus-tier">
          {profileUser.account_tier ? `${profileUser.account_tier.title} • Кэшбек ${profileUser.account_tier.bonus_percentage}%` : 'Серебряный'}
        </div>
      </div>

      {/* Action Cards */}
      <div className="tgapp-action-cards">
        <div className="tgapp-action-card" onClick={() => window.location.href = '/tgapp/profile/orders'}>
          <div className="tgapp-action-card-icon">
            <Clock size={20} />
          </div>
          <div className="tgapp-action-card-content">
            <div className="tgapp-action-card-title">История заказов</div>
            <div className="tgapp-action-card-subtitle">Просмотр и отслеживание заказов</div>
          </div>
          <ChevronRight className="tgapp-action-card-arrow" size={20} />
        </div>

        <div className="tgapp-action-card" onClick={() => window.location.href = '/tgapp/profile/addresses'}>
          <div className="tgapp-action-card-icon">
            <MapPin size={20} />
          </div>
          <div className="tgapp-action-card-content">
            <div className="tgapp-action-card-title">Данные для доставки</div>
            <div className="tgapp-action-card-subtitle">Управление адресом и контактами</div>
          </div>
          <ChevronRight className="tgapp-action-card-arrow" size={20} />
        </div>

        <div
          className="tgapp-action-card"
          onClick={() => setIsSubscriptionsOpen(true)}
        >
          <div className="tgapp-action-card-icon">
            <Package size={20} />
          </div>
          <div className="tgapp-action-card-content">
            <div className="tgapp-action-card-title">Товары в ожидании</div>
            <div className="tgapp-action-card-subtitle">Уведомления о поступлении</div>
          </div>
          <ChevronRight className="tgapp-action-card-arrow" size={20} />
        </div>

        <div className="tgapp-action-card">
          <div className="tgapp-action-card-icon">
            <HelpCircle size={20} />
          </div>
          <div className="tgapp-action-card-content">
            <div className="tgapp-action-card-title">Частые вопросы</div>
            <div className="tgapp-action-card-subtitle">Помощь и поддержка</div>
          </div>
          <ChevronRight className="tgapp-action-card-arrow" size={20} />
        </div>
      </div>

      {/* Модальное окно "Товары в ожидании" */}
      <SubscriptionsSheet
        isOpen={isSubscriptionsOpen}
        onClose={() => setIsSubscriptionsOpen(false)}
      />
    </div>
  );
} 