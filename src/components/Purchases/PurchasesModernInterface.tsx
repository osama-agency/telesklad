'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/toastNotification';
import PurchaseStatusFlow from './PurchaseStatusFlow';
import PurchaseAnalytics from './PurchaseAnalytics';
import QuickActions from './QuickActions';
import CreatePurchaseForm from './CreatePurchaseForm';

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
}

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  actions: string[];
}

interface FiltersState {
  urgent?: boolean;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const PurchasesModernInterface: React.FC = () => {
  const { success, error, warning, info } = useToast();
  
  // Состояние данных
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Состояние интерфейса
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedPurchases, setSelectedPurchases] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Состояние фильтров
  const [filters, setFilters] = useState<FiltersState>({});
  const [quickFilter, setQuickFilter] = useState<string>('all');

  // Мемоизируем строку фильтров для предотвращения лишних запросов
  const filtersString = useMemo(() => {
    return JSON.stringify(filters);
  }, [filters]);

  const statusConfig: Record<string, StatusConfig> = {
    draft: {
      label: 'Черновик',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      borderColor: 'border-gray-300 dark:border-gray-600',
      actions: ['send', 'edit', 'delete']
    },
    sent: {
      label: 'Отправлено',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      borderColor: 'border-blue-300 dark:border-blue-600',
      actions: ['mark-paid', 'edit']
    },
    paid: {
      label: 'Оплачено',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-300 dark:border-green-600',
      actions: ['mark-in-transit', 'receive']
    },
    in_transit: {
      label: 'В пути',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      borderColor: 'border-amber-300 dark:border-amber-600',
      actions: ['receive']
    },
    received: {
      label: 'Получено',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      borderColor: 'border-emerald-300 dark:border-emerald-600',
      actions: []
    },
    cancelled: {
      label: 'Отменено',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      borderColor: 'border-red-300 dark:border-red-600',
      actions: ['delete']
    }
  };

