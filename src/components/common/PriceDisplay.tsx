import React from 'react';
import { useTRYRate } from '@/hooks/useCurrencyRates';

interface PriceDisplayProps {
  amountRub: number;
  showConverted?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  loading?: boolean;
  inline?: boolean;
  precision?: number;
  primaryCurrency?: 'RUB' | 'TRY'; // Какую валюту показывать основной
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amountRub,
  showConverted = true,
  size = 'md',
  className = '',
  loading = false,
  inline = false,
  precision = 2,
  primaryCurrency = 'RUB'
}) => {
  const { tryRate, isLoading, convertRubToTry } = useTRYRate();
  
  // Состояние загрузки
  if (loading || (showConverted && isLoading)) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${getSizeClasses(size).skeleton} ${className}`}>
        <div className="h-full w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    );
  }

  // Форматирование суммы в рублях
  const formatRubAmount = (amount: number): string => {
    return amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: precision
    });
  };

  // Форматирование суммы в лирах
  const formatTryAmount = (amount: number): string => {
    return amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: precision
    });
  };

  // Вычисляем сумму в лирах
  const tryAmount = showConverted && tryRate ? convertRubToTry(amountRub) : null;

  const sizeClasses = getSizeClasses(size);

  // Определяем основную и дополнительную валюты в зависимости от primaryCurrency
  let primaryText: string;
  let secondaryText: string | null = null;

  if (primaryCurrency === 'TRY' && tryAmount !== null) {
    // Основная валюта - лиры, дополнительная - рубли
    primaryText = `${formatTryAmount(tryAmount)} ₺`;
    secondaryText = showConverted ? `(≈ ${formatRubAmount(amountRub)} ₽)` : null;
  } else {
    // Основная валюта - рубли, дополнительная - лиры (по умолчанию)
    primaryText = `${formatRubAmount(amountRub)} ₽`;
    secondaryText = tryAmount && showConverted ? `(≈ ${formatTryAmount(tryAmount)} ₺)` : null;
  }

  if (inline) {
    return (
      <span className={`${sizeClasses.text} ${className}`}>
        <span className="text-[#1E293B] dark:text-white">
          {primaryText}
        </span>
        {showConverted && secondaryText && (
          <span className="text-[#64748B] dark:text-gray-400 ml-2">
            {secondaryText}
          </span>
        )}
      </span>
    );
  }

  return (
    <div className={`${sizeClasses.container} ${className}`}>
      <span className={`${sizeClasses.text} text-[#1E293B] dark:text-white`}>
        {primaryText}
      </span>
      {showConverted && secondaryText && (
        <span className={`${sizeClasses.secondary} text-[#64748B] dark:text-gray-400 ml-2`}>
          {secondaryText}
        </span>
      )}
    </div>
  );
};

// Вспомогательная функция для получения классов размеров
function getSizeClasses(size: 'sm' | 'md' | 'lg' | 'xl') {
  const configs = {
    sm: {
      text: 'text-sm',
      secondary: 'text-xs',
      container: 'flex items-center',
      skeleton: 'h-4 w-16'
    },
    md: {
      text: 'text-base',
      secondary: 'text-sm',
      container: 'flex items-center',
      skeleton: 'h-5 w-20'
    },
    lg: {
      text: 'text-lg font-semibold',
      secondary: 'text-base',
      container: 'flex items-center',
      skeleton: 'h-6 w-24'
    },
    xl: {
      text: 'text-xl font-bold',
      secondary: 'text-lg',
      container: 'flex items-center',
      skeleton: 'h-7 w-28'
    }
  };

  return configs[size];
}

// Компонент для отображения цены товара с количеством
interface ItemPriceDisplayProps {
  quantity: number;
  unitPriceRub: number;
  totalPriceRub: number;
  showConverted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
  primaryCurrency?: 'RUB' | 'TRY';
}

export const ItemPriceDisplay: React.FC<ItemPriceDisplayProps> = ({
  quantity,
  unitPriceRub,
  totalPriceRub,
  showConverted = true,
  size = 'sm',
  className = '',
  loading = false,
  primaryCurrency = 'RUB'
}) => {
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 dark:bg-gray-700 h-4 w-32 rounded mb-1"></div>
        <div className="bg-gray-200 dark:bg-gray-700 h-3 w-24 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`text-[#64748B] dark:text-gray-400 ${className}`}>
      <div className="flex items-center space-x-1">
        <span className="text-sm">{quantity} шт. ×</span>
        <PriceDisplay
          amountRub={unitPriceRub}
          showConverted={showConverted}
          size={size}
          inline={true}
          primaryCurrency={primaryCurrency}
        />
      </div>
      {totalPriceRub !== unitPriceRub * quantity && (
        <div className="mt-1">
          <span className="text-xs text-[#94A3B8] dark:text-gray-500">Итого: </span>
          <PriceDisplay
            amountRub={totalPriceRub}
            showConverted={showConverted}
            size={size}
            inline={true}
            primaryCurrency={primaryCurrency}
          />
        </div>
      )}
    </div>
  );
};

// Компонент для отображения суммы закупки с выделением
interface PurchaseTotalDisplayProps {
  totalAmountRub: number;
  showConverted?: boolean;
  highlighted?: boolean;
  size?: 'md' | 'lg' | 'xl';
  className?: string;
  loading?: boolean;
  primaryCurrency?: 'RUB' | 'TRY';
}

export const PurchaseTotalDisplay: React.FC<PurchaseTotalDisplayProps> = ({
  totalAmountRub,
  showConverted = true,
  highlighted = false,
  size = 'lg',
  className = '',
  loading = false,
  primaryCurrency = 'RUB'
}) => {
  const baseClasses = highlighted 
    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800'
    : '';

  return (
    <div className={`${baseClasses} ${className}`}>
      <PriceDisplay
        amountRub={totalAmountRub}
        showConverted={showConverted}
        size={size}
        loading={loading}
        primaryCurrency={primaryCurrency}
      />
    </div>
  );
};

export default PriceDisplay;