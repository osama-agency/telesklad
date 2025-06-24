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
          <div className="message-icon">ℹ️</div>
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
            <div className="selected-icon">🎁</div>
            <div className="selected-content">
              <div className="selected-text">Будет списано</div>
              <div className="selected-amount">{selectedBonus.toLocaleString('ru-RU')}₽</div>
            </div>
          </div>
        )}

        <div className="bonus-info">
          <span className="info-icon">💡</span>
          <span className="info-text">Доступно: {userBonus.toLocaleString('ru-RU')}₽ • Шаг: 100₽</span>
        </div>
      </div>
    </div>
  );
} 