"use client";

import { SearchIcon } from "@/assets/icons";
import { useState, useEffect } from "react";
import { useProducts, Product } from "@/hooks/useProducts";
import { useDateRange } from "@/context/DateRangeContext";
import { Tooltip } from "@/components/ui/Tooltip";
import usePurchaseCartStore from "@/lib/stores/purchaseCartStore";
import FloatingCart from "@/components/PurchaseCart/FloatingCart";
import Toast from "@/components/ui/Toast";

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
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Используем хранилище корзины закупок
  const { addItem: addToCart } = usePurchaseCartStore();
  
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

  // Функции для работы с выбором товаров
  const handleProductSelect = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  const getSelectedProductsData = () => {
    return products.filter((p: Product) => selectedProducts.includes(p.id));
  };

  const handleAddSelectedToCart = () => {
    const selectedProductsData = getSelectedProductsData();
    selectedProductsData.forEach(product => {
      addToCart(product, 1); // Добавляем по 1 штуке каждого товара
    });
    
    // Показываем уведомление
    setToast({
      message: `${selectedProductsData.length} ${selectedProductsData.length === 1 ? 'товар добавлен' : 'товаров добавлено'} в корзину`,
      type: 'success'
    });
    
    clearSelection();
  };

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

  // Форматирование потребления в день
  const formatConsumptionPerDay = (product: Product) => {
    if (!product.avgConsumptionPerDay || product.avgConsumptionPerDay === 0) return '—';
    return `${product.avgConsumptionPerDay.toFixed(2)}`;
  };

  // Форматирование рекомендованного заказа
  const formatRecommendedOrder = (product: Product) => {
    if (!product.recommendedOrderQuantity || product.recommendedOrderQuantity === 0) return '—';
    return `${product.recommendedOrderQuantity}`;
  };

  // Форматирование дней до нуля
  const formatDaysUntilZero = (product: Product) => {
    if (!product.daysUntilZero && product.daysUntilZero !== 0) return '—';
    if (product.daysUntilZero >= 999) return '∞';
    if (product.daysUntilZero === 0) return '0';
    return `${product.daysUntilZero}`;
  };

  // Цвет для дней до нуля
  const getDaysUntilZeroColor = (days: number | undefined) => {
    if (!days && days !== 0) return 'text-gray-500';
    if (days >= 999) return 'text-gray-500';
    if (days === 0) return 'text-red-600 font-bold';
    if (days <= 7) return 'text-red-500 font-bold';
    if (days <= 30) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-card">
          <div className="text-center text-red-500">
            Ошибка загрузки данных: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] bg-clip-text text-transparent">
              Товары
            </h1>
            <p className="mt-1 text-sm text-[#64748B] dark:text-gray-400">
              Управление ассортиментом и аналитика продаж
            </p>
          </div>
        </div>
      </div>

      {/* Поиск и фильтры */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Поиск */}
          <div className="relative w-full max-w-[450px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-6 py-4 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-4 focus:ring-[#1A6DFF]/10 focus:bg-white dark:focus:bg-gray-600"
              placeholder="Поиск товаров..."
            />
            <button className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white hover:scale-105 transition-transform shadow-lg">
              <SearchIcon className="size-5" />
            </button>
          </div>

          {/* Фильтры */}
          <div className="flex flex-wrap gap-3">
            {filterButtons.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                  activeFilter === filter.id
                    ? "bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white shadow-lg scale-105"
                    : "bg-gray-50 text-[#1E293B] hover:bg-gradient-to-r hover:from-[#1A6DFF] hover:to-[#00C5FF] hover:text-white hover:scale-105 hover:shadow-lg dark:bg-gray-700 dark:text-white"
                }`}
              >
                {filter.label}
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  activeFilter === filter.id
                    ? "bg-white/25 text-white"
                    : "bg-[#1A6DFF]/10 text-[#1A6DFF] dark:bg-white/10 dark:text-white"
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Таблица товаров */}
      <div className="rounded-2xl bg-white shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                <th className="px-6 py-5 text-left text-sm font-bold text-[#1E293B] dark:text-white">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    className="h-5 w-5 rounded-lg border-2 border-gray-300 text-[#1A6DFF] focus:ring-[#1A6DFF] focus:ring-2"
                  />
                </th>
                <th className="px-6 py-5 text-left text-sm font-bold text-[#1E293B] dark:text-white">Название</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-[#1E293B] dark:text-white">Остатки</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-[#1E293B] dark:text-white">Продажи</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-[#1E293B] dark:text-white relative">
                  <Tooltip content="Средняя закупочная цена в рублях" delay={300}>
                    <span className="border-b-2 border-dotted border-[#1A6DFF] cursor-help inline-block hover:border-[#00C5FF] transition-colors duration-200">
                      Средняя себестоимость
                    </span>
                  </Tooltip>
                </th>
                <th className="px-6 py-5 text-left text-sm font-bold text-[#1E293B] dark:text-white relative">
                  <Tooltip content="Расходы на 1 шт = (себестоимость + доля общих расходов + 350₽ доставка) ÷ количество проданных штук" delay={300}>
                    <span className="border-b-2 border-dotted border-[#1A6DFF] cursor-help inline-block hover:border-[#00C5FF] transition-colors duration-200">
                      Расходы на 1 шт
                    </span>
                  </Tooltip>
                </th>
                <th className="px-6 py-5 text-left text-sm font-bold text-[#1E293B] dark:text-white relative">
                  <Tooltip content="Чистая прибыль с 1 шт = (выручка – расходы) ÷ количество проданных штук" delay={300}>
                    <span className="border-b-2 border-dotted border-[#1A6DFF] cursor-help inline-block hover:border-[#00C5FF] transition-colors duration-200">
                      Чистая прибыль с 1 шт
                    </span>
                  </Tooltip>
                </th>
                <th className="px-6 py-5 text-left text-sm font-bold text-[#1E293B] dark:text-white relative">
                  <Tooltip content="Среднее потребление в день на основе выбранного периода в датапикере" delay={300}>
                    <span className="border-b-2 border-dotted border-[#1A6DFF] cursor-help inline-block hover:border-[#00C5FF] transition-colors duration-200">
                      Потребление/день
                    </span>
                  </Tooltip>
                </th>
                <th className="px-6 py-5 text-left text-sm font-bold text-[#1E293B] dark:text-white relative">
                  <Tooltip content="Рекомендованное количество для заказа на 30 дней + 20% запас" delay={300}>
                    <span className="border-b-2 border-dotted border-[#1A6DFF] cursor-help inline-block hover:border-[#00C5FF] transition-colors duration-200">
                      К заказу
                    </span>
                  </Tooltip>
                </th>
                <th className="px-6 py-5 text-left text-sm font-bold text-[#1E293B] dark:text-white relative">
                  <Tooltip content="Количество дней до полного исчерпания остатков при текущем темпе потребления" delay={300}>
                    <span className="border-b-2 border-dotted border-[#1A6DFF] cursor-help inline-block hover:border-[#00C5FF] transition-colors duration-200">
                      Дней до 0
                    </span>
                  </Tooltip>
                </th>
                <th className="px-6 py-5 text-left text-sm font-bold text-[#1E293B] dark:text-white">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {searchQuery || activeFilter !== 'all' 
                          ? 'Товары не найдены по заданным критериям' 
                          : 'Товары не найдены'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product, index) => {
                  const isSelected = selectedProducts.includes(product.id);
                  return (
                    <tr
                      key={product.id}
                      className={`group transition-all duration-300 cursor-pointer ${
                        isSelected 
                          ? 'bg-gradient-to-r from-[#1A6DFF]/8 to-[#00C5FF]/8 dark:bg-[#1A6DFF]/15 shadow-sm' 
                          : 'hover:bg-gradient-to-r hover:from-[#1A6DFF]/3 hover:to-[#00C5FF]/3 hover:shadow-md dark:hover:bg-gray-700/20'
                      }`}
                    >
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleProductSelect(product.id)}
                          className="h-5 w-5 rounded-lg border-2 border-gray-300 text-[#1A6DFF] focus:ring-[#1A6DFF] focus:ring-2 transition-all"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#1A6DFF]/10 to-[#00C5FF]/10 rounded-xl flex items-center justify-center group-hover:from-[#1A6DFF]/20 group-hover:to-[#00C5FF]/20 group-hover:scale-105 transition-all duration-300">
                              <span className="text-[#1A6DFF] font-bold text-sm group-hover:text-[#1A6DFF] transition-colors duration-300">
                                {product.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-[#1E293B] dark:text-white group-hover:text-[#1A6DFF] transition-colors duration-300">
                              {product.name}
                            </div>
                            {product.brand && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {product.brand}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold text-lg ${
                            (product.stock_quantity || 0) < 10 ? 'text-rose-600' : 'text-[#1E293B] dark:text-white'
                          }`}>
                            {product.stock_quantity || 0}
                          </span>
                          <span className="text-sm text-gray-500">шт</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-lg text-[#1E293B] dark:text-white">
                            {product.soldQuantity || 0}
                          </span>
                          <span className="text-sm text-gray-500">шт</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-blue-600 text-lg">
                          {formatPrice(product.avgPurchasePriceRub)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-[#3EB5EA] text-lg">
                          {formatExpensesPerUnit(product)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`font-bold text-lg ${
                          (product.netProfitPerUnit || 0) > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {formatNetProfitPerUnit(product)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-lg text-[#1A6DFF]">
                            {formatConsumptionPerDay(product)}
                          </span>
                          {product.avgConsumptionPerDay && product.avgConsumptionPerDay > 0 && (
                            <span className="text-sm text-gray-500">шт/день</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold text-lg ${
                            (product.recommendedOrderQuantity || 0) > 0 ? 'text-orange-600' : 'text-gray-500'
                          }`}>
                            {formatRecommendedOrder(product)}
                          </span>
                          {product.recommendedOrderQuantity && product.recommendedOrderQuantity > 0 && (
                            <span className="text-sm text-gray-500">шт</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold text-lg ${getDaysUntilZeroColor(product.daysUntilZero)}`}>
                            {formatDaysUntilZero(product)}
                          </span>
                          {product.daysUntilZero !== undefined && product.daysUntilZero < 999 && product.daysUntilZero > 0 && (
                            <span className="text-sm text-gray-500">
                              {product.daysUntilZero === 1 ? 'день' : product.daysUntilZero < 5 ? 'дня' : 'дней'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`${getStatusBadge(product.stock_quantity || 0)} shadow-sm`}>
                          {getStatusText(product.stock_quantity || 0)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        <div className="flex items-center justify-between border-t-2 border-gray-100 dark:border-gray-700 px-6 py-5 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Показано <span className="font-bold text-[#1A6DFF]">{products.length}</span> из <span className="font-bold text-[#1A6DFF]">{stats?.totalProducts || 0}</span> товаров
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-[#1E293B] dark:text-white hover:bg-gradient-to-r hover:from-[#1A6DFF] hover:to-[#00C5FF] hover:text-white hover:border-transparent hover:scale-105 transition-all duration-200 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white font-bold shadow-lg scale-105">
              1
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-[#1E293B] dark:text-white hover:bg-gradient-to-r hover:from-[#1A6DFF] hover:to-[#00C5FF] hover:text-white hover:border-transparent hover:scale-105 transition-all duration-200 shadow-sm font-medium">
              2
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-[#1E293B] dark:text-white hover:bg-gradient-to-r hover:from-[#1A6DFF] hover:to-[#00C5FF] hover:text-white hover:border-transparent hover:scale-105 transition-all duration-200 shadow-sm font-medium">
              3
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-[#1E293B] dark:text-white hover:bg-gradient-to-r hover:from-[#1A6DFF] hover:to-[#00C5FF] hover:text-white hover:border-transparent hover:scale-105 transition-all duration-200 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Всплывающее меню для выбранных товаров */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center gap-4">
            <span className="text-sm font-medium text-[#1E293B] dark:text-white">
              {selectedProducts.length} {selectedProducts.length === 1 ? 'товар выбран' : 'товаров выбрано'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddSelectedToCart}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:scale-105 transition-transform text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                Добавить в корзину
              </button>
              <button
                onClick={clearSelection}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-[#1E293B] dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Отменить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Плавающая корзина */}
      <FloatingCart />
      {/* Уведомления */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
} 