"use client";

import { SearchIcon, StatisticsChartIcon, DollarIcon, ArrowUpIcon, ArrowDownIcon, DesignToolsIcon, TrashIcon, PencilSquareIcon } from "@/assets/icons";
import { useState, useEffect } from "react";

// Моковые данные для метрик
const metrics = [
  {
    icon: <DesignToolsIcon />,
    title: "Всего товаров",
    value: "247",
    growthRate: 12,
  },
  {
    icon: <DollarIcon />,
    title: "Сумма закупки",
    value: "₽184,500",
    growthRate: -3,
  },
  {
    icon: <StatisticsChartIcon />,
    title: "Средняя маржа",
    value: "47%",
    growthRate: 8,
  },
  {
    icon: <DollarIcon />,
    title: "Критичные остатки",
    value: "18",
    growthRate: -15,
  },
];

// Моковые данные для товаров
const mockProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro 256GB",
    stock: 45,
    sales: 127,
    cost: "₽89,900",
    profit: "₽34,100",
    recommended: 20,
    status: "В наличии",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    stock: 12,
    sales: 89,
    cost: "₽94,900",
    profit: "₽28,500",
    recommended: 15,
    status: "Критичный",
  },
  {
    id: 3,
    name: "MacBook Air M3 13\"",
    stock: 23,
    sales: 56,
    cost: "₽129,900",
    profit: "₽41,200",
    recommended: 10,
    status: "В наличии",
  },
  {
    id: 4,
    name: "AirPods Pro 2 поколения",
    stock: 8,
    sales: 234,
    cost: "₽24,900",
    profit: "₽8,900",
    recommended: 50,
    status: "Скоро кончится",
  },
  {
    id: 5,
    name: "iPad Pro 12.9\" M2",
    stock: 31,
    sales: 67,
    cost: "₽119,900",
    profit: "₽36,800",
    recommended: 12,
    status: "В наличии",
  },
];

const filterButtons = [
  { id: "all", label: "Все товары", count: 247 },
  { id: "critical", label: "Критичные", count: 18 },
  { id: "low-stock", label: "Скоро кончатся", count: 34 },
  { id: "need-order", label: "Нужна закупка", count: 67 },
];

// Metadata is handled by layout in App Router

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Set document title
  useEffect(() => {
    document.title = "Товары | NextAdmin - Next.js Dashboard Kit";
  }, []);

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case "В наличии":
        return `${baseClasses} bg-green/10 text-green border border-green/20`;
      case "Критичный":
        return `${baseClasses} bg-red/10 text-red border border-red/20`;
      case "Скоро кончится":
        return `${baseClasses} bg-yellow-dark/10 text-yellow-dark border border-yellow-dark/20`;
      default:
        return `${baseClasses} bg-gray-5/10 text-gray-5 border border-gray-5/20`;
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Метрики */}
      <div className="mb-7.5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-7.5">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card"
          >
            <div className="mb-4">{metric.icon}</div>
            
            <h4 className="mb-2 text-heading-6 font-bold text-dark dark:text-white">
              {metric.value}
            </h4>
            
            <p className="mb-2 text-sm font-medium text-dark-6">{metric.title}</p>
            
            <div className="flex items-center gap-1.5">
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  metric.growthRate > 0 ? "text-green" : "text-red"
                }`}
              >
                {metric.growthRate > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                <span>
                  {metric.growthRate > 0 && "+"}
                  {metric.growthRate}%
                </span>
              </span>
              <span className="text-xs text-dark-6">за неделю</span>
            </div>
          </div>
        ))}
      </div>

      {/* Поиск и фильтры */}
      <div className="mb-7.5 rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Поиск */}
          <div className="relative w-full max-w-[400px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none focus:ring-gradient dark:border-dark-3 dark:bg-dark-2"
              placeholder="Поиск товаров..."
            />
            <button className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-r-lg bg-primary text-white">
              <SearchIcon className="size-5" />
            </button>
          </div>

          {/* Фильтры */}
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === filter.id
                    ? "bg-primary text-white"
                    : "bg-gray-2 text-dark hover:bg-primary hover:text-white dark:bg-dark-3 dark:text-white"
                }`}
              >
                {filter.label}
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  activeFilter === filter.id
                    ? "bg-white/20"
                    : "bg-white/10 dark:bg-dark/20"
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Таблица товаров */}
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-dark-3">
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Название
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Остатки
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Продажи
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Себестоимость
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Прибыль
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Рекомендовано
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Статус
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-dark dark:text-white">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-stroke hover:bg-gray-2/30 dark:border-dark-3 dark:hover:bg-dark-3/30"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-dark dark:text-white">
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${
                      product.stock < 15 ? 'text-red' : 'text-dark dark:text-white'
                    }`}>
                      {product.stock} шт
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-dark dark:text-white">
                      {product.sales}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-dark dark:text-white">
                      {product.cost}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-green">
                      {product.profit}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-primary">
                      {product.recommended} шт
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={getStatusBadge(product.status)}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary hover:text-white">
                        <PencilSquareIcon className="size-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded bg-red/10 text-red hover:bg-red hover:text-white">
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        <div className="flex items-center justify-between border-t border-stroke px-6 py-4 dark:border-dark-3">
          <div className="text-sm text-dark-6">
            Показано 1-5 из 247 товаров
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded border border-stroke text-dark hover:bg-primary hover:text-white dark:border-dark-3 dark:text-white">
              ←
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
              1
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded border border-stroke text-dark hover:bg-primary hover:text-white dark:border-dark-3 dark:text-white">
              2
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded border border-stroke text-dark hover:bg-primary hover:text-white dark:border-dark-3 dark:text-white">
              3
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded border border-stroke text-dark hover:bg-primary hover:text-white dark:border-dark-3 dark:text-white">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 