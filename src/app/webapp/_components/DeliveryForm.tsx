'use client';

import React, { useState, useEffect } from 'react';
import DaDataInput from './DaDataInput';

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

interface DeliveryFormProps {
  initialData?: Partial<DeliveryData>;
  onDataChange?: (data: DeliveryData) => void;
  showPersonalInfo?: boolean;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({ 
  initialData = {}, 
  onDataChange,
  showPersonalInfo = true 
}) => {
  const [formData, setFormData] = useState<DeliveryData>({
    address: initialData?.address || '',
    street: initialData?.street || '',
    home: initialData?.home || '',
    apartment: initialData?.apartment || '',
    build: initialData?.build || '',
    postal_code: initialData?.postal_code || 0,
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    middle_name: initialData?.middle_name || '',
    phone_number: initialData?.phone_number || ''
  });

  // Обновляем форму при изменении initialData (когда загружается профиль)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        address: initialData.address || prev.address,
        street: initialData.street || prev.street,
        home: initialData.home || prev.home,
        apartment: initialData.apartment || prev.apartment,
        build: initialData.build || prev.build,
        postal_code: initialData.postal_code || prev.postal_code,
        first_name: initialData.first_name || prev.first_name,
        last_name: initialData.last_name || prev.last_name,
        middle_name: initialData.middle_name || prev.middle_name,
        phone_number: initialData.phone_number || prev.phone_number
      }));
    }
  }, [
    initialData?.address,
    initialData?.street,
    initialData?.home,
    initialData?.apartment,
    initialData?.build,
    initialData?.postal_code,
    initialData?.first_name,
    initialData?.last_name,
    initialData?.middle_name,
    initialData?.phone_number
  ]);

  // Уведомляем родительский компонент об изменениях (только при изменении данных формы)
  useEffect(() => {
    if (onDataChange && (
      formData.address ||
      formData.street ||
      formData.home ||
      formData.first_name ||
      formData.phone_number
    )) {
      onDataChange(formData);
    }
  }, [
    formData.address,
    formData.street,
    formData.home,
    formData.apartment,
    formData.build,
    formData.postal_code,
    formData.first_name,
    formData.last_name,
    formData.middle_name,
    formData.phone_number
  ]);

  const handleInputChange = (field: keyof DeliveryData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 1) return cleaned;
    if (cleaned.length <= 4) return `+7 (${cleaned.slice(1)}`;
    if (cleaned.length <= 7) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    if (cleaned.length <= 9) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  };

  return (
    <div className="delivery-form">
      <div className="main-block mb-5">
        <h3 className="text-lg font-semibold mb-4">Данные для доставки</h3>

        {showPersonalInfo && (
          <>
            <div className="input-container">
              <label htmlFor="delivery_middle_name">Фамилия</label>
              <DaDataInput
                type="fio"
                fioType="surname"
                value={formData.middle_name}
                onChange={(value: string) => handleInputChange('middle_name', value)}
                placeholder="Введите фамилию"
                id="delivery_middle_name"
                required
              />
            </div>

            <div className="input-container">
              <label htmlFor="delivery_first_name">Имя</label>
              <DaDataInput
                type="fio"
                fioType="name"
                value={formData.first_name}
                onChange={(value: string) => handleInputChange('first_name', value)}
                placeholder="Введите имя"
                id="delivery_first_name"
                required
              />
            </div>

            <div className="input-container">
              <label htmlFor="delivery_last_name">Отчество</label>
              <input
                type="text"
                id="delivery_last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="input-str"
                required
                minLength={2}
                placeholder="Введите отчество"
                autoComplete="additional-name"
              />
            </div>

            <div className="input-container">
              <label htmlFor="delivery_phone_number">Номер телефона</label>
              <input
                type="tel"
                id="delivery_phone_number"
                value={formData.phone_number}
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

            <div className="line-user"></div>
          </>
        )}

        <div className="input-container">
          <label htmlFor="delivery_address">Город</label>
          <DaDataInput
            type="address"
            addressType="city"
            value={formData.address}
            onChange={(value, data) => {
              handleInputChange('address', value);
              // Автозаполнение индекса если доступен
              if (data?.postal_code) {
                handleInputChange('postal_code', parseInt(data.postal_code) || 0);
              }
            }}
            placeholder="Введите город"
            id="delivery_address"
            required
          />
        </div>

        <div className="input-container">
          <label htmlFor="delivery_street">Улица</label>
          <DaDataInput
            type="address"
            addressType="street"
            cityContext={formData.address}
            value={formData.street}
            onChange={(value, data) => {
              handleInputChange('street', value);
              // Автозаполнение полей адреса если доступны
              if (data) {
                if (data.house) handleInputChange('home', data.house);
                if (data.flat) handleInputChange('apartment', data.flat);
                if (data.block || data.stead) handleInputChange('build', data.block || data.stead);
                if (data.postal_code) handleInputChange('postal_code', parseInt(data.postal_code) || 0);
              }
            }}
            placeholder="Введите улицу"
            id="delivery_street"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <div className="input-container">
              <label htmlFor="delivery_home">Дом</label>
              <input
                type="text"
                id="delivery_home"
                value={formData.home}
                onChange={(e) => handleInputChange('home', e.target.value)}
                className="input-str"
                required
                placeholder="Номер дома"
              />
            </div>
          </div>
          <div className="w-1/2">
            <div className="input-container">
              <label htmlFor="delivery_apartment">Квартира</label>
              <input
                type="text"
                id="delivery_apartment"
                value={formData.apartment}
                onChange={(e) => handleInputChange('apartment', e.target.value)}
                className="input-str"
                placeholder="Номер квартиры"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <div className="input-container">
              <label htmlFor="delivery_build">Корпус</label>
              <input
                type="text"
                id="delivery_build"
                value={formData.build}
                onChange={(e) => handleInputChange('build', e.target.value)}
                className="input-str"
                placeholder="Корпус/строение"
              />
            </div>
          </div>
          <div className="w-1/2">
            <div className="input-container">
              <label htmlFor="delivery_postal_code">Почтовый индекс</label>
              <input
                type="number"
                id="delivery_postal_code"
                value={formData.postal_code || ''}
                onChange={(e) => handleInputChange('postal_code', parseInt(e.target.value) || 0)}
                className="input-str"
                required
                placeholder="000000"
                min="100000"
                max="999999"
                autoComplete="postal-code"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryForm; 