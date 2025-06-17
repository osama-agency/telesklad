"use client";

import { SearchIcon, ArrowUpIcon, ArrowDownIcon } from "@/assets/icons";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  useOrdersQuery, 
  getOrderStatusLabel,
  type OrderEntity,
  type OrdersParams 
} from "@/hooks/useOrders";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(0);
  const [sortField, setSortField] = useState<"orderdate" | "total_amount">("orderdate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // React Query hook
  const queryParams: OrdersParams = {
    page: currentPage,
    limit: 25,
    search: searchQuery || undefined,
    status: statusFilter === 0 ? undefined : statusFilter,
    sortBy: sortField === "orderdate" ? "created_at" : sortField,
    sortOrder: sortDirection,
  };

  const { 
    data: ordersData, 
    isLoading: loading, 
    error,
    refetch 
  } = useOrdersQuery(queryParams);

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination;

  if (loading) {
    return (
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Загрузка заказов...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-red-500 mb-4">Ошибка: {error.message}</div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Повторить
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-dark-2">
              <th className="py-4 px-4 font-medium text-dark dark:text-white">ID</th>
              <th className="py-4 px-4 font-medium text-dark dark:text-white">Клиент</th>
              <th className="py-4 px-4 font-medium text-dark dark:text-white">Статус</th>
              <th className="py-4 px-4 font-medium text-dark dark:text-white">Дата</th>
              <th className="py-4 px-4 font-medium text-dark dark:text-white">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-stroke dark:border-dark-3">
                <td className="py-5 px-4 dark:text-white">
                  {order.externalid || order.id}
                </td>
                <td className="py-5 px-4 dark:text-white">
                  <div className="flex flex-col">
                    <span className="font-medium">{order.customername || 'Без имени'}</span>
                    <span className="text-sm text-gray-500">{order.customeremail || order.customerphone || 'Нет контактов'}</span>
                  </div>
                </td>
                <td className="py-5 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {getOrderStatusLabel(order.status)}
                  </span>
                </td>
                <td className="py-5 px-4 dark:text-white">
                  {new Date(order.created_at).toLocaleDateString('ru-RU')}
                </td>
                <td className="py-5 px-4 dark:text-white">
                  {new Intl.NumberFormat('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                    minimumFractionDigits: 0
                  }).format(order.total_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {pagination && (
        <div className="flex items-center justify-between border-t border-stroke px-4 py-4 dark:border-dark-3">
          <div className="text-sm text-gray-500">
            Показано {orders.length} из {pagination.totalCount}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Назад
            </button>
            <span className="px-3 py-1 text-sm">
              {pagination.page} из {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        </div>
      )}
    </section>
  );
} 