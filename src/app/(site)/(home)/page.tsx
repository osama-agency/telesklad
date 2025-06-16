"use client";

import { SmartProductsTable } from "./_components/SmartProductsTable";
import { PurchasesTable } from "./_components/PurchasesTable";
import { OrdersTable } from "./_components/OrdersTable";
import { ExpensesTable } from "./_components/ExpensesTable";
import { Tabs, TabContent, TabList, TabTrigger } from "@/components/ui-elements/tabs";

type TabValue = "products" | "purchases" | "orders" | "expenses";

export default function HomePage() {
  return (
    <div className="w-full space-y-6 lg:space-y-8 xl:space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:gap-4 xl:gap-5">
        <h1 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] bg-clip-text text-transparent">
          Управление данными
        </h1>
        <p className="text-sm lg:text-base xl:text-lg text-[#64748B] dark:text-gray-400">
          🚀 Умная аналитика закупок: товары, остатки, тренды и рекомендации к заказу
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" variants="styleOne">
        <div className="mb-6">
          <TabList className="overflow-x-auto">
            <TabTrigger value="products" className="whitespace-nowrap">
              <span className="text-lg lg:text-xl xl:text-xl mr-2 lg:mr-3">🧠</span>
              Умная аналитика товаров
            </TabTrigger>
            <TabTrigger value="purchases" className="whitespace-nowrap">
              <span className="text-lg lg:text-xl xl:text-xl mr-2 lg:mr-3">📦</span>
              Закупки
            </TabTrigger>
            <TabTrigger value="orders" className="whitespace-nowrap">
              <span className="text-lg lg:text-xl xl:text-xl mr-2 lg:mr-3">🛒</span>
              Заказы
            </TabTrigger>
            <TabTrigger value="expenses" className="whitespace-nowrap">
              <span className="text-lg lg:text-xl xl:text-xl mr-2 lg:mr-3">💰</span>
              Расходы
            </TabTrigger>
          </TabList>
        </div>

        <TabContent value="products">
          <SmartProductsTable />
        </TabContent>

        <TabContent value="purchases">
          <PurchasesTable />
        </TabContent>

        <TabContent value="orders">
          <OrdersTable />
        </TabContent>

        <TabContent value="expenses">
          <ExpensesTable />
        </TabContent>
      </Tabs>
    </div>
  );
}
