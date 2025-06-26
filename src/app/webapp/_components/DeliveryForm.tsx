'use client';

import React from 'react';
import DaDataInput from './DaDataInput';
import SaveStatusIndicator from './SaveStatusIndicator';
import useFormPersistence from '../../../hooks/useFormPersistence';

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
  city?: string; // добавляем поле city
}

// Значения по умолчанию для предотвращения null values
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
  city: ''
};

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
  // Используем хук автосохранения с безопасными значениями по умолчанию
  const {
    formData,
    updateField,
    updateFields,
    isValid,
    isLoaded,
    saveStatus
  } = useFormPersistence<DeliveryData>({
    key: 'webapp_delivery_data',
    initialData: { ...defaultDeliveryData, ...initialData },
    debounceMs: 300,
    onDataChange
  });

  // Безопасные значения для предотвращения null/undefined
  const safeFormData = {
    ...defaultDeliveryData,
    ...formData
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

  // Проверка обязательных полей
  const requiredFields: (keyof DeliveryData)[] = [
    'address', 'street', 'home', 'first_name', 'phone_number'
  ];
  const isFormValid = isValid(requiredFields);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 1) return cleaned;
    if (cleaned.length <= 4) return `+7 (${cleaned.slice(1)}`;
    if (cleaned.length <= 7) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    if (cleaned.length <= 9) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  };

  // Обработчик изменения номера дома - автоматически обновляем индекс
  const handleHouseChange = async (newHouse: string) => {
    updateField('home', newHouse);
    
    // Если есть город, улица и дом - пытаемся получить точный индекс
    if (safeFormData.address && safeFormData.street && newHouse.trim()) {
      const postalCode = await fetchPostalCodeForFullAddress(
        safeFormData.address,
        safeFormData.street,
        newHouse.trim()
      );
      
      if (postalCode && postalCode !== safeFormData.postal_code) {
        updateField('postal_code', postalCode);
      }
    }
  };

  // Показываем индикатор загрузки пока данные не загружены
  if (!isLoaded) {
    return (
      <div className="delivery-form">
        <div className="main-block">
          <h3 className="text-lg font-semibold mb-4">Данные для доставки</h3>
          <div className="delivery-form-skeleton">
            <div className="skeleton-line short"></div>
            <div className="skeleton-line input"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-line input"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-line input"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-form">
      <div className="main-block">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Данные для доставки</h3>
          <SaveStatusIndicator status={saveStatus} />
        </div>

        {showPersonalInfo && (
          <>
            <div className="input-container">
              <label htmlFor="delivery_middle_name" className="required">Фамилия</label>
              <DaDataInput
                type="fio"
                fioType="surname"
                value={safeFormData.middle_name || ''}
                onChange={(value: string) => updateField('middle_name', value)}
                placeholder="Введите фамилию"
                id="delivery_middle_name"
                required
              />
            </div>

            <div className="input-container">
              <label htmlFor="delivery_first_name" className="required">Имя</label>
              <DaDataInput
                type="fio"
                fioType="name"
                value={safeFormData.first_name || ''}
                onChange={(value: string) => updateField('first_name', value)}
                placeholder="Введите имя"
                id="delivery_first_name"
                required
              />
            </div>

            <div className="input-container">
              <label htmlFor="delivery_last_name" className="required">Отчество</label>
              <input
                type="text"
                id="delivery_last_name"
                value={safeFormData.last_name || ''}
                onChange={(e) => updateField('last_name', e.target.value)}
                className="input-str"
                required
                minLength={2}
                placeholder="Введите отчество"
                autoComplete="additional-name"
              />
            </div>

            <div className="input-container">
              <label htmlFor="delivery_phone_number" className="required">Номер телефона</label>
              <input
                type="tel"
                id="delivery_phone_number"
                value={safeFormData.phone_number || ''}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  updateField('phone_number', formatted);
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
          <label htmlFor="delivery_address" className="required">Город</label>
          <DaDataInput
            type="address"
            addressType="city"
            value={safeFormData.address || ''}
            onChange={(value, data) => {
              const updates: Partial<DeliveryData> = { 
                address: value,
                city: value // также сохраняем как city
              };
              
              // Автозаполнение индекса из данных города
              if (data) {
                // Проверяем все возможные поля с индексом
                const postalCode = data.postal_code || data.index || data.zip_code;
                
                if (postalCode && postalCode !== '000000' && postalCode !== '') {
                  const numericCode = parseInt(String(postalCode).replace(/\D/g, '')) || 0;
                  if (numericCode >= 100000 && numericCode <= 999999) {
                    updates.postal_code = numericCode;
                  }
                }
              }
              updateFields(updates);
            }}
            placeholder="Введите город"
            id="delivery_address"
            required
          />
        </div>

        <div className="input-container">
          <label htmlFor="delivery_street" className="required">Улица</label>
          <DaDataInput
            type="address"
            addressType="street"
            cityContext={safeFormData.address}
            value={safeFormData.street || ''}
            onChange={async (value, data) => {
              const updates: Partial<DeliveryData> = { street: value };
              
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
                    if (numericCode !== safeFormData.postal_code) {
                      updates.postal_code = numericCode;
                    }
                  }
                }
              }
              
              updateFields(updates);
              
              // Если после выбора улицы у нас есть дом - пытаемся получить точный индекс
              const finalHouse = updates.home || safeFormData.home;
              if (safeFormData.address && value && finalHouse) {
                const precisePostalCode = await fetchPostalCodeForFullAddress(
                  safeFormData.address,
                  value,
                  finalHouse
                );
                
                if (precisePostalCode && precisePostalCode !== (updates.postal_code || safeFormData.postal_code)) {
                  updateField('postal_code', precisePostalCode);
                }
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
              <label htmlFor="delivery_home" className="required">Дом</label>
              <input
                type="text"
                id="delivery_home"
                value={safeFormData.home || ''}
                onChange={(e) => handleHouseChange(e.target.value)}
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
                value={safeFormData.apartment || ''}
                onChange={(e) => updateField('apartment', e.target.value)}
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
                value={safeFormData.build || ''}
                onChange={(e) => updateField('build', e.target.value)}
                className="input-str"
                placeholder="Корпус/строение"
              />
            </div>
          </div>
          <div className="w-1/2">
            <div className="input-container">
              <label htmlFor="delivery_postal_code" className="required">Почтовый индекс</label>
              <input
                type="number"
                id="delivery_postal_code"
                value={safeFormData.postal_code > 0 ? safeFormData.postal_code : ''}
                onChange={(e) => updateField('postal_code', parseInt(e.target.value) || 0)}
                className="input-str"
                required
                placeholder="000000"
                min="100000"
                max="999999"
                autoComplete="postal-code"
              />
              {(!safeFormData.postal_code || safeFormData.postal_code === 0) && (
                <div className="text-xs text-gray-500 mt-1">
                  💡 Индекс определится автоматически при вводе полного адреса
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Индикатор валидности формы */}
        {!isFormValid && (
          <div className="form-validation-warning">
            <p>Заполните все обязательные поля для продолжения</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryForm;
