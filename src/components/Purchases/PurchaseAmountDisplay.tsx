import React from 'react';
import { PurchaseCalculationService, PurchaseCalculationData } from '@/lib/services/purchase-calculation.service';

interface PurchaseAmountDisplayProps {
  purchase: PurchaseCalculationData;
  className?: string;
  showRateChange?: boolean;
}

interface AmountItemProps {
  formatted: string;
  type: 'primary' | 'creation' | 'payment';
  rateChange?: string | null;
}

const AmountItem: React.FC<AmountItemProps> = ({ formatted, type, rateChange }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'primary':
        return 'text-gray-900 dark:text-white font-semibold text-base';
      case 'creation':
        return 'text-gray-600 dark:text-gray-300 text-sm';
      case 'payment':
        return 'text-blue-600 dark:text-blue-400 text-sm font-medium';
      default:
        return 'text-gray-600 dark:text-gray-300 text-sm';
    }
  };

  return (
    <div className="flex flex-col">
      <span className={getTypeStyles()}>
        {formatted}
      </span>
      {rateChange && type === 'payment' && (
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {rateChange}
        </span>
      )}
    </div>
  );
};

const PurchaseAmountDisplay: React.FC<PurchaseAmountDisplayProps> = ({
  purchase,
  className = '',
  showRateChange = false
}) => {
  const amounts = PurchaseCalculationService.getStructuredAmounts(purchase);
  const rateChange = showRateChange ? PurchaseCalculationService.getRateChangeDescription(purchase) : null;

  if (!amounts.primary) {
    return (
      <div className={`text-gray-500 dark:text-gray-400 text-sm ${className}`}>
        Нет данных о стоимости
      </div>
    );
  }

  // Если это рублевая закупка, показываем только основную сумму
  if (amounts.primary.currency === 'RUB' && !amounts.creation && !amounts.payment) {
    return (
      <div className={className}>
        <AmountItem 
          formatted={amounts.primary.formatted} 
          type="primary"
        />
      </div>
    );
  }

  // Если это закупка в лирах
  return (
    <div className={`space-y-1 ${className}`}>
      {/* Основная сумма в лирах */}
      <AmountItem 
        formatted={amounts.primary.formatted} 
        type="primary"
      />
      
      {/* Рублевая сумма на момент создания */}
      {amounts.creation && (
        <AmountItem 
          formatted={amounts.creation.formatted} 
          type="creation"
        />
      )}
      
      {/* Рублевая сумма на момент оплаты */}
      {amounts.payment && (
        <AmountItem 
          formatted={`${amounts.payment.formatted} (оплата)`} 
          type="payment"
          rateChange={rateChange}
        />
      )}
    </div>
  );
};

export default PurchaseAmountDisplay;

// Компонент для компактного отображения в одну строку
export const PurchaseAmountCompact: React.FC<PurchaseAmountDisplayProps> = ({
  purchase,
  className = ''
}) => {
  const displayString = PurchaseCalculationService.getDisplayString(purchase);
  
  return (
    <span className={`text-sm text-gray-700 dark:text-gray-300 ${className}`}>
      {displayString}
    </span>
  );
};

// Компонент для отображения только изменения курса
export const PurchaseRateChange: React.FC<{ purchase: PurchaseCalculationData }> = ({
  purchase
}) => {
  const rateDiff = PurchaseCalculationService.calculateRateDifference(purchase);
  
  if (!rateDiff.hasRate) {
    return null;
  }

  const isPositive = rateDiff.isPositive;
  const percent = Math.abs(rateDiff.differencePercent!).toFixed(1);
  
  return (
    <div className={`flex items-center text-xs ${
      isPositive 
        ? 'text-red-600 dark:text-red-400' 
        : 'text-green-600 dark:text-green-400'
    }`}>
      <span className="mr-1">
        {isPositive ? '↗' : '↘'}
      </span>
      <span>
        {percent}%
      </span>
    </div>
  );
};

// Компонент для отображения детальной информации о курсах
export const PurchaseRateDetails: React.FC<{ purchase: PurchaseCalculationData }> = ({
  purchase
}) => {
  const rateDiff = PurchaseCalculationService.calculateRateDifference(purchase);
  
  if (!rateDiff.hasRate) {
    return null;
  }

  return (
    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
      <div className="flex justify-between">
        <span>Курс при создании:</span>
        <span>{rateDiff.creationRate!.toFixed(4)} ₽</span>
      </div>
      {rateDiff.paymentRate && (
        <>
          <div className="flex justify-between">
            <span>Курс при оплате:</span>
            <span>{rateDiff.paymentRate.toFixed(4)} ₽</span>
          </div>
          <div className="flex justify-between">
            <span>Изменение:</span>
            <span className={rateDiff.isPositive ? 'text-red-600' : 'text-green-600'}>
              {rateDiff.isPositive ? '+' : ''}
              {rateDiff.differencePercent!.toFixed(1)}%
            </span>
          </div>
        </>
      )}
    </div>
  );
};