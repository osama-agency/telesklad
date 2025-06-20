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
      <div className="bonus-block-cart opacity-50">
        <h3>Использовать бонусы</h3>
        <p className="text-xs text-gray-500 mt-2">
          {userBonus < 100 ? (
            'У вас недостаточно бонусов (нужно ≥ 100₽)'
          ) : totalPrice < bonusThreshold ? (
            `Минимальная сумма заказа для использования бонусов: ${bonusThreshold}₽`
          ) : (
            'Бонусы недоступны'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="main-block mb-5 bonus-block-cart">
      <h3>Используйте бонусы</h3>
      
      <div className="bonus-ranges">
        <div>0₽</div>
        <div>{applicableBonusSteps}₽</div>
      </div>
      
      <div className="px-3">
        <input
          className="bonus-range"
          name="bonus"
          type="range"
          min={0}
          max={applicableBonusSteps}
          step={100}
          value={selectedBonus}
          onChange={(e) => handleBonusChange(parseInt(e.target.value, 10))}
        />
      </div>

      {selectedBonus > 0 && (
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-600">
            Будет списано: <span className="font-semibold text-green-600">{selectedBonus}₽</span>
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Доступно к списанию: {userBonus}₽ • Шаг: 100₽
      </div>
    </div>
  );
} 