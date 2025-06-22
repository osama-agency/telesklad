import React from 'react';

interface Item {
  quantity: number;
  unitCostTry?: number | null;
  totalCostTry?: number | null;
  primeCost?: number | null;
  productName: string;
}

interface PurchaseItemPriceProps {
  item: Item;
}

const formatPrice = (amount: number | null | undefined, currency: '₺' | '₽') => {
  if (amount === null || amount === undefined) {
    return `0 ${currency}`;
  }
  return `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};

const PurchaseItemPrice: React.FC<PurchaseItemPriceProps> = ({ item }) => {
  const { quantity, unitCostTry, totalCostTry, primeCost } = item;

  const unitPriceRub = primeCost ?? 0;
  const totalPriceRub = unitPriceRub * quantity;

  return (
    <div className="text-sm text-gray-600 dark:text-gray-400">
      <div>
        {quantity} шт. × {formatPrice(unitCostTry, '₺')}
        <span className="text-gray-400 dark:text-gray-500"> (≈ {formatPrice(unitPriceRub, '₽')})</span>
      </div>
      <div className="text-xs text-gray-500">
        Итого: {formatPrice(totalCostTry, '₺')}
        <span className="text-gray-400 dark:text-gray-500"> (≈ {formatPrice(totalPriceRub, '₽')})</span>
      </div>
    </div>
  );
};

export default PurchaseItemPrice; 