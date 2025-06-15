"use client";

import { SearchIcon, ArrowUpIcon, ArrowDownIcon } from "@/assets/icons";
import { useState, useEffect } from "react";
import { useOrders } from "@/hooks/useOrders";


const statusOptions = [
  { value: "all", label: "Все статусы" },
  { value: "pending", label: "Ожидает" },
  { value: "processing", label: "В обработке" },
  { value: "shipped", label: "Отправлен" },
  { value: "delivered", label: "Доставлен" },
  { value: "cancelled", label: "Отменён" },
  { value: "refunded", label: "Возврат" },
];

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"orderDate" | "total" | null>("orderDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    orders,
    pagination,
    stats,
    loading,
    error,
    searchOrders,
    filterByStatus,
  } = useOrders({
    page: currentPage,
    limit: 25,
    sortBy: sortField || 'orderDate',
    sortOrder: sortDirection,
    initialFilters: {
      search: searchQuery,
      status: statusFilter === 'all' ? undefined : statusFilter,
    },
  });

  // Set document title
  useEffect(() => {
    document.title = "Заказы | NextAdmin - Next.js Dashboard Kit";
  }, []);

  // Обновление поиска с задержкой
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchOrders(searchQuery);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchOrders]);

  // Обновление фильтра по статусу
  useEffect(() => {
    filterByStatus(statusFilter);
  }, [statusFilter, filterByStatus]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case "pending":
        return `${baseClasses} bg-gray-500/10 text-gray-400 border border-gray-500/20`;
      case "processing":
        return `${baseClasses} bg-yellow-400/10 text-yellow-400 border border-yellow-400/20`;
      case "shipped":
        return `${baseClasses} bg-blue-500/10 text-blue-400 border border-blue-500/20`;
      case "delivered":
        return `${baseClasses} bg-green-500/10 text-green-400 border border-green-500/20`;
      case "cancelled":
        return `${baseClasses} bg-red-500/10 text-red-400 border border-red-500/20`;
      case "refunded":
        return `${baseClasses} bg-purple-500/10 text-purple-400 border border-purple-500/20`;
      default:
        return `${baseClasses} bg-gray-500/10 text-gray-400 border border-gray-500/20`;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Ожидает";
      case "processing": return "В обработке";
      case "shipped": return "Отправлен";
      case "delivered": return "Доставлен";
      case "cancelled": return "Отменён";
      case "refunded": return "Возврат";
      default: return status;
    }
  };

  const formatCurrency = (amount: number | string | any) => {
    let numAmount: number;
    if (typeof amount === 'string') {
      numAmount = parseFloat(amount);
    } else if (typeof amount === 'number') {
      numAmount = amount;
    } else if (amount && typeof amount === 'object' && 'toNumber' in amount) {
      // Prisma Decimal type
      numAmount = amount.toNumber();
    } else {
      numAmount = 0;
    }
    
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(numAmount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Функция для получения правильной даты заказа
  const getOrderDisplayDate = (order: any) => {
    // Если заказ оплачен (paidAt не null), показываем дату оплаты
    if (order.paidAt) {
      return order.paidAt;
    }
    // Иначе показываем дату создания
    return order.createdAt;
  };

  const handleSort = (field: "orderDate" | "total") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: "orderDate" | "total" }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === "asc" ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />;
  };

  return (
    <div className="mx-auto max-w-7xl">


      {/* Статистика */}
      {stats && (
        <div className="mb-7.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-level-2 rounded-2xl p-6 border border-muted/20">
            <div className="text-2xl font-bold text-white mb-1">
              {pagination?.totalCount || 0}
            </div>
            <div className="text-sm text-gray-400">Всего заказов</div>
          </div>
          <div className="bg-level-2 rounded-2xl p-6 border border-muted/20">
            <div className="text-2xl font-bold text-white mb-1">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="text-sm text-gray-400">Общая выручка</div>
          </div>
          <div className="bg-level-2 rounded-2xl p-6 border border-muted/20">
            <div className="text-2xl font-bold text-white mb-1">
              {formatCurrency(stats.averageOrderValue)}
            </div>
            <div className="text-sm text-gray-400">Средний чек</div>
          </div>
          <div className="bg-level-2 rounded-2xl p-6 border border-muted/20">
            <div className="text-2xl font-bold text-white mb-1">
              {formatCurrency(stats.totalDeliveryCost)}
            </div>
            <div className="text-sm text-gray-400">Доставка</div>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="mb-7.5 rounded-[10px] bg-level-2 p-6 border border-muted/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {/* Статус фильтр */}
          <div className="w-full max-w-[250px]">
            <label className="block text-body-sm font-medium text-white mb-3">
              Статус заказа
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-lg border border-muted/20 bg-level-3 px-5 py-3 text-white outline-none focus:ring-gradient"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Поиск */}
          <div className="flex-1 max-w-[400px]">
            <label className="block text-body-sm font-medium text-white mb-3">
              Поиск по клиенту/номеру
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-muted/20 bg-level-3 px-5 py-3 text-white outline-none focus:ring-gradient"
                placeholder="Введите имя клиента или номер заказа..."
              />
              <SearchIcon className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Таблица заказов */}
      <div className="rounded-[10px] bg-level-2 shadow-1 border border-muted/20">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-level-3 text-left">
                <th className="min-w-[120px] px-4 py-4 font-medium text-white xl:pl-7.5">
                  Номер заказа
                </th>
                <th 
                  className="min-w-[150px] px-4 py-4 font-medium text-white cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort("orderDate")}
                >
                  <div className="flex items-center gap-2">
                    Дата
                    <SortIcon field="orderDate" />
                  </div>
                </th>
                <th className="min-w-[180px] px-4 py-4 font-medium text-white">
                  Клиент
                </th>
                <th className="min-w-[200px] px-4 py-4 font-medium text-white">
                  Товары
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-white">
                  Статус
                </th>
                <th 
                  className="min-w-[120px] px-4 py-4 font-medium text-white cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort("total")}
                >
                  <div className="flex items-center gap-2">
                    Сумма
                    <SortIcon field="total" />
                  </div>
                </th>
                <th className="px-4 py-4 text-center font-medium text-white">
                  Доступ
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton loading
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-muted/20">
                    <td className="px-4 py-4 xl:pl-7.5">
                      <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-6 w-20 bg-gray-600 rounded-full animate-pulse"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-8 w-16 bg-gray-600 rounded animate-pulse mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    {error ? (
                      <div className="text-red-400">Ошибка: {error}</div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">📦</div>
                        <div>Заказы не найдены</div>
                        <div className="text-sm mt-1">Попробуйте изменить параметры поиска</div>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-muted/20 hover:bg-level-3/30 transition-colors">
                    <td className="px-4 py-4 xl:pl-7.5">
                      <p className="text-white font-medium">#{order.externalId}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-white">
                        <p>{formatDate(getOrderDisplayDate(order))}</p>
                        <p className="text-xs text-gray-400">
                          {order.paidAt ? 'Оплачен' : 'Создан'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-white">
                        <p className="font-medium">{order.customerName || 'Не указано'}</p>
                        {order.customerEmail && (
                          <p className="text-sm text-gray-400">{order.customerEmail}</p>
                        )}
                        {order.customerPhone && (
                          <p className="text-sm text-gray-400">{order.customerPhone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-white">
                        {order.items && order.items.length > 0 ? (
                          <div>
                            <p className="font-medium">{order.items[0].name}</p>
                            <p className="text-sm text-gray-400">
                              {order.items[0].quantity} × {formatCurrency(order.items[0].price)}
                            </p>
                            {order.items.length > 1 && (
                              <p className="text-xs text-gray-500 mt-1">
                                ...и ещё {order.items.length - 1} товаров
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-400">Товары не указаны</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={getStatusBadge(order.status)}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-white font-semibold">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.currency}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <span className="text-sm">Только просмотр</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-muted/20">
            <div className="text-sm text-gray-400">
              Показаны {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.totalCount)} из {pagination.totalCount} заказов
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1 rounded-lg bg-level-3 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-level-1 transition-colors"
              >
                Назад
              </button>
              <span className="px-3 py-1 text-white">
                {pagination.page} из {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 rounded-lg bg-level-3 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-level-1 transition-colors"
              >
                Далее
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 