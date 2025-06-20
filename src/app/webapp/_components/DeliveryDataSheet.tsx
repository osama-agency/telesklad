'use client';

import React, { useState, useEffect } from 'react';
import Sheet from '@/components/ui/sheet';
import { IconComponent } from '@/components/webapp/IconComponent';

interface User {
  first_name: string;
  last_name: string;
  middle_name: string;
  phone_number: string;
  address: string;
  street: string;
  home: string;
  apartment: string;
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
  street: string;
  home: string;
  apartment: string;
}

const DeliveryDataSheet: React.FC<DeliveryDataSheetProps> = ({
  isOpen,
  onClose,
  user,
  onSave
}) => {
  const [formData, setFormData] = useState<DeliveryFormData>({
    first_name: '',
    last_name: '',
    middle_name: '',
    phone_number: '',
    street: '',
    home: '',
    apartment: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '', // отчество
        middle_name: user.middle_name || '', // фамилия
        phone_number: user.phone_number || '',
        street: user.street || '',
        home: user.home || '',
        apartment: user.apartment || ''
      });
      setErrors({});
    }
  }, [isOpen, user]);

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
      if (onSave) {
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving delivery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof DeliveryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Убираем ошибку при вводе
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatPhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '+7 $1 $2 $3 $4');
    }
    return cleaned.slice(0, 11).replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5');
  };

  return (
    <Sheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Данные для доставки"
      className="delivery-data-sheet"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="form-sections">
          {/* Личные данные */}
          <div className="form-section">
            <h4 className="section-title">
              <IconComponent name="profile" size={18} />
              Личные данные
            </h4>
            
            <div className="form-group">
              <label htmlFor="middle_name">Фамилия *</label>
              <input
                id="middle_name"
                type="text"
                value={formData.middle_name}
                onChange={(e) => handleInputChange('middle_name', e.target.value)}
                className={`form-input ${errors.middle_name ? 'error' : ''}`}
                placeholder="Введите фамилию"
              />
              {errors.middle_name && <span className="error-text">{errors.middle_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="first_name">Имя *</label>
              <input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className={`form-input ${errors.first_name ? 'error' : ''}`}
                placeholder="Введите имя"
              />
              {errors.first_name && <span className="error-text">{errors.first_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Отчество</label>
              <input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="form-input"
                placeholder="Введите отчество (необязательно)"
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
              <label htmlFor="street">Улица *</label>
              <input
                id="street"
                type="text"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                className={`form-input ${errors.street ? 'error' : ''}`}
                placeholder="Название улицы"
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
                  onChange={(e) => handleInputChange('home', e.target.value)}
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

      <style jsx>{`
        .form-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-section {
          background: #F9FAFB;
          border-radius: 12px;
          padding: 16px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #D1D5DB;
          border-radius: 8px;
          font-size: 16px;
          background: white;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #48C928;
          box-shadow: 0 0 0 3px rgba(72, 201, 40, 0.1);
        }

        .form-input.error {
          border-color: #EF4444;
        }

        .error-text {
          display: block;
          color: #EF4444;
          font-size: 12px;
          margin-top: 4px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #F3F4F6;
        }

        .btn-secondary {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #D1D5DB;
          background: white;
          color: #374151;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #F9FAFB;
          border-color: #9CA3AF;
        }

        .btn-primary {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: #48C928;
          color: white;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #3AA120;
        }

        .btn-primary:disabled,
        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Адаптивность */
        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .form-section {
            padding: 12px;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </Sheet>
  );
};

export default DeliveryDataSheet; 