"use client";

import { useEffect, useState } from "react";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useBackButton } from "../../_components/useBackButton";
import "../../styles/tgapp.css";

interface DeliveryData {
  address: string;
  street: string;
  home: string;
  apartment: string;
  build: string;
  postal_code: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  phone_number: string;
}

const defaultDeliveryData: DeliveryData = {
  address: '',
  street: '',
  home: '',
  apartment: '',
  build: '',
  postal_code: 0,
  first_name: '',
  last_name: '',
  middle_name: '',
  phone_number: '',
};

export default function AddressesPage() {
  const { user, isAuthenticated } = useTelegramAuth();
  const [formData, setFormData] = useState<DeliveryData>(defaultDeliveryData);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  // Показываем кнопку "Назад" в Telegram
  useBackButton(true);

  useEffect(() => {
    if (isAuthenticated && user?.tg_id) {
      loadProfile();
    } else {
      setIsLoadingProfile(false);
    }
  }, [isAuthenticated, user?.tg_id]);

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await fetch(`/api/webapp/profile?tg_id=${user?.tg_id}`);
      const data = await response.json();

      if (data.success && data.user) {
        const userData = data.user;
        setFormData({
          middle_name: userData.middle_name || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone_number: userData.phone_number || '',
          address: userData.address || '',
          street: userData.street || '',
          home: userData.home || '',
          apartment: userData.apartment || '',
          build: userData.build || '',
          postal_code: userData.postal_code || 0
        });
      } else {
        setErrors([data.error || 'Ошибка загрузки профиля']);
      }
    } catch (err) {
      setErrors(['Ошибка загрузки профиля']);
      console.error('Profile loading error:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleInputChange = (field: keyof DeliveryData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Очистить ошибки при изменении
    if (errors.length > 0) {
      setErrors([]);
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user?.tg_id) return;

    setIsLoading(true);
    setErrors([]);
    setSuccessMessage('');

    try {
      const response = await fetch('/api/webapp/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tg_id: user.tg_id,
          ...formData
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Данные для доставки успешно обновлены');
        // Виброотклик при успехе
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      } else {
        throw new Error(data.error || 'Ошибка обновления данных');
      }
    } catch (error: any) {
      setErrors([error.message || 'Ошибка при сохранении']);
      // Виброотклик при ошибке
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 1) return cleaned;
    if (cleaned.length <= 4) return `+7 (${cleaned.slice(1)}`;
    if (cleaned.length <= 7) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    if (cleaned.length <= 9) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  };

  if (isLoadingProfile) {
    return (
      <div className="px-4 py-3">
        <h1 className="tgapp-page-title">Данные для доставки</h1>
        <div className="tgapp-loading-form">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="tgapp-form-skeleton">
              <div className="tgapp-skeleton-label" />
              <div className="tgapp-skeleton-input" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="px-4 py-3">
        <h1 className="tgapp-page-title">Данные для доставки</h1>
        <div className="tgapp-empty-state">
          <div className="tgapp-empty-title">Войдите в аккаунт</div>
          <div className="tgapp-empty-message">Чтобы управлять данными для доставки</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <h1 className="tgapp-page-title">Данные для доставки</h1>

      <form onSubmit={handleSubmit} className="tgapp-form">
        {/* Сообщения об ошибках */}
        {errors.length > 0 && (
          <div className="tgapp-error-message">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}

        {/* Сообщение об успехе */}
        {successMessage && (
          <div className="tgapp-success-message">
            {successMessage}
          </div>
        )}

        {/* Личные данные */}
        <div className="tgapp-form-section">
          <h3 className="tgapp-section-title">Личные данные</h3>

          <div className="tgapp-form-field">
            <label htmlFor="middle_name" className="tgapp-form-label required">Фамилия</label>
            <input
              type="text"
              id="middle_name"
              value={formData.middle_name}
              onChange={(e) => handleInputChange('middle_name', e.target.value)}
              className="tgapp-form-input"
              required
              minLength={2}
              placeholder="Введите фамилию"
              autoComplete="family-name"
            />
          </div>

          <div className="tgapp-form-field">
            <label htmlFor="first_name" className="tgapp-form-label required">Имя</label>
            <input
              type="text"
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className="tgapp-form-input"
              required
              minLength={2}
              placeholder="Введите имя"
              autoComplete="given-name"
            />
          </div>

          <div className="tgapp-form-field">
            <label htmlFor="last_name" className="tgapp-form-label required">Отчество</label>
            <input
              type="text"
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className="tgapp-form-input"
              required
              minLength={2}
              placeholder="Введите отчество"
              autoComplete="additional-name"
            />
          </div>

          <div className="tgapp-form-field">
            <label htmlFor="phone_number" className="tgapp-form-label required">Номер телефона</label>
            <input
              type="tel"
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                handleInputChange('phone_number', formatted);
              }}
              className="tgapp-form-input"
              required
              placeholder="+7 (999) 123-45-67"
              autoComplete="tel"
            />
          </div>
        </div>

        {/* Адрес доставки */}
        <div className="tgapp-form-section">
          <h3 className="tgapp-section-title">Адрес доставки</h3>

          <div className="tgapp-form-field">
            <label htmlFor="address" className="tgapp-form-label required">Город</label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="tgapp-form-input"
              required
              placeholder="Введите город"
              autoComplete="address-level2"
            />
          </div>

          <div className="tgapp-form-field">
            <label htmlFor="street" className="tgapp-form-label required">Улица</label>
            <input
              type="text"
              id="street"
              value={formData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              className="tgapp-form-input"
              required
              placeholder="Введите улицу"
              autoComplete="street-address"
            />
          </div>

          <div className="tgapp-form-row">
            <div className="tgapp-form-field">
              <label htmlFor="home" className="tgapp-form-label required">Дом</label>
              <input
                type="text"
                id="home"
                value={formData.home}
                onChange={(e) => handleInputChange('home', e.target.value)}
                className="tgapp-form-input"
                required
                placeholder="Номер дома"
              />
            </div>
            <div className="tgapp-form-field">
              <label htmlFor="apartment" className="tgapp-form-label">Квартира</label>
              <input
                type="text"
                id="apartment"
                value={formData.apartment}
                onChange={(e) => handleInputChange('apartment', e.target.value)}
                className="tgapp-form-input"
                placeholder="Номер квартиры"
              />
            </div>
          </div>

          <div className="tgapp-form-row">
            <div className="tgapp-form-field">
              <label htmlFor="build" className="tgapp-form-label">Корпус</label>
              <input
                type="text"
                id="build"
                value={formData.build}
                onChange={(e) => handleInputChange('build', e.target.value)}
                className="tgapp-form-input"
                placeholder="Корпус/строение"
              />
            </div>
            <div className="tgapp-form-field">
              <label htmlFor="postal_code" className="tgapp-form-label required">Почтовый индекс</label>
              <input
                type="number"
                id="postal_code"
                value={formData.postal_code || ''}
                onChange={(e) => handleInputChange('postal_code', parseInt(e.target.value) || 0)}
                className="tgapp-form-input"
                required
                placeholder="000000"
                min="100000"
                max="999999"
                autoComplete="postal-code"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="tgapp-form-submit"
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
} 