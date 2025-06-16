'use client';

import React, { useState } from 'react';

interface ReceivePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseId: number;
  purchaseName: string;
  onReceived: (data: any) => void;
}

const ReceivePurchaseModal: React.FC<ReceivePurchaseModalProps> = ({
  isOpen,
  onClose,
  purchaseId,
  purchaseName,
  onReceived,
}) => {
  const [deliveryDays, setDeliveryDays] = useState<number>(20);
  const [additionalExpenses, setAdditionalExpenses] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deliveryDays || deliveryDays <= 0) {
      alert('Пожалуйста, укажите количество дней доставки');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/purchases/${purchaseId}/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveryDays,
          additionalExpenses: additionalExpenses > 0 ? additionalExpenses : undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onReceived(result.data);
        onClose();
        // Сбрасываем форму
        setDeliveryDays(20);
        setAdditionalExpenses(0);
        setNotes('');
        alert(result.message || 'Закупка успешно оприходована!');
      } else {
        alert(result.error || 'Ошибка при оприходовании закупки');
      }
    } catch (error) {
      console.error('Ошибка оприходования:', error);
      alert('Ошибка при оприходовании закупки');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      // Сбрасываем форму при закрытии
      setDeliveryDays(20);
      setAdditionalExpenses(0);
      setNotes('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white">
            Оприходование закупки
          </h3>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-[#64748B] dark:text-gray-400 mb-2">
            Закупка: <span className="font-medium text-[#374151] dark:text-gray-300">{purchaseName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Количество дней доставки */}
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Количество дней доставки *
            </label>
            <input
              type="number"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(Number(e.target.value))}
              min="1"
              max="365"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white
                       focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20
                       disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Например: 15"
            />
            <p className="mt-1 text-xs text-[#64748B] dark:text-gray-400">
              Укажите фактическое количество дней от оформления до получения товара
            </p>
          </div>

          {/* Дополнительные расходы */}
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Дополнительные расходы на логистику (₽)
            </label>
            <input
              type="number"
              value={additionalExpenses}
              onChange={(e) => setAdditionalExpenses(Number(e.target.value))}
              min="0"
              step="0.01"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white
                       focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20
                       disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0"
            />
          </div>

          {/* Примечания */}
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Примечания при получении
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white
                       focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20
                       disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              placeholder="Дополнительная информация о получении товара..."
            />
          </div>

          {/* Кнопки */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg 
                       text-[#374151] dark:text-gray-300 bg-white dark:bg-gray-700
                       hover:bg-gray-50 dark:hover:bg-gray-600 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading || !deliveryDays || deliveryDays <= 0}
              className="flex-1 px-4 py-2 rounded-lg text-white font-medium
                       bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF]
                       hover:scale-105 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Оприходование...
                </>
              ) : (
                'Оприходовать'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceivePurchaseModal; 