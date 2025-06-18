"use client";

import React, { useState, useEffect } from 'react';
import { Purchase } from '@/hooks/usePurchases';
import { EditableField } from '@/components/ui/EditableField';
import toast from 'react-hot-toast';

interface EditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
  onSave: (data: {
    id: number;
    totalAmount?: number;
    items?: Array<{
      id: number;
      quantity: number;
      costPrice: number;
    }>;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function EditPurchaseModal({
  isOpen,
  onClose,
  purchase,
  onSave,
  isLoading = false
}: EditPurchaseModalProps) {
  const [items, setItems] = useState<Purchase['items']>([]);

  useEffect(() => {
    if (purchase && isOpen) {
      setItems(purchase.items || []);
    }
  }, [purchase, isOpen]);

  const handleSave = async () => {
    if (!purchase) return;

    try {
      const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
      
      await onSave({
        id: purchase.id,
        totalAmount,
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          costPrice: item.costPrice,
        }))
      });
      toast.success('Закупка успешно обновлена');
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      toast.error('Ошибка при сохранении изменений');
    }
  };

  const updateItemQuantity = async (itemId: number, quantity: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newTotal = quantity * item.costPrice;
        return { ...item, quantity, total: newTotal };
      }
      return item;
    }));
  };

  const updateItemCostPrice = async (itemId: number, costPrice: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newTotal = item.quantity * costPrice;
        return { ...item, costPrice, total: newTotal };
      }
      return item;
    }));
  };

  if (!isOpen || !purchase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-dark rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stroke dark:border-dark-3">
          <div>
            <h2 className="text-xl font-bold text-dark dark:text-white">
              Редактировать закупку #{purchase.id}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Изменить детали закупки и товары • {purchase.items?.length || 0} позиций • {new Date(purchase.createdAt).toLocaleDateString('ru-RU')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Статус
              </label>
              <div className="px-4 py-3 rounded-lg border border-stroke dark:border-dark-3 bg-gray-50 dark:bg-gray-800 text-dark dark:text-white">
                {purchase.status === 'draft' && '🗒️ Черновик'}
                {purchase.status === 'sent' && '📤 Отправлено'}
                {purchase.status === 'awaiting_payment' && '💳 Ожидает оплату'}
                {purchase.status === 'paid' && '💰 Оплачено'}
                {purchase.status === 'in_transit' && '🚚 В пути'}
                {purchase.status === 'received' && '✅ Получено'}
                {purchase.status === 'cancelled' && '❌ Отменено'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Дата создания
              </label>
              <div className="px-4 py-3 rounded-lg border border-stroke dark:border-dark-3 bg-gray-50 dark:bg-gray-800 text-dark dark:text-white">
                {new Date(purchase.createdAt).toLocaleString('ru-RU')}
              </div>
            </div>
          </div>

          {/* Товары */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                📦 Товары в закупке ({items.length})
              </h3>
              <div className="text-right">
                <div className="text-sm text-gray-500">Общий вес товаров</div>
                <div className="font-medium text-dark dark:text-white">
                  {items.reduce((sum, item) => sum + item.quantity, 0)} шт.
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="p-4 border border-stroke dark:border-dark-3 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-dark dark:text-white text-lg">
                        {item.product?.name || `Товар #${item.productId}`}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-gray-500">ID товара: {item.productId}</p>
                        <p className="text-sm text-gray-500">ID позиции: {item.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                        {item.quantity} × {item.costPrice.toLocaleString()} ₽
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Количество
                      </label>
                      <EditableField
                        value={item.quantity}
                        label="количество"
                        suffix="шт."
                        type="integer"
                        min={1}
                        onSave={(value) => updateItemQuantity(item.id, value)}
                        displayClassName="text-sm"
                        formatDisplay={(value) => `${value} шт.`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Цена за единицу (₽)
                      </label>
                      <EditableField
                        value={item.costPrice}
                        label="цену за единицу"
                        suffix="₽"
                        type="decimal"
                        min={0}
                        onSave={(value) => updateItemCostPrice(item.id, value)}
                        displayClassName="text-sm"
                        formatDisplay={(value) => `${value.toLocaleString()} ₽`}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-stroke dark:border-dark-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Итого за товар:</span>
                      <div className="font-medium text-dark dark:text-white">
                        {item.total.toLocaleString()} ₽
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Общая сумма */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-dark dark:text-white">
                  Общая сумма закупки:
                </span>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">
                    {items.reduce((sum, item) => sum + item.total, 0).toLocaleString()} ₽
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-stroke dark:border-dark-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 border border-stroke dark:border-dark-3 text-dark dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
} 