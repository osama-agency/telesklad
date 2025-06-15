"use client";

import { SearchIcon, ArrowUpIcon, ArrowDownIcon } from "@/assets/icons";
import { useState, useEffect } from "react";
import { useOrders } from "@/hooks/useOrders";
import { motion } from "framer-motion";


const statusOptions = [
  { value: "all", label: "Все статусы" },
  { value: "pending", label: "Ожидает" },
  { value: "processing", label: "На отправке" },
  { value: "shipped", label: "Отправлен" },
  { value: "overdue", label: "Просрочен" },
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
    // Цвета и иконки для статусов
    const config: Record<string, { bg: string; text: string; icon?: JSX.Element }> = {
      pending: {
        bg: 'bg-gradient-to-r from-gray-200/70 to-gray-300/60 dark:from-gray-700/60 dark:to-gray-800/60',
        text: 'text-gray-700 dark:text-gray-200',
        icon: (
          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" /></svg>
        ),
      },
      processing: {
        bg: 'bg-gradient-to-r from-blue-100/80 to-blue-300/60 dark:from-blue-900/60 dark:to-blue-700/60',
        text: 'text-blue-700 dark:text-blue-300',
        icon: (
          <svg className="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h1l2 7h13" /><circle cx="7.5" cy="19.5" r="1.5" /><circle cx="17.5" cy="19.5" r="1.5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 6V4a2 2 0 00-2-2H6a2 2 0 00-2 2v12" /></svg>
        ),
      },
      shipped: {
        bg: 'bg-gradient-to-r from-blue-200/80 to-blue-400/60 dark:from-blue-800/60 dark:to-blue-600/60',
        text: 'text-blue-800 dark:text-blue-200',
        icon: (
          <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h1l2 7h13" /><circle cx="7.5" cy="19.5" r="1.5" /><circle cx="17.5" cy="19.5" r="1.5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 6V4a2 2 0 00-2-2H6a2 2 0 00-2 2v12" /></svg>
        ),
      },
      overdue: {
        bg: 'bg-gradient-to-r from-yellow-200/80 to-yellow-400/60 dark:from-yellow-900/60 dark:to-yellow-700/60',
        text: 'text-yellow-800 dark:text-yellow-200',
        icon: (
          <svg className="w-4 h-4 mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" /></svg>
        ),
      },
      delivered: {
        bg: 'bg-gradient-to-r from-green-200/80 to-green-400/60 dark:from-green-900/60 dark:to-green-700/60',
        text: 'text-green-800 dark:text-green-200',
        icon: (
          <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        ),
      },
      cancelled: {
        bg: 'bg-gradient-to-r from-red-200/80 to-red-400/60 dark:from-red-900/60 dark:to-red-700/60',
        text: 'text-red-800 dark:text-red-200',
        icon: (
          <svg className="w-4 h-4 mr-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        ),
      },
      refunded: {
        bg: 'bg-gradient-to-r from-purple-200/80 to-purple-400/60 dark:from-purple-900/60 dark:to-purple-700/60',
        text: 'text-purple-800 dark:text-purple-200',
        icon: (
          <svg className="w-4 h-4 mr-1 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        ),
      },
      default: {
        bg: 'bg-gradient-to-r from-gray-200/70 to-gray-300/60 dark:from-gray-700/60 dark:to-gray-800/60',
        text: 'text-gray-700 dark:text-gray-200',
        icon: (
          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" /></svg>
        ),
      },
    };
    const { bg, text, icon } = config[status] || config.default;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide shadow-sm ${bg} ${text} border border-transparent`}
        style={{ minWidth: 0, fontVariant: 'all-small-caps', letterSpacing: '0.04em', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}
      >
        {icon}
        <span className="truncate">{getStatusLabel(status)}</span>
      </motion.div>
    );
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Ожидает";
      case "processing": return "На отправке";
      case "shipped": return "Отправлен";
      case "overdue": return "Просрочен";
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
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] bg-clip-text text-transparent">
          Заказы
        </h1>
        <p className="mt-1 text-sm text-[#64748B] dark:text-gray-400">
          Управление заказами и аналитика продаж
        </p>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-2xl font-bold text-[#1E293B] dark:text-white mb-1">
              {pagination?.totalCount || 0}
            </div>
            <div className="text-sm text-[#64748B] dark:text-gray-400">Всего заказов</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-2xl font-bold text-[#1E293B] dark:text-white mb-1">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="text-sm text-[#64748B] dark:text-gray-400">Общая выручка</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-2xl font-bold text-[#1E293B] dark:text-white mb-1">
              {formatCurrency(stats.averageOrderValue)}
            </div>
            <div className="text-sm text-[#64748B] dark:text-gray-400">Средний чек</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-2xl font-bold text-[#1E293B] dark:text-white mb-1">
              {formatCurrency(stats.totalDeliveryCost)}
            </div>
            <div className="text-sm text-[#64748B] dark:text-gray-400">Доставка</div>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="mb-8 rounded-xl bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {/* Статус фильтр */}
          <div className="w-full max-w-[250px]">
            <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-3">
              Статус заказа
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-5 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
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
            <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-3">
              Поиск по клиенту/номеру
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-5 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                placeholder="Введите имя клиента или номер заказа..."
              />
              <SearchIcon className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1A6DFF]" />
            </div>
          </div>
        </div>
      </div>

      {/* Таблица заказов */}
      <div className="space-y-4">
        {/* Desktop таблица */}
        <div className="hidden sm:block rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      Заказ
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Клиент
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Товары
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleSort("total")}
                      className="inline-flex items-center gap-2 text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider hover:text-[#1A6DFF] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Сумма
                      <SortIcon field="total" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Статус
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4" colSpan={5}>
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[#1E293B] dark:text-white font-medium">Заказы не найдены</p>
                          <p className="text-sm text-[#64748B] dark:text-gray-400 mt-1">Попробуйте изменить параметры поиска</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-[#1E293B] dark:text-white">
                            #{order.externalId}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-gray-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(order.paidAt || order.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-[#1E293B] dark:text-white">
                            {order.customerName || 'Не указано'}
                          </p>
                          {(order.customerEmail || order.customerPhone) && (
                            <div className="space-y-0.5">
                              {order.customerEmail && (
                                <p className="text-xs text-[#64748B] dark:text-gray-400">{order.customerEmail}</p>
                              )}
                              {order.customerPhone && (
                                <p className="text-xs text-[#64748B] dark:text-gray-400">{order.customerPhone}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[#1E293B] dark:text-white line-clamp-1">
                                  {order.items[0].name}
                                </p>
                                <p className="text-xs text-[#64748B] dark:text-gray-400">
                                  {order.items[0].quantity} × {formatCurrency(order.items[0].price)}
                                </p>
                              </div>
                            </div>
                            {order.items.length > 1 && (
                              <p className="text-xs text-[#64748B] dark:text-gray-400">
                                +{order.items.length - 1} товар{order.items.length - 1 === 1 ? '' : order.items.length - 1 < 5 ? 'а' : 'ов'}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-[#64748B] dark:text-gray-400">—</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[#1E293B] dark:text-white">
                            {formatCurrency(order.total)}
                          </p>
                          <p className="text-xs text-[#64748B] dark:text-gray-400">
                            {order.currency}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {getStatusBadge(order.status)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile карточки */}
        <div className="sm:hidden space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#1E293B] dark:text-white font-medium">Заказы не найдены</p>
                  <p className="text-sm text-[#64748B] dark:text-gray-400 mt-1">Попробуйте изменить параметры поиска</p>
                </div>
              </div>
            </div>
          ) : (
            orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-[#1E293B] dark:text-white">
                      Заказ #{order.externalId}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-gray-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(order.paidAt || order.createdAt)}
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Customer */}
                <div className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-[#1E293B] dark:text-white mb-1">
                    {order.customerName || 'Клиент не указан'}
                  </p>
                  {(order.customerEmail || order.customerPhone) && (
                    <div className="space-y-0.5">
                      {order.customerEmail && (
                        <p className="text-xs text-[#64748B] dark:text-gray-400">{order.customerEmail}</p>
                      )}
                      {order.customerPhone && (
                        <p className="text-xs text-[#64748B] dark:text-gray-400">{order.customerPhone}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1E293B] dark:text-white line-clamp-1">
                            {order.items[0].name}
                          </p>
                          <p className="text-xs text-[#64748B] dark:text-gray-400">
                            {order.items[0].quantity} × {formatCurrency(order.items[0].price)}
                          </p>
                        </div>
                      </div>
                      {order.items.length > 1 && (
                        <p className="text-xs text-[#64748B] dark:text-gray-400">
                          +{order.items.length - 1} товар{order.items.length - 1 === 1 ? '' : order.items.length - 1 < 5 ? 'а' : 'ов'}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-[#64748B] dark:text-gray-400">Итого</span>
                  <div className="text-right">
                    <p className="font-semibold text-[#1E293B] dark:text-white">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-gray-400">
                      {order.currency}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Пагинация */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <div className="text-sm text-[#64748B] dark:text-gray-400">
            Показаны {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.totalCount)} из {pagination.totalCount} заказов
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform font-medium"
            >
              Назад
            </button>
            <span className="px-3 py-1 text-[#1E293B] dark:text-white font-medium">
              {pagination.page} из {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform font-medium"
            >
              Далее
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 