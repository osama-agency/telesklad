"use client";

import { SearchIcon, ArrowUpIcon, ArrowDownIcon } from "@/assets/icons";
import { useState, useEffect } from "react";
import { useOrders } from "@/hooks/useOrders";
import { motion } from "framer-motion";
// ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";

const statusOptions = [
  { value: 0, label: "Все статусы" },
  { value: 1, label: "Ожидает" },
  { value: 2, label: "На отправке" },
  { value: 3, label: "Доставлен" },
  { value: 4, label: "Отправлен" },
  { value: 5, label: "Отменён" },
  { value: 6, label: "Возврат" },
  { value: 7, label: "Просрочен" },
];

export function OrdersTable() {
  // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
  // const { data: session, status } = useSession();
  // const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(0);
  const [sortField, setSortField] = useState<"orderdate" | "total_amount" | null>("orderdate");
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
    fetchOrders,
  } = useOrders({
    page: currentPage,
    limit: 25,
    sortBy: sortField || 'created_at',
    sortOrder: sortDirection,
    autoRefresh: true, // Включаем автоматическую загрузку данных
    initialFilters: {
      search: searchQuery,
      status: statusFilter === 0 ? undefined : statusFilter,
    },
  });

  // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/login');
  //   }
  // }, [status, router]);

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

  // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
  // if (status === 'loading') {
  //   return (
  //     <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
  //       <div className="flex items-center justify-center py-16">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  //       </div>
  //     </section>
  //   );
  // }

  // if (!session) {
  //   return null;
  // }

  const getStatusBadge = (status: number) => {
    // Цвета и иконки для статусов
    const config: Record<number, { bg: string; text: string; icon?: JSX.Element }> = {
      1: {
        bg: 'bg-gradient-to-r from-gray-200/70 to-gray-300/60 dark:from-gray-700/60 dark:to-gray-800/60',
        text: 'text-gray-700 dark:text-gray-200',
        icon: (
          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" /></svg>
        ),
      },
      2: {
        bg: 'bg-gradient-to-r from-blue-100/80 to-blue-300/60 dark:from-blue-900/60 dark:to-blue-700/60',
        text: 'text-blue-700 dark:text-blue-300',
        icon: (
          <svg className="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h1l2 7h13" /><circle cx="7.5" cy="19.5" r="1.5" /><circle cx="17.5" cy="19.5" r="1.5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 6V4a2 2 0 00-2 2H6a2 2 0 00-2 2v12" /></svg>
        ),
      },
      3: {
        bg: 'bg-gradient-to-r from-green-200/80 to-green-400/60 dark:from-green-900/60 dark:to-green-700/60',
        text: 'text-green-800 dark:text-green-200',
        icon: (
          <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        ),
      },
      4: {
        bg: 'bg-gradient-to-r from-blue-200/80 to-blue-400/60 dark:from-blue-800/60 dark:to-blue-600/60',
        text: 'text-blue-800 dark:text-blue-200',
        icon: (
          <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h1l2 7h13" /><circle cx="7.5" cy="19.5" r="1.5" /><circle cx="17.5" cy="19.5" r="1.5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 6V4a2 2 0 00-2 2H6a2 2 0 00-2 2v12" /></svg>
        ),
      },
      5: {
        bg: 'bg-gradient-to-r from-red-200/80 to-red-400/60 dark:from-red-900/60 dark:to-red-700/60',
        text: 'text-red-800 dark:text-red-200',
        icon: (
          <svg className="w-4 h-4 mr-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        ),
      },
      6: {
        bg: 'bg-gradient-to-r from-purple-200/80 to-purple-400/60 dark:from-purple-900/60 dark:to-purple-700/60',
        text: 'text-purple-800 dark:text-purple-200',
        icon: (
          <svg className="w-4 h-4 mr-1 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        ),
      },
      7: {
        bg: 'bg-gradient-to-r from-yellow-200/80 to-yellow-400/60 dark:from-yellow-900/60 dark:to-yellow-700/60',
        text: 'text-yellow-800 dark:text-yellow-200',
        icon: (
          <svg className="w-4 h-4 mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" /></svg>
        ),
      },
    };
    const { bg, text, icon } = config[status] || config[1];
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

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1: return "Ожидает";
      case 2: return "На отправке";
      case 3: return "Доставлен";
      case 4: return "Отправлен";
      case 5: return "Отменён";
      case 6: return "Возврат";
      case 7: return "Просрочен";
      default: return "Неизвестно";
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
    // Если заказ оплачен (paid_at не null), показываем дату оплаты
    if (order.paid_at) {
      return order.paid_at;
    }
    // Иначе показываем дату создания
    return order.created_at;
  };

  const handleSort = (field: "orderdate" | "total_amount") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: "orderdate" | "total_amount" }) => {
    if (sortField !== field) {
      return <ArrowUpIcon className="w-4 h-4 text-gray-300" />;
    }
    return sortDirection === "asc" ? 
      <ArrowUpIcon className="w-4 h-4 text-primary" /> : 
      <ArrowDownIcon className="w-4 h-4 text-primary" />;
  };

  if (loading) {
    return (
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => fetchOrders()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Повторить
          </button>
        </div>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-dark dark:text-white mb-2">Заказы не найдены</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || statusFilter !== 0 
                ? 'Попробуйте изменить параметры поиска или фильтры' 
                : 'В данный момент нет доступных заказов'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Header with filters */}
      <div className="flex flex-col gap-4 border-b border-stroke px-4 sm:px-7.5 py-4.5 dark:border-dark-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative z-20 w-full sm:max-w-[414px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary dark:text-white"
              placeholder="Поиск заказов..."
            />
            <button className="absolute right-0 top-0 flex h-11.5 w-11.5 items-center justify-center rounded-r-md bg-primary text-white hover:bg-opacity-90 transition-colors duration-200">
              <SearchIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-dark dark:text-white whitespace-nowrap">Статус:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(Number(e.target.value))}
              className="flex-1 sm:flex-none rounded border border-stroke bg-transparent px-3 py-1.5 text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white focus:border-primary dark:focus:border-primary outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table - скрыта на мобильных */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-dark-2">
              <th className="py-4 px-4 font-medium text-dark dark:text-white xl:pl-11">
                ID
              </th>
              <th className="py-4 px-4 font-medium text-dark dark:text-white">
                Клиент
              </th>
              <th className="py-4 px-4 font-medium text-dark dark:text-white">
                Статус
              </th>
              <th className="py-4 px-4 font-medium text-dark dark:text-white">
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("orderdate")}>
                  Дата
                  <SortIcon field="orderdate" />
                </div>
              </th>
              <th className="py-4 px-4 font-medium text-dark dark:text-white">
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("total_amount")}>
                  Сумма
                  <SortIcon field="total_amount" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-stroke dark:border-dark-3">
                <td className="py-5 px-4 pl-9 dark:text-white">
                  {order.externalid || order.id}
                </td>
                <td className="py-5 px-4 dark:text-white">
                  <div className="flex flex-col">
                    <span className="font-medium">{order.customername || 'Без имени'}</span>
                    <span className="text-sm text-gray-500">{order.customeremail || order.customerphone || 'Нет контактов'}</span>
                  </div>
                </td>
                <td className="py-5 px-4">
                  {getStatusBadge(order.status)}
                </td>
                <td className="py-5 px-4 dark:text-white">
                  {formatDate(getOrderDisplayDate(order))}
                </td>
                <td className="py-5 px-4 dark:text-white">
                  {formatCurrency(order.total_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - показаны только на мобильных */}
      <div className="md:hidden space-y-4 p-4">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#F8FAFC] dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Header с ID и статусом */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#64748B] dark:text-gray-400">ID:</span>
                <span className="font-bold text-[#1E293B] dark:text-white">
                  {order.externalid || order.id}
                </span>
              </div>
              {getStatusBadge(order.status)}
            </div>

            {/* Информация о клиенте */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-[#1E293B] dark:text-white">
                  {order.customername || 'Без имени'}
                </span>
              </div>
              {(order.customeremail || order.customerphone) && (
                <div className="flex items-center gap-2 ml-6">
                  <svg className="w-3 h-3 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-[#64748B] dark:text-gray-400">
                    {order.customeremail || order.customerphone || 'Нет контактов'}
                  </span>
                </div>
              )}
            </div>

            {/* Дата и сумма */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-[#64748B] dark:text-gray-400">
                  {formatDate(getOrderDisplayDate(order))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="font-bold text-lg text-[#1E293B] dark:text-white">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-stroke px-4 sm:px-7.5 py-4.5 dark:border-dark-3">
          <div className="flex items-center justify-center sm:justify-start">
            <span className="text-sm text-dark dark:text-white">
              Показано {orders.length} из {pagination.totalCount}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="flex items-center justify-center rounded-md border border-stroke px-3 sm:px-4 py-2 text-sm text-dark hover:border-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-dark dark:border-dark-3 dark:text-white dark:hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:disabled:hover:bg-transparent dark:disabled:hover:text-white transition-all duration-200"
            >
              Назад
            </button>
            <button
              onClick={() => setCurrentPage(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="flex items-center justify-center rounded-md border border-stroke px-3 sm:px-4 py-2 text-sm text-dark hover:border-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-dark dark:border-dark-3 dark:text-white dark:hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:disabled:hover:bg-transparent dark:disabled:hover:text-white transition-all duration-200"
            >
              Вперед
            </button>
          </div>
        </div>
      )}
    </section>
  );
} 