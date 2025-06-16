'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';

interface PurchaseItem {
  id?: number;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
  productId?: number;
}

interface Purchase {
  id?: number;
  totalAmount: number;
  status: string;
  isUrgent: boolean;
  items: PurchaseItem[];
  createdAt?: string;
  supplierName?: string;
  notes?: string;
  telegramMessageId?: number;
  telegramChatId?: string;
}

const PurchaseCartManager: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const { addToast } = useToast();

  // Загрузка закупок
  const loadPurchases = async () => {
    try {
      const response = await fetch('/api/purchases');
      if (!response.ok) throw new Error('Failed to load purchases');
      
      const data = await response.json();
      setPurchases(data);
    } catch (error: any) {
      console.error('Error loading purchases:', error);
      addToast('Ошибка загрузки закупок', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Отправка закупки поставщику
  const sendToSupplier = async (purchaseId: number) => {
    setSendingId(purchaseId);
    
    try {
      const response = await fetch(`/api/purchases/${purchaseId}/send-to-supplier`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send purchase');
      }

      const result = await response.json();
      
      addToast('Закупка отправлена поставщику!', 'success');
      
      // Обновляем статус в локальном состоянии
      setPurchases(prev => prev.map(p => 
        p.id === purchaseId 
          ? { ...p, status: 'sent_to_supplier', telegramMessageId: result.purchase.telegramMessageId }
          : p
      ));

    } catch (error: any) {
      console.error('Error sending purchase:', error);
      addToast(`Ошибка отправки: ${error.message}`, 'error');
    } finally {
      setSendingId(null);
    }
  };

  // Получение текста статуса
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': '🗒️ Черновик',
      'sent_to_supplier': '📤 Отправлено поставщику',
      'supplier_editing': '✏️ Поставщик редактирует',
      'awaiting_payment': '💳 Ожидает оплату',
      'paid': '💰 Оплачено',
      'preparing': '📦 Готовится к отправке',
      'shipped': '🚚 Отправлено в карго',
      'in_transit': '🛫 В пути',
      'delivered': '✅ Доставлено',
      'cancelled': '❌ Отменено'
    };
    return statusMap[status] || status;
  };

  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'sent_to_supplier': 'bg-blue-100 text-blue-800',
      'supplier_editing': 'bg-yellow-100 text-yellow-800',
      'awaiting_payment': 'bg-orange-100 text-orange-800',
      'paid': 'bg-green-100 text-green-800',
      'preparing': 'bg-purple-100 text-purple-800',
      'shipped': 'bg-indigo-100 text-indigo-800',
      'in_transit': 'bg-cyan-100 text-cyan-800',
      'delivered': 'bg-emerald-100 text-emerald-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Загрузка закупок...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Управление закупками
        </h2>
        <button
          onClick={loadPurchases}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Обновить
        </button>
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Закупки не найдены
        </div>
      ) : (
        <div className="grid gap-6">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
            >
              {/* Заголовок закупки */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Закупка #{purchase.id}
                  </h3>
                  {purchase.isUrgent && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      🔴 СРОЧНО
                    </span>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(purchase.status)}`}>
                  {getStatusText(purchase.status)}
                </span>
              </div>

              {/* Информация о закупке */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Общая сумма:</span>
                  <p className="font-semibold text-lg text-blue-600">
                    {purchase.totalAmount.toFixed(2)} ₺
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Товаров:</span>
                  <p className="font-semibold">
                    {purchase.items.reduce((sum, item) => sum + item.quantity, 0)} шт.
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Позиций:</span>
                  <p className="font-semibold">{purchase.items.length}</p>
                </div>
              </div>

              {/* Список товаров */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Товары в закупке:
                </h4>
                <div className="space-y-2">
                  {purchase.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.productName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{item.quantity} шт.</span>
                        <span>×</span>
                        <span>{item.costPrice} ₺</span>
                        <span>=</span>
                        <span className="font-semibold text-blue-600">
                          {item.total.toFixed(2)} ₺
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Дополнительная информация */}
              {(purchase.supplierName || purchase.notes) && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  {purchase.supplierName && (
                    <p className="text-sm">
                      <span className="font-medium">Поставщик:</span> {purchase.supplierName}
                    </p>
                  )}
                  {purchase.notes && (
                    <p className="text-sm">
                      <span className="font-medium">Примечания:</span> {purchase.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Telegram информация */}
              {purchase.telegramMessageId && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    📱 Отправлено в Telegram (ID сообщения: {purchase.telegramMessageId})
                  </p>
                </div>
              )}

              {/* Действия */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="text-sm text-gray-500">
                  {purchase.createdAt && (
                    <>Создано: {new Date(purchase.createdAt).toLocaleString('ru-RU')}</>
                  )}
                </div>
                <div className="flex space-x-2">
                  {purchase.status === 'draft' && (
                    <button
                      onClick={() => purchase.id && sendToSupplier(purchase.id)}
                      disabled={sendingId === purchase.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {sendingId === purchase.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Отправка...</span>
                        </>
                      ) : (
                        <>
                          <span>📤</span>
                          <span>Отправить поставщику</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  {purchase.status === 'awaiting_payment' && (
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        ✅ Оплачено
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        ❌ Отменить
                      </button>
                    </div>
                  )}
                  
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    👁️ Подробнее
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseCartManager; 