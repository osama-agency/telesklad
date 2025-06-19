"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from 'react-hot-toast';

interface PurchaseItem {
  id: number;
  productId: number;
  quantity: number;
  costPrice: number;
  total: number;
  product?: {
    id: number;
    name: string;
  };
}

interface Purchase {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: PurchaseItem[];
}

interface ReceivePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
  onReceive: (data: {
    purchaseId: number;
    items: Array<{
      id: number;
      receivedQuantity: number;
    }>;
    logisticsExpense: number;
    receivedAt: string;
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function ReceivePurchaseModal({
  isOpen,
  onClose,
  purchase,
  onReceive,
  isLoading = false
}: ReceivePurchaseModalProps) {
  const [receivedItems, setReceivedItems] = useState<Array<{
    id: number;
    receivedQuantity: number;
  }>>([]);
  
  const [logisticsExpense, setLogisticsExpense] = useState<number>(0);
  const [receivedAt, setReceivedAt] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');

  // Инициализация данных при открытии модального окна
  const initializeItems = () => {
    if (purchase?.items) {
      setReceivedItems(
        purchase.items.map(item => ({
          id: item.id,
          receivedQuantity: item.quantity
        }))
      );
    }
  };

  // Обновление полученного количества для товара
  const updateReceivedQuantity = (itemId: number, quantity: number) => {
    setReceivedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, receivedQuantity: Math.max(0, quantity) }
          : item
      )
    );
  };

  // Обработка оприходования
  const handleReceive = async () => {
    if (!purchase) return;

    // Валидация
    if (receivedItems.some(item => item.receivedQuantity < 0)) {
      toast.error('Количество не может быть отрицательным');
      return;
    }

    if (logisticsExpense < 0) {
      toast.error('Расходы на логистику не могут быть отрицательными');
      return;
    }

    if (!receivedAt) {
      toast.error('Укажите дату получения товара');
      return;
    }

    try {
      await onReceive({
        purchaseId: purchase.id,
        items: receivedItems,
        logisticsExpense,
        receivedAt,
        notes: notes.trim() || undefined
      });

      // Закрываем модальное окно
      onClose();
      
      // Сброс формы
      setReceivedItems([]);
      setLogisticsExpense(0);
      setReceivedAt(new Date().toISOString().split('T')[0]);
      setNotes('');
      
      toast.success('Товар успешно оприходован!');
    } catch (error) {
      console.error('Ошибка оприходования:', error);
      toast.error('Ошибка при оприходовании товара');
    }
  };

  // Инициализация при открытии
  if (isOpen && purchase && receivedItems.length === 0) {
    initializeItems();
  }

  // Расчет общих показателей
  const totalReceivedItems = receivedItems.reduce((sum, item) => sum + item.receivedQuantity, 0);
  const originalTotalItems = purchase?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const completionPercentage = originalTotalItems > 0 ? (totalReceivedItems / originalTotalItems) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-dark rounded-xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stroke dark:border-dark-3">
              <div>
                <h2 className="text-2xl font-bold text-dark dark:text-white">
                  🚚 Оприходование закупки #{purchase?.id}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Укажите фактически полученное количество товара и расходы на логистику
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* Progress indicator */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Процент получения товара
                  </span>
                  <span className="text-lg font-bold text-blue-800 dark:text-blue-300">
                    {completionPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mt-1">
                  <span>Получено: {totalReceivedItems} шт.</span>
                  <span>Заказано: {originalTotalItems} шт.</span>
                </div>
              </div>

              {/* Items list */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-dark dark:text-white mb-4">
                  📦 Товары в закупке
                </h3>
                <div className="space-y-3">
                  {purchase?.items.map((item, index) => {
                    const receivedItem = receivedItems.find(ri => ri.id === item.id);
                    const receivedQty = receivedItem?.receivedQuantity || 0;
                    const isPartial = receivedQty < item.quantity;
                    const isOverReceived = receivedQty > item.quantity;
                    
                    return (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-dark dark:text-white text-base">
                            {item.product?.name || `Товар #${item.productId}`}
                          </h4>
                          <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-4">
                            <span className="flex items-center gap-1">
                              📦 <strong>Заказано:</strong> {item.quantity} шт.
                            </span>
                            <span className="flex items-center gap-1">
                              💰 <strong>Цена:</strong> {item.costPrice.toLocaleString()} ₽/шт
                            </span>
                            <span className="flex items-center gap-1">
                              💳 <strong>Сумма:</strong> {item.total.toLocaleString()} ₽
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Quantity input */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-dark dark:text-white whitespace-nowrap">
                              Получено:
                            </label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateReceivedQuantity(item.id, receivedQty - 1)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                value={receivedQty}
                                onChange={(e) => updateReceivedQuantity(item.id, parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 text-center border border-stroke dark:border-dark-3 rounded-lg bg-transparent dark:text-white"
                                min="0"
                              />
                              <button
                                onClick={() => updateReceivedQuantity(item.id, receivedQty + 1)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Status indicator */}
                          <div className="flex items-center gap-2">
                            {isOverReceived ? (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 text-xs rounded-full">
                                📈 Больше заказанного
                              </span>
                            ) : isPartial ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs rounded-full">
                                ⚠️ Частично
                              </span>
                            ) : receivedQty === item.quantity ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs rounded-full">
                                ✅ Полностью
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs rounded-full">
                                ❌ Не получено
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Logistics and date section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Logistics expense */}
                <div>
                  <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                    💸 Расходы на логистику (₽)
                  </label>
                  <input
                    type="number"
                    value={logisticsExpense}
                    onChange={(e) => setLogisticsExpense(Number(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-stroke dark:border-dark-3 rounded-lg bg-transparent dark:text-white focus:border-primary dark:focus:border-primary outline-none"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Будет добавлено в расходы с категорией &quot;Логистика&quot;
                  </p>
                </div>

                {/* Received date */}
                <div>
                  <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                    📅 Дата получения товара
                  </label>
                  <input
                    type="date"
                    value={receivedAt}
                    onChange={(e) => setReceivedAt(e.target.value)}
                    className="w-full px-4 py-2 border border-stroke dark:border-dark-3 rounded-lg bg-transparent dark:text-white focus:border-primary dark:focus:border-primary outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Используется для расчета среднего времени доставки
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                  📝 Примечания (необязательно)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-stroke dark:border-dark-3 rounded-lg bg-transparent dark:text-white focus:border-primary dark:focus:border-primary outline-none"
                  rows={3}
                  placeholder="Дополнительная информация о получении товара..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-stroke dark:border-dark-3 bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {logisticsExpense > 0 && (
                  <span>Расходы на логистику: <strong>{logisticsExpense.toLocaleString()} ₽</strong></span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  Отмена
                </button>
                <button
                  onClick={handleReceive}
                  disabled={isLoading || totalReceivedItems === 0}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg transform hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Оприходование...
                    </div>
                  ) : (
                    '✅ Оприходовать товар'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 