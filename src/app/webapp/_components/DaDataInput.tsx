'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useDaDataAddress, useDaDataFIO } from '@/hooks/useDaData';

interface DaDataInputProps {
  type: 'address' | 'fio';
  value: string;
  onChange: (value: string, data?: any) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
  // Специфичные для ФИО
  fioType?: 'surname' | 'name' | 'patronymic';
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  // Специфичные для адреса
  addressType?: 'city' | 'street';
  cityContext?: string;
}

const DaDataInput: React.FC<DaDataInputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  className = '',
  required = false,
  id,
  fioType,
  gender,
  addressType,
  cityContext
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Выбираем правильный hook
  const addressHook = useDaDataAddress();
  const fioHook = useDaDataFIO();
  
  const { suggestions, isLoading, getSuggestions, clearSuggestions } = 
    type === 'address' ? addressHook : fioHook;

  // Создаем контейнер для портала
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '999999';
      document.body.appendChild(container);
      setPortalContainer(container);

      return () => {
        document.body.removeChild(container);
      };
    }
  }, []);

  // Функция для расчета позиции выпадающего списка
  const calculateDropdownPosition = () => {
    if (!inputRef.current) return;
    
    const rect = inputRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    setDropdownPosition({
      top: rect.bottom + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.trim().length >= 2) {
      calculateDropdownPosition();
      setShowSuggestions(true);
      setSelectedIndex(-1);
      
      const options: any = {};
      
      if (type === 'fio' && fioType) {
        options.parts = [fioType.toUpperCase()];
        if (gender) {
          options.gender = gender;
        }
      }
      
      if (type === 'address' && addressType === 'city') {
        // Для поиска городов - минимальный набор параметров
        // options.from_bound = "city";
        // options.to_bound = "city";
      }
      
      if (type === 'address' && addressType === 'street' && cityContext) {
        // Убираем префикс "г " если он есть
        const cleanCityName = cityContext.replace(/^г\s+/, '');
        options.locations = [{ city: cleanCityName }];
        // options.from_bound = "street";
        // options.to_bound = "house";
      }
      
      getSuggestions(newValue, options);
    } else {
      setShowSuggestions(false);
      clearSuggestions();
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    // Отладочный вывод для понимания структуры данных
    console.log('DaData suggestion clicked:', {
      type,
      addressType,
      value: suggestion.value,
      data: suggestion.data
    });
    
    // Для улиц извлекаем только название улицы из полного адреса
    if (type === 'address' && addressType === 'street' && suggestion.data) {
      const streetName = suggestion.data.street_with_type || suggestion.data.street || suggestion.value;
      onChange(streetName, suggestion.data);
    } else if (type === 'address' && addressType === 'city') {
      // Для городов передаем полную информацию для дальнейшего использования
      onChange(suggestion.value, suggestion.data);
    } else {
      onChange(suggestion.value, suggestion.data);
    }
    setShowSuggestions(false);
    clearSuggestions();
    setSelectedIndex(-1);
  };

  // Функция для форматирования отображения подсказки
  const formatSuggestionDisplay = (suggestion: any) => {
    if (type === 'address' && addressType === 'street' && suggestion.data) {
      // Для улиц показываем только название улицы
      return suggestion.data.street_with_type || suggestion.data.street || suggestion.value;
    }
    return suggestion.value;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleFocus = () => {
    if (value.trim().length >= 2) {
      calculateDropdownPosition();
      setShowSuggestions(true);
      if (suggestions.length === 0) {
        const options: any = {};
        
        if (type === 'fio' && fioType) {
          options.parts = [fioType.toUpperCase()];
          if (gender) {
            options.gender = gender;
          }
        }
        
        if (type === 'address' && addressType === 'city') {
          // Для поиска городов - минимальный набор параметров
          // options.from_bound = "city";
          // options.to_bound = "city";
        }
        
        if (type === 'address' && addressType === 'street' && cityContext) {
          // Убираем префикс "г " если он есть
          const cleanCityName = cityContext.replace(/^г\s+/, '');
          options.locations = [{ city: cleanCityName }];
          // options.from_bound = "street";
          // options.to_bound = "house";
        }
        
        getSuggestions(value, options);
      }
    }
  };

  const handleSuggestionMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Пересчитываем позицию при ресайзе и скролле
  useEffect(() => {
    const handleResize = () => {
      if (showSuggestions) {
        calculateDropdownPosition();
      }
    };

    const handleScroll = () => {
      if (showSuggestions) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showSuggestions]);

  // Выпадающий список через Portal
  const renderSuggestions = () => {
    if (!showSuggestions || !portalContainer) return null;

    return ReactDOM.createPortal(
      <div 
        className="suggestions-portal"
        style={{ 
          position: 'absolute',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          pointerEvents: 'auto',
          zIndex: 999999,
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          maxHeight: '250px',
          overflow: 'hidden'
        }}
      >
        <div 
          ref={suggestionsRef} 
          className="suggestions scrollable"
          style={{
            maxHeight: '250px',
            overflowY: 'auto',
            backgroundColor: 'white'
          }}
        >
          {isLoading && (
            <div 
              className="suggestion-item"
              style={{ 
                padding: '12px 16px',
                color: '#48C928',
                fontStyle: 'italic',
                background: 'white'
              }}
            >
              🔍 Поиск подсказок...
            </div>
          )}
          
          {!isLoading && suggestions.length > 0 && (
            <>
              <div 
                className="suggestion-item"
                style={{ 
                  padding: '12px 16px',
                  backgroundColor: '#f8f9fa',
                  color: '#6c757d',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'default'
                }}
              >
                Выберите один из вариантов...
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#3D4453',
                    borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                    backgroundColor: selectedIndex === index ? 'rgba(72, 201, 40, 0.12)' : 'white',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseDown={handleSuggestionMouseDown}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {formatSuggestionDisplay(suggestion)}
                </div>
              ))}
            </>
          )}
          
          {!isLoading && suggestions.length === 0 && value.trim().length >= 2 && (
            <div 
              className="suggestion-item"
              style={{ 
                padding: '12px 16px',
                color: '#6c757d',
                fontStyle: 'italic',
                background: 'white'
              }}
            >
              Подсказки не найдены
            </div>
          )}
        </div>
      </div>,
      portalContainer
    );
  };

  return (
    <>
      <div className="address-wrapper" style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={value || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`input-str form-input ${className}`}
          required={required}
          autoComplete="off"
        />
      </div>
      {renderSuggestions()}
    </>
  );
};

export default DaDataInput;