  // Загрузка данных с правильной мемоизацией
  const loadPurchases = useCallback(async () => {
    try {
      setLoading(true);
      
      // Строим URL с фильтрами
      const searchParams = new URLSearchParams();
      searchParams.set('page', currentPage.toString());
      searchParams.set('limit', '50');
      
      // Добавляем фильтры
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, value.toString());
        }
      });

      const response = await fetch(`/api/purchases?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }

      const data = await response.json();
      setPurchases(data.purchases || []);
      setTotalCount(data.pagination?.totalCount || 0);
      
    } catch (err) {
      console.error('Error loading purchases:', err);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filtersString]); // Используем мемоизированную строку вместо объекта

  // Эффект для загрузки данных
  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  // Быстрые фильтры
  const applyQuickFilter = useCallback((filterType: string) => {
    setQuickFilter(filterType);
    setCurrentPage(1);
    
    const newFilters: FiltersState = {};
    
    switch (filterType) {
      case 'urgent':
        newFilters.urgent = true;
        break;
      case 'need-payment':
        newFilters.status = 'sent';
        break;
      case 'in-transit':
        newFilters.status = 'in_transit';
        break;
      case 'ready-to-receive':
        newFilters.status = 'paid';
        break;
      case 'all':
      default:
        // Сбрасываем все фильтры
        break;
    }
    
    setFilters(newFilters);
  }, []);

  // Создание закупки
  const handleCreatePurchase = async (purchaseData: any) => {
    try {
      setCreateLoading(true);
      
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create purchase');
      }

      const newPurchase = await response.json();
      success('Закупка успешно создана');
      setShowCreateForm(false);
      loadPurchases(); // Перезагружаем список
      
    } catch (err) {
      console.error('Error creating purchase:', err);
      error(err instanceof Error ? err.message : 'Ошибка создания закупки');
    } finally {
      setCreateLoading(false);
    }
  };

  // Удаление закупки
  const handleDeletePurchase = async (purchaseId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту закупку?')) {
      return;
    }

    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete purchase');
      }

      success('Закупка успешно удалена');
      loadPurchases(); // Перезагружаем список
      
    } catch (err) {
      console.error('Error deleting purchase:', err);
      error(err instanceof Error ? err.message : 'Ошибка удаления закупки');
    }
  };

  // Экспорт данных
  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      // Строим URL с текущими фильтрами
      const searchParams = new URLSearchParams();
      searchParams.set('format', format);
      
      // Добавляем фильтры
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, value.toString());
        }
      });

      // Если есть выбранные закупки, экспортируем только их
      if (selectedPurchases.size > 0) {
        searchParams.set('ids', Array.from(selectedPurchases).join(','));
      }

      const response = await fetch(`/api/purchases/export?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Скачиваем файл
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `purchases_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      success(`Данные экспортированы в формате ${format.toUpperCase()}`);
      
    } catch (err) {
      console.error('Error exporting data:', err);
      error('Ошибка экспорта данных');
    }
  };

  // Изменение статуса закупки
  const handleStatusChange = async (purchaseId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          sendNotifications: false // Отключаем уведомления для UI операций
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      success(`Статус изменен на "${statusConfig[newStatus]?.label}"`);
      loadPurchases(); // Перезагружаем список
      
    } catch (err) {
      console.error('Error updating status:', err);
      error(err instanceof Error ? err.message : 'Ошибка изменения статуса');
    }
  };

  // Переключение развернутого состояния карточки
  const toggleExpanded = (purchaseId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(purchaseId)) {
      newExpanded.delete(purchaseId);
    } else {
      newExpanded.add(purchaseId);
    }
    setExpandedCards(newExpanded);
  };

  // Выбор закупок для массовых операций
  const toggleSelected = (purchaseId: string) => {
    const newSelected = new Set(selectedPurchases);
    if (newSelected.has(purchaseId)) {
      newSelected.delete(purchaseId);
    } else {
      newSelected.add(purchaseId);
    }
    setSelectedPurchases(newSelected);
  };

  // Поиск
  const handleSearch = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setCurrentPage(1);
  }, []);

  if (showCreateForm) {
    return (
      <CreatePurchaseForm
        onSubmit={handleCreatePurchase}
        onCancel={() => setShowCreateForm(false)}
        isLoading={createLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Заголовок и статистика */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1E293B] dark:text-white mb-2">
                Управление закупками
              </h1>
              <p className="text-[#64748B] dark:text-gray-400">
                Всего закупок: <span className="font-semibold">{totalCount}</span>
              </p>
            </div>
            
            {/* Быстрые фильтры */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Все', count: totalCount },
                { key: 'urgent', label: 'Срочные', icon: '🔥' },
                { key: 'need-payment', label: 'Требуют оплаты', icon: '💰' },
                { key: 'in-transit', label: 'В пути', icon: '🚛' },
                { key: 'ready-to-receive', label: 'Готовы к получению', icon: '📦' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => applyQuickFilter(filter.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    quickFilter === filter.key
                      ? 'bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-[#64748B] dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.icon && <span className="mr-1">{filter.icon}</span>}
                  {filter.label}
                  {filter.count !== undefined && (
                    <span className="ml-1 text-xs opacity-75">({filter.count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Аналитика */}
        <PurchaseAnalytics purchases={purchases} />

        {/* Быстрые действия */}
        <QuickActions
          onCreatePurchase={() => setShowCreateForm(true)}
          onBulkActions={() => {
            if (selectedPurchases.size === 0) {
              error('Выберите закупки для массовых операций');
              return;
            }
            // TODO: Реализовать массовые операции
            info('Массовые операции будут реализованы в следующей версии');
          }}
          onExport={() => handleExport('csv')}
          onImport={() => info('Импорт будет реализован в следующей версии')}
        />

        {/* Поиск и фильтры */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Поиск по поставщику, товарам или примечаниям..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                📊 CSV
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                📈 Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                📄 PDF
              </button>
            </div>
          </div>
        </div>

        {/* Список закупок */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A6DFF]"></div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-[#1E293B] dark:text-white mb-2">
                Закупки не найдены
              </h3>
              <p className="text-[#64748B] dark:text-gray-400 mb-6">
                {Object.keys(filters).length > 0 
                  ? 'Попробуйте изменить фильтры поиска'
                  : 'Создайте первую закупку, чтобы начать работу'
                }
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-3 rounded-lg hover:scale-105 transition-all duration-300 font-medium"
              >
                Создать закупку
              </button>
            </div>
          ) : (
            purchases.map((purchase) => {
              const purchaseId = String(purchase.id);
              const config = statusConfig[purchase.status] || statusConfig.draft;
              const isExpanded = expandedCards.has(purchaseId);
              const isSelected = selectedPurchases.has(purchaseId);

              return (
                <div
                  key={purchaseId}
                  className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                    isSelected 
                      ? 'border-[#1A6DFF] shadow-lg' 
                      : `${config.borderColor} hover:border-[#1A6DFF]/30`
                  }`}
                >
                  {/* Заголовок карточки */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelected(purchaseId)}
                          className="w-4 h-4 text-[#1A6DFF] border-gray-300 dark:border-gray-600 rounded focus:ring-[#1A6DFF]/20"
                        />
                        
                        <div>
                          <h3 className="text-xl font-semibold text-[#1E293B] dark:text-white">
                            Закупка #{purchaseId}
                          </h3>
                          <p className="text-sm text-[#64748B] dark:text-gray-400">
                            {purchase.createdAt && new Date(purchase.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>

                        {purchase.isUrgent && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                            🔥 Срочно
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
                          {config.label}
                        </span>
                        
                        <button
                          onClick={() => toggleExpanded(purchaseId)}
                          className="p-2 text-[#64748B] dark:text-gray-400 hover:text-[#1A6DFF] transition-colors"
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                      </div>
                    </div>

                    {/* Краткая информация */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-[#64748B] dark:text-gray-400">Сумма</p>
                        <p className="text-lg font-semibold text-[#1E293B] dark:text-white">
                          {purchase.totalAmount?.toFixed(2) || '0.00'} ₺
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#64748B] dark:text-gray-400">Поставщик</p>
                        <p className="text-lg font-medium text-[#1E293B] dark:text-white">
                          {purchase.supplierName || 'Не указан'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#64748B] dark:text-gray-400">Товаров</p>
                        <p className="text-lg font-medium text-[#1E293B] dark:text-white">
                          {purchase.items?.length || 0} позиций
                        </p>
                      </div>
                    </div>

                    {/* Действия */}
                    <div className="flex flex-wrap gap-2">
                      {config.actions.includes('send') && (
                        <button
                          onClick={() => handleStatusChange(purchaseId, 'sent')}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          📤 Отправить
                        </button>
                      )}
                      {config.actions.includes('mark-paid') && (
                        <button
                          onClick={() => handleStatusChange(purchaseId, 'paid')}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                        >
                          💰 Оплачено
                        </button>
                      )}
                      {config.actions.includes('mark-in-transit') && (
                        <button
                          onClick={() => handleStatusChange(purchaseId, 'in_transit')}
                          className="px-3 py-1 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors"
                        >
                          🚛 В пути
                        </button>
                      )}
                      {config.actions.includes('receive') && (
                        <button
                          onClick={() => handleStatusChange(purchaseId, 'received')}
                          className="px-3 py-1 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          📦 Получено
                        </button>
                      )}
                      {config.actions.includes('delete') && (
                        <button
                          onClick={() => handleDeletePurchase(purchaseId)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                        >
                          🗑️ Удалить
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Развернутая информация */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-[#F8FAFC] dark:bg-gray-700/50">
                      {/* Прогресс статуса */}
                      <div className="mb-6">
                        <PurchaseStatusFlow 
                          currentStatus={purchase.status} 
                          isInteractive={false}
                        />
                      </div>

                      {/* Список товаров */}
                      {purchase.items && purchase.items.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-[#1E293B] dark:text-white mb-3">
                            Товары ({purchase.items.length})
                          </h4>
                          <div className="space-y-2">
                            {purchase.items.map((item, index) => (
                              <div 
                                key={index}
                                className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-[#1E293B] dark:text-white">
                                    {item.productName}
                                  </p>
                                  <p className="text-sm text-[#64748B] dark:text-gray-400">
                                    {item.quantity} шт. × {item.costPrice} ₺
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-[#1E293B] dark:text-white">
                                    {item.total?.toFixed(2)} ₺
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Дополнительная информация */}
                      {(purchase.notes || purchase.supplierName) && (
                        <div className="space-y-3">
                          {purchase.notes && (
                            <div>
                              <p className="text-sm font-medium text-[#64748B] dark:text-gray-400 mb-1">
                                Примечания:
                              </p>
                              <p className="text-[#1E293B] dark:text-white">
                                {purchase.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Пагинация */}
        {totalCount > 50 && (
          <div className="flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                ← Назад
              </button>
              <span className="px-4 py-2 text-[#64748B] dark:text-gray-400">
                Страница {currentPage} из {Math.ceil(totalCount / 50)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(totalCount / 50)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Вперед →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasesModernInterface; 