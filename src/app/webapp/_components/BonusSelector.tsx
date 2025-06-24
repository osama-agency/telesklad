'use client';

import { useState, useEffect, useMemo } from 'react';

interface BonusSelectorProps {
  userBonus: number;
  totalPrice: number;
  bonusThreshold: number;
  onBonusChange: (amount: number) => void;
  disabled?: boolean;
}

export default function BonusSelector({
  userBonus,
  totalPrice,
  bonusThreshold,
  onBonusChange,
  disabled = false
}: BonusSelectorProps) {
  const [selectedBonus, setSelectedBonus] = useState(0);

  // Вычисляем максимальное количество бонусов, которое можно потратить
  const maxApplicableBonus = useMemo(() => {
    return Math.min(userBonus, totalPrice);
  }, [userBonus, totalPrice]);

  // Бонусы применяются с шагом 100₽
  const applicableBonusSteps = useMemo(() => {
    return Math.floor(maxApplicableBonus / 100) * 100;
  }, [maxApplicableBonus]);

  // Проверяем, можно ли использовать бонусы
  const bonusDisabled = useMemo(() => {
    return disabled || totalPrice < bonusThreshold || applicableBonusSteps === 0;
  }, [disabled, totalPrice, bonusThreshold, applicableBonusSteps]);

  // Сбрасываем бонусы если условия изменились
  useEffect(() => {
    if (bonusDisabled && selectedBonus > 0) {
      setSelectedBonus(0);
      onBonusChange(0);
    } else if (selectedBonus > applicableBonusSteps) {
      const newAmount = applicableBonusSteps;
      setSelectedBonus(newAmount);
      onBonusChange(newAmount);
    }
  }, [bonusDisabled, applicableBonusSteps, selectedBonus, onBonusChange]);

  const handleBonusChange = (amount: number) => {
    setSelectedBonus(amount);
    onBonusChange(amount);
  };

  if (bonusDisabled) {
    return (
      <div className="bonus-selector-card disabled">
        <div className="bonus-header">
          <div className="bonus-icon disabled-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="bonus-title">Бонусы недоступны</h3>
        </div>
        
        <div className="bonus-message">
          <div className="message-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="message-text">
            {userBonus < 100 ? (
              'У вас недостаточно бонусов (нужно ≥ 100₽)'
            ) : totalPrice < bonusThreshold ? (
              `Минимальная сумма заказа: ${bonusThreshold.toLocaleString('ru-RU')}₽`
            ) : (
              'Бонусы недоступны для данного заказа'
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bonus-selector-card">
      <div className="bonus-header">
        <div className="bonus-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bonus-gradient" x1="6.043" y1="5.543" x2="15.957" y2="15.457" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#fd0"/>
                <stop offset="1" stopColor="#feb100"/>
              </linearGradient>
            </defs>
            <path d="m19.906 8.576a1 1 0 0 0 -.906-.576h-4.382l2.276-4.553a1 1 0 0 0 -.894-1.447h-6a1 1 0 0 0 -.874.514l-5 9a1 1 0 0 0 .874 1.486h4.753l-1.729 7.783a1 1 0 0 0 1.744.857l10-12a1 1 0 0 0 .138-1.064z" fill="url(#bonus-gradient)"/>
          </svg>
        </div>
        <h3 className="bonus-title">Используйте бонусы</h3>
        <div className="bonus-balance">{userBonus.toLocaleString('ru-RU')}₽</div>
      </div>
      
      <div className="bonus-slider-container">
        <div className="bonus-range-labels">
          <span className="range-label">0₽</span>
          <span className="range-label">{applicableBonusSteps.toLocaleString('ru-RU')}₽</span>
        </div>
        
        <div className="bonus-slider-wrapper">
          <input
            className="bonus-range-slider"
            name="bonus"
            type="range"
            min={0}
            max={applicableBonusSteps}
            step={100}
            value={selectedBonus}
            onChange={(e) => handleBonusChange(parseInt(e.target.value, 10))}
          />
          <div className="slider-track-fill" style={{width: `${(selectedBonus / applicableBonusSteps) * 100}%`}}></div>
        </div>

        {selectedBonus > 0 && (
          <div className="bonus-selected">
            <div className="selected-content">
              <span className="selected-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="20" cy="16" r="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              <span>Будет списано</span>
            </div>
            <div className="selected-amount">{selectedBonus.toLocaleString('ru-RU')}₽</div>
          </div>
        )}


      </div>
    </div>
  );
} 