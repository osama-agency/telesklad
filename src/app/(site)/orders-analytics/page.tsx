"use client";

import { useEffect } from "react";

import { OrdersTable } from "../(home)/_components/OrdersTableWithQuery";
import { useOrdersAnalytics } from "@/hooks/useOrdersAnalytics";
import Spinner from "@/components/common/Spinner";

export default function OrdersAnalyticsPage() {
  const { stats, loading, error } = useOrdersAnalytics();

  // Set document title
  useEffect(() => {
    document.title = "Аналитика заказов | NextAdmin - Next.js Dashboard Kit";
  }, []);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(numAmount || 0);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
          <div className="min-h-screen bg-main">
      {/* Content */}
      <div className="mx-auto max-w-screen-xl xl:max-w-[90vw] 2xl:max-w-[95vw] p-4 md:p-6 2xl:p-10">
        <OrdersTable />

        {/* Additional Analytics Section */}
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1E293B] dark:text-white">
              Расширенная аналитика
            </h2>
            <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Обновлено в реальном времени
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1E293B] dark:text-white">Общая выручка</h3>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748B] dark:text-gray-400">Проверка оплаты</span>
                  <span className="font-medium text-[#1E293B] dark:text-white">
                    {loading ? 'Загрузка...' : (stats?.paidOrders || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748B] dark:text-gray-400">Выручка</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {loading ? 'Загрузка...' : formatCurrency(stats?.totalRevenue || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748B] dark:text-gray-400">Средний чек</span>
                   <span className="font-medium text-[#1E293B] dark:text-white">
                    {loading ? 'Загрузка...' : formatCurrency(stats?.averageOrderValue || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Revenue Analysis */}
            <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1E293B] dark:text-white">Доставка и бонусы</h3>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748B] dark:text-gray-400">Заказы с треком</span>
                  <span className="font-medium text-[#1E293B] dark:text-white">
                    {loading ? 'Загрузка...' : (stats?.ordersWithTracking || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748B] dark:text-gray-400">Стоимость доставки</span>
                  <span className="font-medium text-[#1E293B] dark:text-white">
                    {loading ? 'Загрузка...' : formatCurrency(stats?.totalDeliveryCost || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748B] dark:text-gray-400">Потрачено бонусов</span>
                  <span className="font-medium text-red-500 dark:text-red-400">
                    {loading ? 'Загрузка...' : formatCurrency(stats?.totalBonus || 0)}
                  </span>
                </div>
              </div>
            </div>


          </div>


        </div>
      </div>
    </div>
  );
} 