'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/toastNotification';
import { logger } from '@/lib/logger';
import StatusButtons from './StatusButtons';

interface PurchaseItem {
  id?: number;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
  productId?: number;
}

interface Purchase {
  id?: string | number;
  totalAmount: number;
  status: string;
  isUrgent: boolean;
  items: PurchaseItem[];
  createdAt?: string;
  supplierName?: string;
  notes?: string;
  telegramMessageId?: string | number;
  telegramChatId?: string;
  paidExchangeRate?: number;
  paidDate?: string;
}

const PurchaseCartManager: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | number | null>(null);
  const [expandedPurchases, setExpandedPurchases] = useState<Set<number>>(new Set());
  const [tryRate, setTryRate] = useState<number>(30); // Курс лиры по умолчанию

  const { success, error: showError } = useToast();

  // Загрузка закупок
  const loadPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/purchases');
      
      const data = await response.json();
      // API возвращает объект с полем purchases, а не массив напрямую
      setPurchases(Array.isArray(data) ? data : (data.purchases || []));
    } catch (err: any) {
      console.error('Error loading purchases:', err);
      showError('Ошибка загрузки закупок');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Отправка закупки поставщику
  const sendToSupplier = async (purchaseId: string | number) => {
    const numericId = Number(purchaseId);
    setSendingId(purchaseId);
    
    try {
      const response = await fetch(`/api/purchases/${numericId}/send-to-supplier`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send purchase');
      }

      const result = await response.json();
      
      success('Закупка отправлена поставщику!');
      
      // Обновляем статус в локальном состоянии
      setPurchases(prev => prev.map(p => 
        Number(p.id) === numericId 
          ? { ...p, status: 'sent', telegramMessageId: result.purchase.telegramMessageId }
          : p
      ));

    } catch (err: any) {
      console.error('Error sending purchase:', err);
      showError(`Ошибка отправки: ${err.message}`);
    } finally {
      setSendingId(null);
    }
  };

  // Отметить закупку как оплаченную
  const markAsPaid = async (purchaseId: string | number) => {
    const numericId = Number(purchaseId);
    setSendingId(purchaseId);
    
    try {
      const response = await fetch(`/api/purchases/${numericId}/mark-paid`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark purchase as paid');
      }

      const result = await response.json();
      
      success('Закупка отмечена как оплаченная!');
      
      // Обновляем статус в локальном состоянии
      setPurchases(prev => prev.map(p => 
        Number(p.id) === numericId 
          ? { ...p, status: 'paid' }
          : p
      ));

    } catch (err: any) {
      console.error('Error marking purchase as paid:', err);
      showError(`Ошибка оплаты: ${err.message}`);
    } finally {
      setSendingId(null);
    }
  };

  // Обработчик изменения статуса из компонента StatusButtons
  const handleStatusChange = (purchaseId: number, newStatus: string) => {
    // Обновляем статус в локальном состоянии
    setPurchases(prev => prev.map(p => 
      Number(p.id) === purchaseId 
        ? { ...p, status: newStatus }
        : p
    ));
    
    success(`Статус закупки изменен на: ${getStatusText(newStatus)}`);
  };

  // Получение текста статуса
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': '🗒️ Черновик',
      'sent': '📤 Отправлено в Телеграм',
      'sent_to_supplier': '📤 Отправлено в Телеграм',
      'supplier_editing': '✏️ Поставщик редактирует',
      'awaiting_payment': '💳 Ожидает оплату',
      'paid': '💰 Оплачено',
      'preparing': '📦 Готовится к отправке',
      'shipped': '🚚 Отправлено в карго',
      'in_transit': '🛫 В пути',
      'received': '📦 Получено',
      'delivered': '✅ Доставлено',
      'cancelled': '❌ Отменено'
    };
    return statusMap[status] || status;
  };

  // Получение цвета статуса с поддержкой темной темы
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600',
      'sent': 'bg-gradient-to-r from-[#1A6DFF]/10 to-[#00C5FF]/10 text-[#1A6DFF] dark:text-[#00C5FF] border border-[#1A6DFF]/30 dark:border-[#00C5FF]/30',
      'sent_to_supplier': 'bg-gradient-to-r from-[#1A6DFF]/10 to-[#00C5FF]/10 text-[#1A6DFF] dark:text-[#00C5FF] border border-[#1A6DFF]/30 dark:border-[#00C5FF]/30',
      'supplier_editing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700',
      'awaiting_payment': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-200 dark:border-orange-700',
      'paid': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-700',
      'preparing': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-200 dark:border-purple-700',
      'shipped': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700',
      'in_transit': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700',
      'received': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
      'delivered': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-700'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // Функция для переключения развернутого состояния карточки
  const toggleExpanded = (purchaseId: number) => {
    setExpandedPurchases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(purchaseId)) {
        newSet.delete(purchaseId);
      } else {
        newSet.add(purchaseId);
      }
      return newSet;
    });
  };

  // Загружаем курс лиры
  useEffect(() => {
    const loadExchangeRate = async () => {
      try {
        const response = await fetch('/api/rates/latest?currency=TRY');
        if (response.ok) {
          const data = await response.json();
          setTryRate(Number(data.rate) || 30);
          logger.debug(`💱 Loaded TRY rate: ${data.rate}`, undefined, 'PurchaseCart');
        }
      } catch (error) {
        logger.warn('⚠️ Could not load TRY rate, using default', undefined, 'PurchaseCart');
      }
    };
    
    loadExchangeRate();
  }, []);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  if (loading) {
    return (
      <div className="bg-[#F8FAFC] dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1A6DFF] animate-spin"></div>
          </div>
          <p className="text-[#64748B] dark:text-gray-400 font-medium">Загрузка закупок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] dark:bg-gray-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B] dark:text-white mb-2">
              Управление закупками
            </h1>
            <p className="text-[#64748B] dark:text-gray-400">
              Найдено {purchases.length} {purchases.length === 1 ? 'закупка' : 'закупок'}
            </p>
          </div>
          <button
            onClick={loadPurchases}
            className="group relative overflow-hidden bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <span className="animate-spin-slow">🔄</span>
              <span>Обновить</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#00C5FF] to-[#1A6DFF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Список закупок */}
        {purchases.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#1A6DFF]/10 to-[#00C5FF]/10 rounded-full flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold text-[#1E293B] dark:text-white mb-2">
              Закупки не найдены
            </h3>
            <p className="text-[#64748B] dark:text-gray-400">
              Создайте первую закупку для начала работы
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {purchases.map((purchase) => {
              const purchaseId = Number(purchase.id!);
              const isExpanded = expandedPurchases.has(purchaseId);
              
              return (
                <div
                  key={purchase.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30"
                >
                  {/* Заголовок карточки */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleExpanded(purchaseId)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#1A6DFF]/10 to-[#00C5FF]/10 rounded-xl flex items-center justify-center">
                          <span className="text-xl font-bold text-[#1A6DFF]">#{purchase.id}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#1E293B] dark:text-white">
                            Закупка #{purchase.id}
                          </h3>
                          <p className="text-sm text-[#64748B] dark:text-gray-400">
                            {purchase.createdAt && new Date(purchase.createdAt).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {purchase.isUrgent && (
                          <div className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 text-xs font-bold rounded-full border border-red-200 dark:border-red-700 animate-pulse">
                            🔴 СРОЧНО
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${getStatusColor(purchase.status)}`}>
                          {getStatusText(purchase.status)}
                        </span>
                        <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          <svg className="w-5 h-5 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Основная информация */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div className="bg-gradient-to-br from-[#1A6DFF]/5 to-[#00C5FF]/5 rounded-xl p-4 border border-[#1A6DFF]/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#1A6DFF] to-[#00C5FF] rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">₺</span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wide">Общая сумма</p>
                            {purchase.status === 'paid' && purchase.paidExchangeRate ? (
                              <>
                                <p className="text-2xl font-bold bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] bg-clip-text text-transparent">
                                  {(purchase.totalAmount / purchase.paidExchangeRate).toFixed(2)} ₺
                                </p>
                                <p className="text-sm text-[#64748B] dark:text-gray-400">
                                  ≈ {purchase.totalAmount.toFixed(2)} ₽
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-2xl font-bold bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] bg-clip-text text-transparent">
                                  {(purchase.totalAmount / tryRate).toFixed(2)} ₺
                                </p>
                                <p className="text-sm text-[#64748B] dark:text-gray-400">
                                  ≈ {purchase.totalAmount.toFixed(2)} ₽
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">📦</span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wide">Товаров</p>
                            <p className="text-2xl font-bold text-[#1E293B] dark:text-white">
                              {purchase.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} шт.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">📋</span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wide">Позиций</p>
                            <p className="text-2xl font-bold text-[#1E293B] dark:text-white">
                              {purchase.items?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Развернутый контент */}
                  <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-750">
                      {/* Список товаров */}
                      {purchase.items && purchase.items.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-bold text-[#1E293B] dark:text-white mb-4 flex items-center">
                            <span className="w-2 h-2 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] rounded-full mr-2"></span>
                            Товары в закупке
                          </h4>
                          <div className="space-y-3">
                            {purchase.items.map((item, index) => (
                              <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 transition-all duration-200"
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-[#1E293B] dark:text-white mb-1">
                                      {item.productName}
                                    </h5>
                                    <div className="flex items-center space-x-4 text-sm text-[#64748B] dark:text-gray-400">
                                      <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-lg">
                                        {item.quantity} шт.
                                      </span>
                                      <span>×</span>
                                      {purchase.status === 'paid' && purchase.paidExchangeRate ? (
                                        <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-lg">
                                          {(item.costPrice / purchase.paidExchangeRate).toFixed(2)} ₺
                                        </span>
                                      ) : (
                                        <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-lg">
                                          {(item.costPrice / tryRate).toFixed(2)} ₺
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {purchase.status === 'paid' && purchase.paidExchangeRate ? (
                                      <>
                                        <p className="text-xl font-bold bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] bg-clip-text text-transparent">
                                          {(item.total / purchase.paidExchangeRate).toFixed(2)} ₺
                                        </p>
                                        <p className="text-sm text-[#64748B] dark:text-gray-400">
                                          ≈ {item.total.toFixed(2)} ₽
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="text-xl font-bold bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] bg-clip-text text-transparent">
                                          {(item.total / tryRate).toFixed(2)} ₺
                                        </p>
                                        <p className="text-sm text-[#64748B] dark:text-gray-400">
                                          ≈ {item.total.toFixed(2)} ₽
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Дополнительная информация */}
                      {(purchase.supplierName || purchase.notes) && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
                          <h4 className="text-sm font-bold text-[#1E293B] dark:text-white mb-3 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Дополнительная информация
                          </h4>
                          {purchase.supplierName && (
                            <p className="text-sm text-[#374151] dark:text-gray-300 mb-2">
                              <span className="font-medium">Поставщик:</span> {purchase.supplierName}
                            </p>
                          )}
                          {purchase.notes && (
                            <p className="text-sm text-[#374151] dark:text-gray-300">
                              <span className="font-medium">Примечания:</span> {purchase.notes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Telegram информация */}
                      {purchase.telegramMessageId && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                          <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
                            <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                              📱
                            </span>
                            Отправлено в Telegram (ID сообщения: {purchase.telegramMessageId})
                          </p>
                        </div>
                      )}

                      {/* Информация об оплате */}
                      {purchase.status === 'paid' && purchase.paidDate && (
                        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800">
                          <h4 className="text-sm font-bold text-[#1E293B] dark:text-white mb-3 flex items-center">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                            Информация об оплате
                          </h4>
                          <div className="space-y-2">
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">
                              <span className="font-medium">Дата оплаты:</span> {new Date(purchase.paidDate).toLocaleString('ru-RU')}
                            </p>
                            {purchase.paidExchangeRate && (
                              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                <span className="font-medium">Курс лиры при оплате:</span> {purchase.paidExchangeRate.toFixed(4)} ₽ за ₺
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Действия */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-[#64748B] dark:text-gray-400">
                          {purchase.createdAt && (
                            <>Создано: {new Date(purchase.createdAt).toLocaleString('ru-RU')}</>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <StatusButtons
                            currentStatus={purchase.status}
                            purchaseId={purchaseId}
                            onStatusChange={(newStatus) => handleStatusChange(purchaseId, newStatus)}
                            disabled={Number(sendingId) === purchaseId}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseCartManager; 