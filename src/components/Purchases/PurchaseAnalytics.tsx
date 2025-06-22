'use client';

import React from 'react';

interface Purchase {
  id?: string | number;
  totalAmount: number;
  status: string;
  isUrgent: boolean;
  items: any[];
  createdAt?: string;
}

interface PurchaseAnalyticsProps {
  purchases: Purchase[];
}

const PurchaseAnalytics: React.FC<PurchaseAnalyticsProps> = ({ purchases }) => {
  // Расчет метрик
  const calculateMetrics = () => {
    const total = purchases.length;
    const totalAmount = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    
    // Статусы
    const byStatus = purchases.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Срочные закупки
    const urgent = purchases.filter(p => p.isUrgent).length;
    
    // Среднее время выполнения (примерная оценка)
    const completedPurchases = purchases.filter(p => p.status === 'received');
    const avgCompletionTime = completedPurchases.length > 0 
      ? Math.round(completedPurchases.length * 7) // примерно 7 дней на закупку
      : 0;

    // Топ товары по количеству
    const itemFrequency = purchases.reduce((acc, p) => {
      p.items.forEach(item => {
        const name = item.productName;
        acc[name] = (acc[name] || 0) + item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);

    const topItems = Object.entries(itemFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      total,
      totalAmount,
      byStatus,
      urgent,
      avgCompletionTime,
      topItems,
      averageOrderValue: total > 0 ? totalAmount / total : 0
    };
  };

  const metrics = calculateMetrics();

  const statusConfig = {
    draft: { label: 'Черновики', color: 'gray', icon: '📝' },
    sent: { label: 'Отправлено', color: '[#1A6DFF]', icon: '📤' },
    paid: { label: 'Оплачено', color: 'emerald', icon: '💰' },
    in_transit: { label: 'В пути', color: 'amber', icon: '🚛' },
    received: { label: 'Получено', color: 'green', icon: '✅' },
    cancelled: { label: 'Отменено', color: 'red', icon: '❌' }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
      {/* Общая статистика */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1A6DFF] to-[#00C5FF] rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">📊</span>
          </div>
          <div>
            <h3 className="font-semibold text-[#1E293B] dark:text-white">Общая статистика</h3>
            <p className="text-sm text-[#64748B] dark:text-gray-400">Основные показатели</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[#64748B] dark:text-gray-400">Всего закупок</span>
            <span className="font-semibold text-[#1E293B] dark:text-white">{metrics.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#64748B] dark:text-gray-400">Общая сумма</span>
            <span className="font-semibold text-[#1E293B] dark:text-white">
              {metrics.totalAmount.toLocaleString()} ₺
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#64748B] dark:text-gray-400">Средний чек</span>
            <span className="font-semibold text-[#1E293B] dark:text-white">
              {metrics.averageOrderValue.toFixed(0)} ₺
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#64748B] dark:text-gray-400">Срочных</span>
            <span className="font-semibold text-red-600 dark:text-red-400">{metrics.urgent}</span>
          </div>
        </div>
      </div>

      {/* Распределение по статусам */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">📈</span>
          </div>
          <div>
            <h3 className="font-semibold text-[#1E293B] dark:text-white">По статусам</h3>
            <p className="text-sm text-[#64748B] dark:text-gray-400">Распределение закупок</p>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(metrics.byStatus).map(([status, count]) => {
            const config = statusConfig[status as keyof typeof statusConfig];
            if (!config) return null;

            const percentage = metrics.total > 0 ? (count / metrics.total) * 100 : 0;

            return (
              <div key={status} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    <span className="text-sm text-[#64748B] dark:text-gray-400">{config.label}</span>
                  </div>
                  <span className="font-medium text-[#1E293B] dark:text-white">{count}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      config.color === '[#1A6DFF]' ? 'bg-[#1A6DFF]' : 
                      config.color === 'gray' ? 'bg-gray-500' :
                      `bg-${config.color}-500`
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Топ товары */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">🏆</span>
          </div>
          <div>
            <h3 className="font-semibold text-[#1E293B] dark:text-white">Топ товары</h3>
            <p className="text-sm text-[#64748B] dark:text-gray-400">По количеству закупок</p>
          </div>
        </div>

        {metrics.topItems.length > 0 ? (
          <div className="space-y-3">
            {metrics.topItems.map(([itemName, quantity], index) => (
              <div key={itemName} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                    ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 
                      index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 
                      index === 2 ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' : 
                      'bg-gray-50 dark:bg-gray-700 text-[#64748B] dark:text-gray-400'}
                  `}>
                    {index + 1}
                  </div>
                  <span className="text-sm text-[#1E293B] dark:text-white truncate" title={itemName}>
                    {itemName}
                  </span>
                </div>
                <span className="font-medium text-[#64748B] dark:text-gray-400 ml-2">
                  {quantity} шт.
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-sm text-[#64748B] dark:text-gray-400">Нет данных о товарах</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseAnalytics; 