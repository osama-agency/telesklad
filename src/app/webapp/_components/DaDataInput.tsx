'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Выбираем правильный hook
  const addressHook = useDaDataAddress();
  const fioHook = useDaDataFIO();
  
  const { suggestions, isLoading, getSuggestions, clearSuggestions } = 
    type === 'address' ? addressHook : fioHook;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.trim().length >= 2) {
      const options: any = {};
      
      if (type === 'fio' && fioType) {
        options.parts = [fioType.toUpperCase()];
        if (gender) {
          options.gender = gender;
        }
      }
      
      if (type === 'address' && addressType === 'street' && cityContext) {
        options.query = `${cityContext} ${newValue}`;
      }
      
      getSuggestions(newValue, options);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setShowSuggestions(false);
      clearSuggestions();
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    onChange(suggestion.value, suggestion.data);
    setShowSuggestions(false);
    clearSuggestions();
    setSelectedIndex(-1);
    
    // Автозаполнение для адресов
    if (type === 'address' && suggestion.data) {
      // Можно добавить логику автозаполнения других полей
      // Например, если выбран полный адрес, заполнить индекс, дом и т.д.
    }
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
    // Задержка, чтобы клик по подсказке успел сработать
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="address-wrapper relative">
      <input
        ref={inputRef}
        type="text"
        id={id}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`input-str ${className}`}
        required={required}
        autoComplete="off"
      />
      
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="suggestions-wrapper">
          <div ref={suggestionsRef} className="suggestions scrollable">
            {isLoading && (
              <div className="suggestion-item">
                Поиск подсказок...
              </div>
            )}
            
            {!isLoading && suggestions.length > 0 && (
              <>
                <div className="suggestion-item">
                  Выберите один из вариантов...
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.value}
                  </div>
                ))}
              </>
            )}
            
            {!isLoading && suggestions.length === 0 && (
              <div className="suggestion-item">
                Подсказки не найдены
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DaDataInput; 