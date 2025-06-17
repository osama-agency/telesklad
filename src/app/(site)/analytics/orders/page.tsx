"use client";

import AnalyticsTabs from "@/components/AnalyticsTabs";
import { OrdersTable } from "../../(home)/_components/OrdersTableWithQuery";

export default function OrdersAnalyticsPage() {
  return (
    <div className="w-full space-y-6 lg:space-y-8 xl:space-y-10">
      {/* Navigation Tabs */}
      <AnalyticsTabs />

      {/* Header */}
      <div className="flex flex-col gap-3 lg:gap-4 xl:gap-5">
        <h1 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] bg-clip-text text-transparent">
          🛒 Заказы
        </h1>
        <p className="text-sm lg:text-base xl:text-lg text-[#64748B] dark:text-gray-400">
          Аналитика и управление заказами клиентов
        </p>
      </div>

      {/* Content */}
      <div className="w-full">
        <OrdersTable />
      </div>
    </div>
  );
} 