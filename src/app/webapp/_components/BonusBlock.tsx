'use client';

import React, { useState } from 'react';
import { IconComponent } from '@/components/webapp/IconComponent';

interface AccountTier {
  id: number;
  title: string;
  order_threshold: number;
  bonus_percentage: number;
  order_min_amount: number;
}

interface User {
  id: number;
  first_name: string;
  bonus_balance: number;
  order_count: number;
  account_tier: AccountTier | null;
}

interface BonusBlockProps {
  user: User;
  accountTiers: AccountTier[];
  remainingToNextTier: number | null;
  nextTier: AccountTier | null;
}

const BonusBlock: React.FC<BonusBlockProps> = ({
  user,
  accountTiers,
  remainingToNextTier,
  nextTier
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentTier = user.account_tier;
  const bonusThreshold = 1000; // Минимальная сумма заказа для начисления бонусов

  const renderProgressBar = () => {
    if (!nextTier || remainingToNextTier === null) {
      return <div className="text-[10px] font-medium">Вы достигли максимального уровня</div>;
    }

    const total = nextTier.order_threshold;
    const completed = user.order_count;
    const remaining = remainingToNextTier;

    return (
      <>
        <div className="flex justify-between mb-2 gap-1">
          {Array.from({ length: total }, (_, i) => {
            const isCompleted = i < completed;
            return (
              <div
                key={i}
                className={`h-1 bg-white rounded ${!isCompleted ? '!bg-white/40' : ''}`}
                style={{ width: `${100 / total}%` }}
              />
            );
          })}
        </div>
        <div className="text-[10px] font-medium">
          {remaining === 1 
            ? `${remaining} заказ до следующего уровня`
            : remaining < 5
            ? `${remaining} заказа до следующего уровня`
            : `${remaining} заказов до следующего уровня`
          }
        </div>
      </>
    );
  };

  return (
    <>
      <div className="bonus-block">
        <div className="p-5">
          <div className="flex justify-between">
            <div>
              <div className="text-sm text-gray-600">Ваш баланс</div>
              <div className="bonus-balance text-lg font-semibold">{user.bonus_balance}₽</div>
            </div>
            <div 
              className="account-tier cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="text-sm text-gray-600">
                {currentTier?.title || 'Гость'}
              </div>
              <IconComponent name="info" size={16} />
            </div>
          </div>
        </div>
        
        <div className="bonus-block-footer">
          {renderProgressBar()}
        </div>
      </div>

      {/* Модальное окно с уровнями лояльности */}
      {isModalOpen && (
        <div className="modal-account-tier">
          <div className="modal-wrapper">
            <div className="modal-title">
              <span className="font-semibold">Уровни программы лояльности</span>
              <div 
                className="close cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                <IconComponent name="close" />
              </div>
            </div>
            <div className="modal-body">
              {accountTiers.map(tier => (
                <div key={tier.id} className="flex flex-wrap py-2">
                  <div className="w-1/2 pe-1 title font-medium">{tier.title}</div>
                  <div className="w-1/2 desc">
                    <div className="mb-2">{tier.bonus_percentage}% кэшбэка</div>
                    <div className="text-sm text-gray-600">
                      {tier.order_threshold === 1 
                        ? 'Присваивается при первом заказе'
                        : `Заказов надо сделать – ${tier.order_threshold}`
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-1 font-medium text-[10px] text-gray-600">
              Бонусы начисляются при заказах от {bonusThreshold}₽
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BonusBlock; 