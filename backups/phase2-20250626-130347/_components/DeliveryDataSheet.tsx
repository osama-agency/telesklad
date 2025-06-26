'use client';

import React, { useState, useEffect } from 'react';
import Sheet from '@/components/ui/sheet';
import { IconComponent } from '@/components/webapp/IconComponent';
import DaDataInput from './DaDataInput';
import { useToast, ToastContainer } from '@/components/ui/toastNotification';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface User {
  first_name: string;
  last_name: string;
  middle_name: string;
  phone_number: string;
  address: string;
  street: string;
  home: string;
  apartment: string;
  build?: string;
  postal_code?: number;
}

interface DeliveryDataSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave?: (data: DeliveryFormData) => Promise<void>;
}

interface DeliveryFormData {
  first_name: string;
  last_name: string; // отчество
  middle_name: string; // фамилия
  phone_number: string;
  address: string;
  street: string;
  home: string;
  apartment: string;
  build: string;
  postal_code: number;
}

const DeliveryDataSheet: React.FC<DeliveryDataSheetProps> = ({
  isOpen,
  onClose,
  user,
  onSave
}) => {
  const { user: authUser } = useTelegramAuth();
  const { toasts, success, error, removeToast } = useToast();
  const [formData, setFormData] = useState<DeliveryFormData>({
    first_name: '',
    last_name: '',
    middle_name: '',
    phone_number: '',
    address: '',
    street: '',
    home: '',
    apartment: '',
    build: '',
    postal_code: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Загружаем данные при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      loadDeliveryData();
    }
  }, [isOpen]);

  const loadDeliveryData = async () => {
    setIsLoadingData(true);
    setErrors({});

    try {
      // Сначала пытаемся загрузить из localStorage
      const localStorageData = localStorage.getItem('webapp_delivery_data');
      let localData = null;
      
      if (localStorageData) {
        try {
          localData = JSON.parse(localStorageData);
        } catch (e) {
          console.warn('Failed to parse localStorage delivery data');
        }
      }

      // Загружаем данные из базы (API определит пользователя из Telegram initData)
      const response = await fetch('/api/webapp/profile/delivery');
      let serverData = null;

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          serverData = result.data;
        }
      }

      // Приоритет: localStorage > база данных > данные пользователя > пустые значения
      const finalData: DeliveryFormData = {
        first_name: localData?.first_name || serverData?.first_name || user.first_name || '',
        last_name: localData?.last_name || serverData?.last_name || user.last_name || '', // отчество
        middle_name: localData?.middle_name || serverData?.middle_name || user.middle_name || '', // фамилия
        phone_number: localData?.phone_number || serverData?.phone_number || user.phone_number || '',
        address: localData?.address || serverData?.address || user.address || '',
        street: localData?.street || serverData?.street || user.street || '',
        home: localData?.home || serverData?.home || user.home || '',
        apartment: localData?.apartment || serverData?.apartment || user.apartment || '',
        build: localData?.build || serverData?.build || user.build || '',
        postal_code: localData?.postal_code || serverData?.postal_code || user.postal_code || 0
      };

      setFormData(finalData);

      // Сохраняем в localStorage, если данные пришли из базы
      if (serverData && !localData) {
        localStorage.setItem('webapp_delivery_data', JSON.stringify(finalData));
      }

    } catch (error) {
      console.error('Error loading delivery data:', error);
      // В случае ошибки используем данные пользователя
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        middle_name: user.middle_name || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        street: user.street || '',
        home: user.home || '',
        apartment: user.apartment || '',
        build: user.build || '',
        postal_code: user.postal_code || 0
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Введите имя';
    }

    if (!formData.middle_name.trim()) {
      newErrors.middle_name = 'Введите фамилию';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Введите номер телефона';
    } else {
      const cleanPhone = formData.phone_number.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        newErrors.phone_number = 'Введите корректный номер телефона';
      }
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Введите улицу';
    }

    if (!formData.home.trim()) {
      newErrors.home = 'Введите номер дома';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Сохраняем в localStorage
      localStorage.setItem('webapp_delivery_data', JSON.stringify(formData));

      // Сохраняем в базу данных (API определит пользователя из Telegram initData)
      const response = await fetch('/api/webapp/profile/delivery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // Показываем уведомление об успешном сохранении
        success('Успешно сохранено', 'Данные для доставки обновлены');
        
        // Вызываем callback если он есть
        if (onSave) {
          await onSave(formData);
        }
        
        // Обновляем профиль в localStorage для других компонентов
        const profileData = localStorage.getItem('webapp_profile');
        if (profileData) {
          try {
            const profile = JSON.parse(profileData);
            const updatedProfile = { ...profile, ...formData };
            localStorage.setItem('webapp_profile', JSON.stringify(updatedProfile));
          } catch (e) {
            console.warn('Failed to update profile in localStorage');
          }
        }

        // Уведомляем другие компоненты об обновлении
        window.dispatchEvent(new Event('profileUpdated'));
        
        // Закрываем модальное окно через небольшую задержку для показа toast
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        error('Ошибка сохранения', result.error || 'Не удалось сохранить данные');
        setErrors({ general: result.error || 'Ошибка сохранения данных' });
      }
    } catch (err) {
      console.error('Error saving delivery data:', err);
      error('Ошибка сохранения', 'Не удалось сохранить данные');
      setErrors({ general: 'Ошибка сохранения данных' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof DeliveryFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Убираем ошибку при вводе
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }

    // Автосохранение в localStorage
    const updatedData = { ...formData, [field]: value };
    localStorage.setItem('webapp_delivery_data', JSON.stringify(updatedData));
  };

  const formatPhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '+7 $1 $2 $3 $4');
    }
    return cleaned.slice(0, 11).replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5');
  };

  // Функция для получения точного индекса по полному адресу
  const fetchPostalCodeForFullAddress = async (city: string, street: string, house: string) => {
    if (!city || !street || !house) return null;
    
    try {
      // Сначала пробуем полный адрес
      const fullAddress = `${city}, ${street}, ${house}`;
      
      let response = await fetch('/api/webapp/dadata/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: fullAddress,
          count: 1
        })
      });
      
      // Если полный адрес не работает, пробуем улицу с домом
      if (!response.ok) {
        const streetWithHouse = `${street}, ${house}`;
        
        response = await fetch('/api/webapp/dadata/address', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: streetWithHouse,
            count: 1,
            locations: [{ city: city }]
          })
        });
      }
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      if (data.suggestions && data.suggestions.length > 0) {
        const suggestion = data.suggestions[0];
        const postalCode = suggestion.data?.postal_code || suggestion.data?.index || suggestion.data?.zip_code;
        
        if (postalCode && postalCode !== '000000' && postalCode !== '') {
          const numericCode = parseInt(String(postalCode).replace(/\D/g, '')) || 0;
          if (numericCode >= 100000 && numericCode <= 999999) {
            return numericCode;
          }
        }
      }
    } catch (error) {
      // Тихо обрабатываем ошибки
    }
    
    return null;
  };

  // Обработчик изменения номера дома - автоматически обновляем индекс
  const handleHouseChange = async (newHouse: string) => {
    handleInputChange('home', newHouse);
    
    // Если есть город, улица и дом - пытаемся получить точный индекс
    if (formData.address && formData.street && newHouse.trim()) {
      const postalCode = await fetchPostalCodeForFullAddress(
        formData.address,
        formData.street,
        newHouse.trim()
      );
      
      if (postalCode && postalCode !== formData.postal_code) {
        handleInputChange('postal_code', postalCode);
      }
    }
  };

  // Обработчик изменения города с автозаполнением индекса
  const handleCityChange = (value: string, data?: any) => {
    const updates: Partial<DeliveryFormData> = { address: value };
    
    // Автозаполнение индекса из данных города
    if (data) {
      const postalCode = data.postal_code || data.index || data.zip_code;
      
      if (postalCode && postalCode !== '000000' && postalCode !== '') {
        const numericCode = parseInt(String(postalCode).replace(/\D/g, '')) || 0;
        if (numericCode >= 100000 && numericCode <= 999999) {
          updates.postal_code = numericCode;
        }
      }
    }
    
    // Применяем все обновления
    Object.keys(updates).forEach(key => {
      handleInputChange(key as keyof DeliveryFormData, updates[key as keyof DeliveryFormData]!);
    });
  };

  // Обработчик изменения улицы с автозаполнением данных
  const handleStreetChange = async (value: string, data?: any) => {
    const updates: Partial<DeliveryFormData> = { street: value };
    
    // Автозаполнение полей адреса если доступны
    if (data) {
      // Автозаполнение дома
      if (data.house) {
        updates.home = String(data.house);
      }
      
      // Автозаполнение квартиры
      if (data.flat) {
        updates.apartment = String(data.flat);
      }
      
      // Автозаполнение корпуса
      if (data.block || data.stead) {
        updates.build = String(data.block || data.stead);
      }
      
      // Индекс из улицы - используем только если он более точный чем текущий
      const postalCode = data.postal_code || data.index || data.zip_code;
      
      if (postalCode && postalCode !== '000000' && postalCode !== '') {
        const numericCode = parseInt(String(postalCode).replace(/\D/g, '')) || 0;
        if (numericCode >= 100000 && numericCode <= 999999) {
          // Обновляем индекс только если он отличается от текущего
          if (numericCode !== formData.postal_code) {
            updates.postal_code = numericCode;
          }
        }
      }
    }
    
    // Применяем все обновления
    Object.keys(updates).forEach(key => {
      handleInputChange(key as keyof DeliveryFormData, updates[key as keyof DeliveryFormData]!);
    });
    
    // Если после выбора улицы у нас есть дом - пытаемся получить точный индекс
    const finalHouse = updates.home || formData.home;
    if (formData.address && value && finalHouse) {
      const precisePostalCode = await fetchPostalCodeForFullAddress(
        formData.address,
        value,
        finalHouse
      );
      
      if (precisePostalCode && precisePostalCode !== (updates.postal_code || formData.postal_code)) {
        handleInputChange('postal_code', precisePostalCode);
      }
    }
  };

  return (
    <>
      <Sheet 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Данные для доставки"
        className="delivery-data-sheet"
      >
        {isLoadingData ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загружаем ваши данные...</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="form-sections">
              {/* Общая ошибка */}
              {errors.general && (
                <div className="error-banner">
                  <IconComponent name="warning" size={16} />
                  {errors.general}
                </div>
              )}

              {/* Личные данные */}
              <div className="form-section">
                <h4 className="section-title">
                  <IconComponent name="profile" size={18} />
                  Личные данные
                </h4>
                
                <div className="form-group">
                  <label htmlFor="middle_name">Фамилия *</label>
                  <DaDataInput
                    type="fio"
                    fioType="surname"
                    value={formData.middle_name}
                    onChange={(value: string) => handleInputChange('middle_name', value)}
                    placeholder="Введите фамилию"
                    id="middle_name"
                    className={errors.middle_name ? 'error' : ''}
                  />
                  {errors.middle_name && <span className="error-text">{errors.middle_name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="first_name">Имя *</label>
                  <DaDataInput
                    type="fio"
                    fioType="name"
                    value={formData.first_name}
                    onChange={(value: string) => handleInputChange('first_name', value)}
                    placeholder="Введите имя"
                    id="first_name"
                    className={errors.first_name ? 'error' : ''}
                  />
                  {errors.first_name && <span className="error-text">{errors.first_name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Отчество</label>
                  <DaDataInput
                    type="fio"
                    fioType="patronymic"
                    value={formData.last_name}
                    onChange={(value: string) => handleInputChange('last_name', value)}
                    placeholder="Введите отчество (необязательно)"
                    id="last_name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone_number">Телефон *</label>
                  <input
                    id="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className={`form-input ${errors.phone_number ? 'error' : ''}`}
                    placeholder="+7 999 999 99 99"
                  />
                  {errors.phone_number && <span className="error-text">{errors.phone_number}</span>}
                </div>
              </div>

              {/* Адрес доставки */}
              <div className="form-section">
                <h4 className="section-title">
                  <IconComponent name="right" size={18} />
                  Адрес доставки
                </h4>

                <div className="form-group">
                  <label htmlFor="address">Город</label>
                  <DaDataInput
                    type="address"
                    addressType="city"
                    value={formData.address}
                    onChange={(value: string, data?: any) => handleCityChange(value, data)}
                    placeholder="Введите город"
                    id="address"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="street">Улица *</label>
                  <DaDataInput
                    type="address"
                    addressType="street"
                    cityContext={formData.address}
                    value={formData.street}
                    onChange={(value: string, data?: any) => handleStreetChange(value, data)}
                    placeholder="Название улицы"
                    id="street"
                    className={errors.street ? 'error' : ''}
                  />
                  {errors.street && <span className="error-text">{errors.street}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="home">Дом *</label>
                    <input
                      id="home"
                      type="text"
                      value={formData.home}
                      onChange={(e) => handleHouseChange(e.target.value)}
                      className={`form-input ${errors.home ? 'error' : ''}`}
                      placeholder="№ дома"
                    />
                    {errors.home && <span className="error-text">{errors.home}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="apartment">Квартира</label>
                    <input
                      id="apartment"
                      type="text"
                      value={formData.apartment}
                      onChange={(e) => handleInputChange('apartment', e.target.value)}
                      className="form-input"
                      placeholder="№ кв."
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="build">Корпус</label>
                    <input
                      id="build"
                      type="text"
                      value={formData.build}
                      onChange={(e) => handleInputChange('build', e.target.value)}
                      className="form-input"
                      placeholder="№ корпуса"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="postal_code">Индекс</label>
                    <input
                      id="postal_code"
                      type="text"
                      value={formData.postal_code || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleInputChange('postal_code', value ? parseInt(value) : 0);
                      }}
                      className="form-input"
                      placeholder="123456"
                      maxLength={6}
                    />
                    {(!formData.postal_code || formData.postal_code === 0) && (
                      <div className="postal-code-hint">
                        💡 Индекс определится автоматически при вводе полного адреса
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isLoading}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        )}
      </Sheet>
      
      {/* Toast уведомления */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

export default DeliveryDataSheet; 