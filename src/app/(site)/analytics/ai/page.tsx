"use client";

import { Suspense } from "react";
import AnalyticsTabs from "@/components/AnalyticsTabs";
import { SmartProductsTable } from "../../(home)/_components/SmartProductsTableWithQuery";

export default function AIAnalyticsPage() {
  return (
    <div className="w-full space-y-6 lg:space-y-8 xl:space-y-10">
      {/* Navigation Tabs */}
      <AnalyticsTabs />

      {/* Header */}
      <div className="flex flex-col gap-3 lg:gap-4 xl:gap-5">
        <h1 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] bg-clip-text text-transparent">
          🧠 Умная аналитика
        </h1>
        <p className="text-sm lg:text-base xl:text-lg text-[#64748B] dark:text-gray-400">
          🚀 Умная аналитика закупок: товары, остатки, тренды и рекомендации к заказу
        </p>
      </div>

      {/* Content */}
      <div className="w-full">
        <Suspense fallback={
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Загрузка аналитики...</span>
          </div>
        }>
          <SmartProductsTable />
        </Suspense>
      </div>
    </div>
  );
} 