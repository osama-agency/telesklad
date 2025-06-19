"use client";


import PurchasesTableAviasalesFixed from "@/app/(site)/(home)/_components/PurchasesTableAviasalesFixed";
import { usePurchases } from "@/hooks/usePurchases";
import { useEffect } from "react";

export default function PurchasesAnalyticsPage() {
  const { data: purchases = [], isLoading, error } = usePurchases({
    limit: 50 // Загружаем больше закупок для аналитики
  });

  // Set document title
  useEffect(() => {
    document.title = "Аналитика закупок | NextAdmin - Next.js Dashboard Kit";
  }, []);

  // Преобразуем данные в формат, который ожидает компонент
  const transformedPurchases = purchases.map(purchase => ({
    id: purchase.id.toString(),
    title: `Закупка #${purchase.id}`,
    createdAt: purchase.createdAt,
    status: (purchase.status === 'draft' ? 'draft' : 
            purchase.status === 'sent' ? 'sent' : 
            purchase.status === 'paid' ? 'paid' : 
            purchase.status === 'cancelled' ? 'cancelled' : 'draft') as 'draft' | 'sent' | 'paid' | 'cancelled',
    totalRUB: purchase.totalAmount || 0,
    totalTRY: (purchase.totalAmount || 0) / 2.1 // Примерный курс для отображения
  }));

  if (error) {
    return (
      <div className="min-h-screen bg-main">
        <div className="mx-auto max-w-screen-xl xl:max-w-[90vw] 2xl:max-w-[95vw] p-4 md:p-6 2xl:p-10">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border border-red-200 dark:border-red-700">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#1E293B] dark:text-white mb-2">
              Ошибка загрузки закупок
            </h3>
            <p className="text-[#64748B] dark:text-gray-400">
              {error instanceof Error ? error.message : 'Неизвестная ошибка'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main">
      {/* Content */}
      <div className="mx-auto max-w-screen-xl xl:max-w-[90vw] 2xl:max-w-[95vw] p-4 md:p-6 2xl:p-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A6DFF]"></div>
            <span className="ml-3 text-[#64748B] dark:text-gray-300">Загрузка закупок...</span>
          </div>
        ) : (
          <PurchasesTableAviasalesFixed purchases={transformedPurchases} />
        )}
      </div>
    </div>
  );
} 