"use client";

import { SearchIcon } from "@/assets/icons";
import { useState, useEffect } from "react";
import { useProducts, Product } from "@/hooks/useProducts";
import { AssortmentAnalysis } from "@/components/ai/AssortmentAnalysis";
import { useDateRange } from "@/context/DateRangeContext";
import { Tooltip } from "@/components/ui/Tooltip";

// Интерфейсы для ABC/XYZ анализа
interface AbcXyzData {
  productId: number;
  productName: string;
  revenue: number;
  salesCount: number;
  abc: 'A' | 'B' | 'C';
  xyz: 'X' | 'Y' | 'Z';
  coefficientOfVariation: number;
  revenueShare: number;
}

interface AbcXyzMatrixData {
  AX: number;
  AY: number;
  AZ: number;
  BX: number;
  BY: number;
  BZ: number;
  CX: number;
  CY: number;
  CZ: number;
}

interface AbcXyzMatrixWithProductsData {
  AX: { count: number; products: string[] };
  AY: { count: number; products: string[] };
  AZ: { count: number; products: string[] };
  BX: { count: number; products: string[] };
  BY: { count: number; products: string[] };
  BZ: { count: number; products: string[] };
  CX: { count: number; products: string[] };
  CY: { count: number; products: string[] };
  CZ: { count: number; products: string[] };
}

interface ProductWithAnalytics extends Product {
  abc?: 'A' | 'B' | 'C';
  xyz?: 'X' | 'Y' | 'Z';
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Используем хук для получения реальных данных
  const { 
    products, 
    loading, 
    error, 
    stats, 
    updateFilters, 
    filterByStatus,
    searchProducts 
  } = useProducts({
    autoRefresh: true,
    limit: 25
  });

  // Set document title
  useEffect(() => {
    document.title = "Товары | NextAdmin - Next.js Dashboard Kit";
  }, []);

  // Обновляем поиск при изменении запроса
  useEffect(() => {
    searchProducts(searchQuery);
  }, [searchQuery, searchProducts]);

  // Обновляем фильтр при изменении активного фильтра
  useEffect(() => {
    filterByStatus(activeFilter);
  }, [activeFilter, filterByStatus]);

  // Вычисляем данные для фильтров на основе реальных товаров
  const filterButtons = [
    { id: "all", label: "Все товары", count: stats?.totalProducts || 0 },
    { id: "critical", label: "Критичные", count: products.filter(p => (p.stock_quantity || 0) < 10).length },
    { id: "low-stock", label: "Скоро кончатся", count: products.filter(p => (p.stock_quantity || 0) >= 10 && (p.stock_quantity || 0) < 50).length },
    { id: "need-order", label: "Нужна закупка", count: products.filter(p => (p.stock_quantity || 0) < 20).length },
  ];



  const getStatusBadge = (stock: number) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    
    if (stock < 10) {
      return `${baseClasses} bg-red/10 text-red border border-red/20`;
    } else if (stock < 50) {
      return `${baseClasses} bg-yellow-dark/10 text-yellow-dark border border-yellow-dark/20`;
    } else {
      return `${baseClasses} bg-green/10 text-green border border-green/20`;
    }
  };

  const getStatusText = (stock: number) => {
    if (stock < 10) return "Критичный";
    if (stock < 50) return "Скоро кончится";
    return "В наличии";
  };

  // Форматирование цены
  const formatPrice = (price: any) => {
    if (!price) return "—";
    const num = typeof price === 'object' ? parseFloat(price.toString()) : price;
    return `₽${num.toLocaleString('ru-RU')}`;
  };



  // Форматирование расходов на 1 шт
  const formatExpensesPerUnit = (product: Product) => {
    if (!product.totalCosts || !product.soldQuantity || product.soldQuantity === 0) {
      return "—";
    }
    const expensesPerUnit = product.totalCosts / product.soldQuantity;
    return `₽${expensesPerUnit.toFixed(2)}`;
  };

  // Форматирование чистой прибыли с 1 шт
  const formatNetProfitPerUnit = (product: Product) => {
    if (!product.netProfitPerUnit) {
      return "—";
    }
    return `₽${product.netProfitPerUnit.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="text-center text-red-500">
            Ошибка загрузки данных: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* ИИ-анализ ассортимента */}
      <AssortmentAnalysis productsData={products} />

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
                  <Tooltip content="Средняя закупочная цена в рублях">
                    Средняя себестоимость
                  </Tooltip>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  <Tooltip content="Расходы на 1 шт = (себестоимость + доля общих расходов + 350₽ доставка) ÷ количество проданных штук">
                    Расходы на 1 шт
                  </Tooltip>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  <Tooltip content="Чистая прибыль с 1 шт = (выручка – расходы) ÷ количество проданных штук">
                    Чистая прибыль с 1 шт
                  </Tooltip>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-dark-6">
                    {searchQuery || activeFilter !== 'all' 
                      ? 'Товары не найдены по заданным критериям' 
                      : 'Товары не найдены'
                    }
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-stroke hover:bg-gray-2/30 dark:border-dark-3 dark:hover:bg-dark-3/30"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-dark dark:text-white">
                        {product.name}
                      </div>
                      {product.brand && (
                        <div className="text-xs text-dark-6">{product.brand}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        (product.stock_quantity || 0) < 10 ? 'text-red' : 'text-dark dark:text-white'
                      }`}>
                        {product.stock_quantity || 0} шт
                      </span>
                    </td>
                                         <td className="px-6 py-4">
                       <span className="font-medium text-dark dark:text-white">
                         {product.soldQuantity || 0}
                       </span>
                     </td>
                     <td className="px-6 py-4">
                       <span className="font-medium text-blue-600">
                         {formatPrice(product.avgPurchasePriceRub)}
                       </span>
                     </td>
                     <td className="px-6 py-4">
                       <span className="font-medium text-purple-600">
                         {formatExpensesPerUnit(product)}
                       </span>
                     </td>
                     <td className="px-6 py-4">
                       <span className={`font-medium ${
                         (product.netProfitPerUnit || 0) > 0 ? 'text-green' : 'text-red'
                       }`}>
                         {formatNetProfitPerUnit(product)}
                       </span>
                     </td>
                     <td className="px-6 py-4">
                       <span className={getStatusBadge(product.stock_quantity || 0)}>
                         {getStatusText(product.stock_quantity || 0)}
                       </span>
                     </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        <div className="flex items-center justify-between border-t border-stroke px-6 py-4 dark:border-dark-3">
          <div className="text-sm text-dark-6">
            Показано {products.length} из {stats?.totalProducts || 0} товаров
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