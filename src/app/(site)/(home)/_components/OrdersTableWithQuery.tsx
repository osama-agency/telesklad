"use client";

import { SearchIcon, ArrowUpIcon, ArrowDownIcon } from "@/assets/icons";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  useOrdersQuery, 
  ORDER_STATUSES,
  useDeleteOrder,
  useUpdateOrder,
  type OrderEntity,
  type OrdersParams 
} from "@/hooks/useOrders";
import { get } from "@/lib/api";
import DeleteOrderModal from "@/components/Modals/DeleteOrderModal";
import EditOrderModal from "@/components/Modals/EditOrderModal";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import Spinner from "@/components/common/Spinner";
import { useDebounce } from "@/hooks/useDebounce";
import TableSkeleton from "@/components/common/TableSkeleton";

const statusOptions = [
  { value: 0, label: "Все статусы" },
  { value: 1, label: "Ожидает" },
  { value: 2, label: "На отправке" },
  { value: 3, label: "Готовим к отправке" },
  { value: 4, label: "Отправлен" },
  { value: 5, label: "Отменён" },
  { value: 6, label: "Возврат" },
  { value: 7, label: "Просрочен" },
];

const getStatusBadge = (status: number) => {
  // Цвета и иконки для статусов
  const config: Record<number, { bg: string; text: string; icon?: JSX.Element; label: string }> = {
    1: {
      bg: 'bg-gradient-to-r from-gray-200/70 to-gray-300/60 dark:from-gray-700/60 dark:to-gray-800/60',
      text: 'text-gray-700 dark:text-gray-200',
      label: 'Ожидает',
      icon: (
        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" /></svg>
      ),
    },
    2: {
      bg: 'bg-gradient-to-r from-blue-100/80 to-blue-300/60 dark:from-blue-900/60 dark:to-blue-700/60',
      text: 'text-blue-700 dark:text-blue-300',
      label: 'На отправке',
      icon: (
        <svg className="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h1l2 7h13" /><circle cx="7.5" cy="19.5" r="1.5" /><circle cx="17.5" cy="19.5" r="1.5" /></svg>
      ),
    },
    3: {
      bg: 'bg-gradient-to-r from-amber-100/80 to-amber-300/60 dark:from-amber-900/60 dark:to-amber-700/60',
      text: 'text-amber-700 dark:text-amber-300',
      label: 'Готовим к отправке',
      icon: (
        <svg className="w-4 h-4 mr-1 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
      ),
    },
    4: {
      bg: 'bg-gradient-to-r from-blue-200/80 to-blue-400/60 dark:from-blue-800/60 dark:to-blue-600/60',
      text: 'text-blue-800 dark:text-blue-200',
      label: 'Отправлен',
      icon: (
        <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h1l2 7h13" /><circle cx="7.5" cy="19.5" r="1.5" /><circle cx="17.5" cy="19.5" r="1.5" /></svg>
      ),
    },
    5: {
      bg: 'bg-gradient-to-r from-red-200/80 to-red-400/60 dark:from-red-900/60 dark:to-red-700/60',
      text: 'text-red-800 dark:text-red-200',
      label: 'Отменён',
      icon: (
        <svg className="w-4 h-4 mr-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
      ),
    },
    6: {
      bg: 'bg-gradient-to-r from-purple-200/80 to-purple-400/60 dark:from-purple-900/60 dark:to-purple-700/60',
      text: 'text-purple-800 dark:text-purple-200',
      label: 'Возврат',
      icon: (
        <svg className="w-4 h-4 mr-1 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h2l3-3m6 0l-3 3h-2m0 4h2l3 3m6 0l-3-3h-2" /></svg>
      ),
    },
    7: {
      bg: 'bg-gradient-to-r from-yellow-200/80 to-yellow-400/60 dark:from-yellow-900/60 dark:to-yellow-700/60',
      text: 'text-yellow-800 dark:text-yellow-200',
      label: 'Просрочен',
      icon: (
        <svg className="w-4 h-4 mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" /></svg>
      ),
    },
  };

  const { bg, text, icon, label } = config[status] || {
    bg: 'bg-gradient-to-r from-gray-200/70 to-gray-300/60 dark:from-gray-700/60 dark:to-gray-800/60',
    text: 'text-gray-700 dark:text-gray-200',
    label: 'Неизвестно',
    icon: <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide shadow-sm ${bg} ${text} border border-transparent`}
      style={{ minWidth: 0, fontVariant: 'all-small-caps', letterSpacing: '0.04em', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}
    >
      {icon}
      <span className="truncate">{label}</span>
    </motion.div>
  );
};

export function OrdersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState(0);
  const [sortField, setSortField] = useState<"orderdate" | "total_amount">("orderdate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<OrderEntity | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<OrderEntity | null>(null);

  // React Query hook
  const queryParams: OrdersParams = {
    page: currentPage,
    limit: 25,
    search: debouncedSearchTerm || undefined,
    status: statusFilter === 0 ? undefined : statusFilter,
    sortBy: sortField === "orderdate" ? "created_at" : sortField,
    sortOrder: sortDirection,
  };

  const { 
    data: ordersData, 
    isLoading: loading, 
    error,
    refetch,
    removeOrderOptimistically
  } = useOrdersQuery(queryParams);

  // Хук для удаления заказа
  const deleteOrderMutation = useDeleteOrder();
  // Хук для обновления заказа
  const updateOrderMutation = useUpdateOrder();
  
  // Хук для тостов
  const { toasts, success, error: showError, removeToast } = useToast();

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination;
  const stats = ordersData?.stats;

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

  const formatDate = (date: string | Date | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === "asc" ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />;
  };

  const handleEditClick = async (order: OrderEntity) => {
    try {
      console.log('🔍 Loading order data from server for ID:', order.id);
      // Загружаем полные данные заказа с сервера
      const fullOrder = await get<OrderEntity>(`/orders/${order.id}`);
      console.log('✅ Received full order data from server:', fullOrder);
      setOrderToEdit(fullOrder);
      setEditModalOpen(true);
    } catch (error) {
      console.error('❌ Ошибка загрузки заказа:', error);
      console.log('🔄 Using fallback data from list:', order);
      // Если не удалось загрузить с сервера, используем данные из списка
      setOrderToEdit(order);
      setEditModalOpen(true);
    }
  };

  const handleEditSave = async (updatedOrder: Partial<OrderEntity>) => {
    if (!orderToEdit) return;

    try {
      await updateOrderMutation.mutate({ id: orderToEdit.id, data: updatedOrder });
      success('Заказ обновлен', `Данные заказа #${orderToEdit.externalid || orderToEdit.id} успешно обновлены.`);
      setEditModalOpen(false);
      refetch(); // Обновляем список заказов
    } catch (error) {
      showError('Ошибка обновления', error instanceof Error ? error.message : 'Не удалось обновить заказ');
    }
  };

  const handleDeleteClick = (order: OrderEntity) => {
    setOrderToDelete(order);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    
    const orderToDeleteRef = orderToDelete;
    
    // Закрываем модальное окно сразу
    setDeleteModalOpen(false);
    setOrderToDelete(null);
    
    try {
      // Используем оптимистичное удаление
      await deleteOrderMutation.mutateOptimistic(
        orderToDeleteRef.id,
        (id) => removeOrderOptimistically(id)
      );
      
      // Показываем уведомление об успехе
      success(
        'Заказ удален',
        `Заказ #${orderToDeleteRef.externalid || orderToDeleteRef.id} успешно удален из системы`
      );
    } catch (error) {
      console.error('Ошибка при удалении заказа:', error);
      // При ошибке обновляем данные с сервера, чтобы восстановить состояние
      refetch();
      // Показываем уведомление об ошибке
      showError(
        'Ошибка удаления',
        error instanceof Error ? error.message : 'Не удалось удалить заказ'
      );
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  // Компонент прогресс-бара для заказов
  const OrderProgress = ({ order }: { order: any }) => {
    const steps = [
      { key: 'created', label: 'Создан', date: order.created_at, active: true },
      { key: 'paid', label: 'Оплачен', date: order.paid_at, active: !!order.paid_at },
      { key: 'shipped', label: 'Отправлен', date: order.shipped_at, active: !!order.shipped_at },
    ];
    
    return (
      <div className="flex items-center gap-1 mt-1">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div 
              className={`w-2 h-2 rounded-full transition-colors ${
                step.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`} 
              title={step.date ? new Date(step.date).toLocaleDateString('ru-RU') : step.label}
            />
            {index < steps.length - 1 && (
              <div className={`w-4 h-0.5 mx-0.5 ${
                steps[index + 1].active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-16">
          <Spinner size="md" />
          <span className="ml-3 text-[#1E293B] dark:text-white">Загрузка заказов...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-red-500 mb-4">Ошибка: {typeof error === 'string' ? error : (error as any)?.message || 'Неизвестная ошибка'}</div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:scale-105 transition-all duration-300"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Модальные окна */}
      {orderToDelete && (
        <DeleteOrderModal
          isOpen={deleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          orderData={{
            id: orderToDelete.id,
            externalid: orderToDelete.externalid,
            customername: orderToDelete.customername,
            total_amount: orderToDelete.total_amount,
            status: orderToDelete.status
          }}
        />
      )}
      <EditOrderModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
        order={orderToEdit}
      />

      {/* Статистика */}
      {stats && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300">
            <div className="text-2xl font-bold text-[#1E293B] dark:text-white mb-1">
              {pagination?.totalCount || 0}
            </div>
            <div className="text-sm text-[#64748B] dark:text-gray-400">Всего заказов</div>
          </div>
          <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300">
            <div className="text-2xl font-bold text-[#1E293B] dark:text-white mb-1">
              {formatCurrency(stats.averageOrderValue)}
            </div>
            <div className="text-sm text-[#64748B] dark:text-gray-400">Средний чек</div>
          </div>
          <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300">
            <div className="text-2xl font-bold text-[#1E293B] dark:text-white mb-1">
              {stats.totalDeliveryCost && parseFloat(stats.totalDeliveryCost.toString()) > 0 
                ? formatCurrency(stats.totalDeliveryCost)
                : <span className="text-gray-400 dark:text-gray-500 text-lg">—</span>
              }
            </div>
            <div className="text-sm text-[#64748B] dark:text-gray-400">
              Доставка
              {stats.totalDeliveryCost && parseFloat(stats.totalDeliveryCost.toString()) === 0 && (
                <span className="ml-1 text-xs opacity-60">(не указана)</span>
              )}
            </div>
          </div>
          <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300">
            <div className="text-2xl font-bold text-[#1E293B] dark:text-white mb-1">
              {stats.totalBonus && stats.totalBonus > 0 
                ? formatCurrency(stats.totalBonus)
                : <span className="text-gray-400 dark:text-gray-500 text-lg">—</span>
              }
            </div>
            <div className="text-sm text-[#64748B] dark:text-gray-400">
              Бонусы
              {stats.totalBonus === 0 && (
                <span className="ml-1 text-xs opacity-60">(не использовались)</span>
              )}
            </div>
          </div>
          <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300">
            <div className="text-2xl font-bold text-[#1E293B] dark:text-white mb-1">
              {stats.shippedOrders}
            </div>
            <div className="text-sm text-[#64748B] dark:text-gray-400">В пути</div>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="mb-8 rounded-xl bg-container p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {/* Статус фильтр */}
          <div className="w-full max-w-[200px]">
            <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-3">
              Статус заказа
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(Number(e.target.value))}
              className="w-full appearance-none rounded-lg border border-gray-200 dark:border-gray-600 bg-container px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>



          {/* Поиск */}
          <div className="flex-1 max-w-[350px]">
            <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-3">
              Поиск по клиенту/номеру
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-container px-5 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
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
        <div className="hidden sm:block rounded-2xl bg-container shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300">
      <div className="overflow-x-auto">
            <table className="w-full">
          <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
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
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Доставка
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleSort("total_amount")}
                      className="inline-flex items-center gap-2 text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider hover:text-[#1A6DFF] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Сумма
                      <SortIcon field="total_amount" />
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
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      Действия
                    </div>
                  </th>
            </tr>
          </thead>
              {loading ? (
                <TableSkeleton rows={10} />
              ) : error ? (
                <tbody className="bg-white dark:bg-gray-800">
                  <tr>
                    <td colSpan={8} className="text-center py-10">
                      <p className="text-red-500">Ошибка загрузки данных: {error}</p>
                      <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Попробовать снова
                      </button>
                    </td>
                  </tr>
                </tbody>
              ) : orders.length > 0 ? (
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-[#1E293B] dark:text-white">
                            #{order.externalid || order.id}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-gray-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(order.paid_at || order.created_at)}
                          </div>
                          <OrderProgress order={order} />
                        </div>
                </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-[#1E293B] dark:text-white">
                            {order.customername || 
                             (order.user ? `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() : '') || 
                             'Не указано'}
                          </p>
                          {(order.customeremail || order.customerphone) && (
                            <div className="space-y-0.5">
                              {order.customeremail && (
                                <p className="text-xs text-[#64748B] dark:text-gray-400">{order.customeremail}</p>
                              )}
                              {order.customerphone && (
                                <p className="text-xs text-[#64748B] dark:text-gray-400">{order.customerphone}</p>
                              )}
                            </div>
                          )}
                          {order.bonus > 0 && (
                            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Бонус: {formatCurrency(order.bonus)}
                            </div>
                          )}
                  </div>
                </td>
                      <td className="px-6 py-4">
                  {order.order_items && order.order_items.length > 0 ? (
                    <div className="space-y-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[#1E293B] dark:text-white line-clamp-1">
                        {order.order_items[0].name}
                                </p>
                                <p className="text-xs text-[#64748B] dark:text-gray-400">
                                  {order.order_items[0].quantity} × {formatCurrency(order.order_items[0].price)}
                                </p>
                              </div>
                            </div>
                            {order.order_items.length > 1 && (
                              <p className="text-xs text-[#64748B] dark:text-gray-400">
                                +{order.order_items.length - 1} товар{order.order_items.length - 1 === 1 ? '' : order.order_items.length - 1 < 5 ? 'а' : 'ов'}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-[#64748B] dark:text-gray-400">—</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {order.customercity && (
                            <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-gray-400">
                              <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {order.customercity}
                            </div>
                          )}
                          {order.tracking_number && (
                            <div className="flex items-center gap-1 text-xs font-mono">
                              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <a
                                href={order.tracking_number.startsWith('@') 
                                  ? order.tracking_number.substring(1) 
                                  : order.tracking_number.startsWith('http') 
                                    ? order.tracking_number 
                                    : `https://www.pochta.ru/tracking#${order.tracking_number}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1A6DFF] hover:text-[#00C5FF] transition-colors underline decoration-dotted"
                              >
                                {order.tracking_number}
                              </a>
                            </div>
                          )}
                                                     {order.deliverycost && order.deliverycost > 0 && (
                            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {formatCurrency(order.deliverycost)}
                            </div>
                          )}
                                                     {!order.customercity && !order.tracking_number && (!order.deliverycost || order.deliverycost === 0) && (
                            <span className="text-xs text-[#64748B] dark:text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[#1E293B] dark:text-white">
                            {formatCurrency(order.total_amount)}
                          </p>
                          <p className="text-xs text-[#64748B] dark:text-gray-400">
                            {order.currency || 'RUB'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {getStatusBadge(order.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(order)}
                            className="p-2 rounded-lg transition-all duration-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            title="Редактировать заказ"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(order)}
                            className="p-2 rounded-lg transition-all duration-300 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            title="Удалить заказ"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody className="bg-white dark:bg-gray-800">
                  <tr>
                    <td colSpan={8} className="text-center py-20">
                      <div className="flex flex-col items-center">
                        <SearchIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                          Заказы не найдены
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Попробуйте изменить фильтры или поисковый запрос.
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        </div>

        {/* Mobile карточки */}
        <div className="sm:hidden space-y-3">
          {orders.length === 0 ? (
            <div className="rounded-2xl bg-container p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
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
                className="rounded-2xl bg-container p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-[#1E293B] dark:text-white">
                      Заказ #{order.externalid || order.id}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-gray-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(order.paid_at || order.created_at)}
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Customer */}
                <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-[#1E293B] dark:text-white mb-1">
                    {order.customername || 
                     (order.user ? `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() : '') || 
                     'Клиент не указан'}
                  </p>
                  {(order.customeremail || order.customerphone) && (
                    <div className="space-y-0.5">
                      {order.customeremail && (
                        <p className="text-xs text-[#64748B] dark:text-gray-400">{order.customeremail}</p>
                      )}
                      {order.customerphone && (
                        <p className="text-xs text-[#64748B] dark:text-gray-400">{order.customerphone}</p>
                      )}
                    </div>
                  )}
                  {order.customercity && (
                    <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-gray-400 mt-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {order.customercity}
                    </div>
                  )}
                  {order.bonus > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mt-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Бонус: {formatCurrency(order.bonus)}
                    </div>
                  )}
                      </div>

                {/* Items */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="mb-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1E293B] dark:text-white line-clamp-1">
                            {order.order_items[0].name}
                          </p>
                          <p className="text-xs text-[#64748B] dark:text-gray-400">
                        {order.order_items[0].quantity} × {formatCurrency(order.order_items[0].price)}
                          </p>
                        </div>
                      </div>
                      {order.order_items.length > 1 && (
                        <p className="text-xs text-[#64748B] dark:text-gray-400">
                          +{order.order_items.length - 1} товар{order.order_items.length - 1 === 1 ? '' : order.order_items.length - 1 < 5 ? 'а' : 'ов'}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Info */}
                {(order.tracking_number || (order.deliverycost && order.deliverycost > 0)) && (
                  <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-[#1E293B] dark:text-white mb-2">Доставка</h4>
                    <div className="space-y-1">
                      {order.tracking_number && (
                        <div className="flex items-center gap-1 text-xs">
                          <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <a
                            href={order.tracking_number.startsWith('@') 
                              ? order.tracking_number.substring(1) 
                              : order.tracking_number.startsWith('http') 
                                ? order.tracking_number 
                                : `https://www.pochta.ru/tracking#${order.tracking_number}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[#1A6DFF] hover:text-[#00C5FF] transition-colors underline decoration-dotted"
                          >
                            {order.tracking_number}
                          </a>
                        </div>
                      )}
                      {order.deliverycost && order.deliverycost > 0 && (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Стоимость: {formatCurrency(order.deliverycost)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress */}
                <div className="mb-3">
                  <OrderProgress order={order} />
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-[#64748B] dark:text-gray-400">Итого</span>
                  <div className="text-right">
                    <p className="font-semibold text-[#1E293B] dark:text-white">
                  {formatCurrency(order.total_amount)}
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-gray-400">
                      {order.currency || 'RUB'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(order)}
                      className="p-2 rounded-lg transition-all duration-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      title="Редактировать заказ"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(order)}
                      className="p-2 rounded-lg transition-all duration-300 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      title="Удалить заказ"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Пагинация */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-[#64748B] dark:text-gray-400">
            Показаны {((pagination.page - 1) * 25) + 1}-{Math.min(pagination.page * 25, pagination.totalCount)} из {pagination.totalCount} заказов
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

      {/* Контейнер тостов */}
      <ToastContainer 
        toasts={toasts.map(toast => ({ ...toast, onClose: removeToast }))} 
        onClose={removeToast} 
      />
    </div>
  );
} 