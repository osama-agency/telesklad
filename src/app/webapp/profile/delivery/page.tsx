'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconComponent } from '@/components/webapp/IconComponent';

interface User {
  id: number;
  email: string;
  middle_name: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  street: string;
  home: string;
  apartment: string;
  build: string;
  postal_code: number;
}

const DeliveryDataPage: React.FC = () => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await fetch('/api/webapp/profile');
      const data = await response.json();

      if (data.success) {
        const user = data.user;
        setFormData({
          middle_name: user.middle_name || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone_number: user.phone_number || '',
          email: user.email || '',
          address: user.address || '',
          street: user.street || '',
          home: user.home || '',
          apartment: user.apartment || '',
          build: user.build || '',
          postal_code: user.postal_code || 0
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

  const handleInputChange = (field: keyof User, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Очистить ошибки при изменении
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    try {
      const response = await fetch('/api/webapp/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Показываем уведомление об успехе
        const event = new CustomEvent('webapp:notification', {
          detail: { message: 'Данные для доставки успешно обновлены', type: 'success' }
        });
        window.dispatchEvent(event);
      } else {
        throw new Error(data.error || 'Ошибка обновления данных');
      }
    } catch (error: any) {
      setErrors([error.message || 'Ошибка при сохранении']);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Простая маска для телефона
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 1) return cleaned;
    if (cleaned.length <= 4) return `+7 (${cleaned.slice(1)}`;
    if (cleaned.length <= 7) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    if (cleaned.length <= 9) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  };

  if (isLoadingProfile) {
    return (
      <div className="webapp-container">
        <div className="text-center py-8">
          <div className="text-gray-600">Загрузка данных...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="webapp-container">
      {/* Заголовок с возвратом */}
      <div className="flex items-center gap-3 mb-6">
        <Link 
          href="/webapp/profile"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <IconComponent name="left" size={20} />
        </Link>
        <h1 className="!mb-0">Данные для доставки</h1>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="main-block mb-5">
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}

          <h3 className="text-lg font-semibold mb-4">Личные данные</h3>

          <div className="input-container">
            <label htmlFor="middle_name">Фамилия</label>
            <input
              type="text"
              id="middle_name"
              value={formData.middle_name || ''}
              onChange={(e) => handleInputChange('middle_name', e.target.value)}
              className="input-str"
              required
              minLength={2}
              placeholder=""
              autoComplete="family-name"
            />
          </div>

          <div className="input-container">
            <label htmlFor="first_name">Имя</label>
            <input
              type="text"
              id="first_name"
              value={formData.first_name || ''}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className="input-str"
              required
              minLength={2}
              placeholder=""
              autoComplete="given-name"
            />
          </div>

          <div className="input-container">
            <label htmlFor="last_name">Отчество</label>
            <input
              type="text"
              id="last_name"
              value={formData.last_name || ''}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className="input-str"
              required
              minLength={2}
              placeholder=""
              autoComplete="additional-name"
            />
          </div>

          <div className="input-container">
            <label htmlFor="phone_number">Номер телефона</label>
            <input
              type="tel"
              id="phone_number"
              value={formData.phone_number || ''}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                handleInputChange('phone_number', formatted);
              }}
              className="input-str"
              required
              placeholder="+7 (999) 123-45-67"
              autoComplete="tel"
            />
          </div>

          <div className="input-container">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="input-str"
              required
              placeholder=""
              autoComplete="email"
            />
          </div>

          <div className="line-user"></div>

          <h3 className="text-lg font-semibold mb-4">Адрес доставки</h3>

          <div className="input-container">
            <label htmlFor="address">Город</label>
            <input
              type="text"
              id="address"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="input-str"
              required
              placeholder=""
              autoComplete="city-address"
            />
          </div>

          <div className="input-container">
            <label htmlFor="street">Улица</label>
            <input
              type="text"
              id="street"
              value={formData.street || ''}
              onChange={(e) => handleInputChange('street', e.target.value)}
              className="input-str"
              required
              placeholder=""
              autoComplete="street-address"
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <div className="input-container">
                <label htmlFor="home">Дом</label>
                <input
                  type="text"
                  id="home"
                  value={formData.home || ''}
                  onChange={(e) => handleInputChange('home', e.target.value)}
                  className="input-str"
                  required
                  placeholder=""
                />
              </div>
            </div>
            <div className="w-1/2">
              <div className="input-container">
                <label htmlFor="apartment">Квартира</label>
                <input
                  type="text"
                  id="apartment"
                  value={formData.apartment || ''}
                  onChange={(e) => handleInputChange('apartment', e.target.value)}
                  className="input-str"
                  placeholder=""
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <div className="input-container">
                <label htmlFor="build">Корпус</label>
                <input
                  type="text"
                  id="build"
                  value={formData.build || ''}
                  onChange={(e) => handleInputChange('build', e.target.value)}
                  className="input-str"
                  placeholder=""
                />
              </div>
            </div>
            <div className="w-1/2">
              <div className="input-container">
                <label htmlFor="postal_code">Почтовый индекс</label>
                <input
                  type="number"
                  id="postal_code"
                  value={formData.postal_code || ''}
                  onChange={(e) => handleInputChange('postal_code', parseInt(e.target.value) || 0)}
                  className="input-str"
                  required
                  placeholder=""
                  min="100000"
                  max="999999"
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="webapp-btn webapp-btn-big mb-5"
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
};

export default DeliveryDataPage; 