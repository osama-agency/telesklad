"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  usePurchases, 
  useDeletePurchase, 
  useSendPurchaseToTelegram,
  useReceivePurchase,
  getPurchaseStatusLabel,
  type Purchase 
} from "@/hooks/usePurchases";
import { ReceivePurchaseModal } from "@/components/Modals/ReceivePurchaseModal";
import toast from 'react-hot-toast';

export function PurchasesTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  
  // Состояние модального окна оприходования
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedPurchaseForReceive, setSelectedPurchaseForReceive] = useState<Purchase | null>(null);

  // React Query hooks
  const { 
    data: purchases = [], 
    isLoading: loading, 
    error 
  } = usePurchases({
    page: currentPage + 1,
    limit: pageSize,
    search: globalFilter || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const deletePurchaseMutation = useDeletePurchase();
  const sendToTelegramMutation = useSendPurchaseToTelegram();
  const receivePurchaseMutation = useReceivePurchase();

  // Фильтрация закупок
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = globalFilter === "" || 
      purchase.id.toString().includes(globalFilter) ||
      (purchase.items && purchase.items.length > 0 && purchase.items.some(item => 
        item.product?.name?.toLowerCase().includes(globalFilter.toLowerCase())
      ));
    
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Пагинация
  const totalPages = Math.ceil(filteredPurchases.length / pageSize);
  const startIndex = currentPage * pageSize;
  const paginatedPurchases = filteredPurchases.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получение основного товара для отображения
  const getMainProduct = (items: Purchase['items']) => {
    if (!items || items.length === 0) return "Нет товаров";
    if (items.length === 1) return items[0]?.product?.name || "Товар";
    return `${items[0]?.product?.name || "Товар"} +${items.length - 1} др.`;
  };

  // Функция форматирования статуса
  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "draft":
        return `${baseClasses} bg-gray-500/10 text-gray-500 border border-gray-500/20`;
      case "sent":
        return `${baseClasses} bg-blue-500/10 text-blue-500 border border-blue-500/20`;
      case "ordered":
        return `${baseClasses} bg-blue-500/10 text-blue-500 border border-blue-500/20`;
      case "awaiting_payment":
        return `${baseClasses} bg-orange-500/10 text-orange-500 border border-orange-500/20`;
      case "paid":
        return `${baseClasses} bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`;
      case "in_transit":
        return `${baseClasses} bg-purple-500/10 text-purple-500 border border-purple-500/20`;
      case "received":
        return `${baseClasses} bg-teal-500/10 text-teal-500 border border-teal-500/20`;
      case "cancelled":
        return `${baseClasses} bg-red-500/10 text-red-500 border border-red-500/20`;
      default:
        return `${baseClasses} bg-gray-500/10 text-gray-500 border border-gray-500/20`;
    }
  };

  // Обработчик отправки в Telegram
  const handleSendTelegram = async (purchaseId: number) => {
    try {
      await sendToTelegramMutation.mutateAsync(purchaseId);
      toast.success('✅ Закупка успешно отправлена в Telegram!');
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      toast.error('❌ Ошибка отправки в Telegram');
    }
  };

  // Обработчик удаления
  const handleDelete = async (purchase: Purchase) => {
    if (!confirm(`Вы уверены, что хотите удалить закупку #${purchase.id}?`)) {
      return;
    }

    try {
      await deletePurchaseMutation.mutateAsync(purchase.id);
      toast.success('Закупка удалена');
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error('Ошибка при удалении закупки');
    }
  };

  // Обработчик открытия модального окна оприходования
  const handleOpenReceiveModal = (purchase: Purchase) => {
    setSelectedPurchaseForReceive(purchase);
    setIsReceiveModalOpen(true);
  };

  // Обработчик оприходования закупки
  const handleReceivePurchase = async (data: {
    purchaseId: number;
    items: Array<{
      id: number;
      receivedQuantity: number;
    }>;
    logisticsExpense: number;
    receivedAt: string;
    notes?: string;
  }) => {
    try {
      await receivePurchaseMutation.mutateAsync({
        id: data.purchaseId,
        data: {
          items: data.items,
          logisticsExpense: data.logisticsExpense,
          receivedAt: data.receivedAt,
          notes: data.notes
        }
      });

      toast.success('Закупка успешно оприходована!');
      setIsReceiveModalOpen(false);
      setSelectedPurchaseForReceive(null);
    } catch (error) {
      console.error('Error receiving purchase:', error);
      throw error; // Re-throw для обработки в модальном окне
    }
  };

  if (loading) {
    return (
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Загрузка закупок...</span>
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
            onClick={() => window.location.reload()}
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
      {/* Фильтры */}
      <div className="flex flex-col gap-4 border-b border-stroke px-4 sm:px-7.5 py-4.5 dark:border-dark-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative z-20 w-full sm:max-w-[414px]">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary dark:text-white"
              placeholder="Поиск закупок..."
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-dark dark:text-white whitespace-nowrap">Статус:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none rounded border border-stroke bg-transparent px-3 py-1.5 text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white focus:border-primary dark:focus:border-primary outline-none"
            >
              <option value="all">Все статусы</option>
              <option value="draft">Черновик</option>
              <option value="sent">Отправлено</option>
              <option value="awaiting_payment">Ожидает оплату</option>
              <option value="paid">Оплачено</option>
              <option value="in_transit">В пути</option>
              <option value="received">Получено</option>
              <option value="cancelled">Отменено</option>
            </select>
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-dark-2">
              <th className="py-4 px-4 font-medium text-dark dark:text-white">ID</th>
              <th className="py-4 px-4 font-medium text-dark dark:text-white">Товары</th>
              <th className="py-4 px-4 font-medium text-dark dark:text-white">Статус</th>
              <th className="py-4 px-4 font-medium text-dark dark:text-white">Сумма</th>
              <th className="py-4 px-4 font-medium text-dark dark:text-white">Дата</th>
              <th className="py-4 px-4 font-medium text-dark dark:text-white">Действия</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPurchases.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                  Закупки не найдены
                </td>
              </tr>
            ) : (
              paginatedPurchases.map((purchase) => (
                <motion.tr 
                  key={purchase.id} 
                  className="border-b border-stroke dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <td className="py-5 px-4 dark:text-white font-medium">
                    #{purchase.id}
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-dark dark:text-white">
                        {getMainProduct(purchase.items)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {purchase.items?.length || 0} позиций
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className={getStatusBadge(purchase.status)}>
                      {getPurchaseStatusLabel(purchase.status)}
                    </span>
                  </td>
                  <td className="py-5 px-4 dark:text-white font-semibold">
                    {new Intl.NumberFormat('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      minimumFractionDigits: 0,
                    }).format(purchase.totalAmount)}
                  </td>
                  <td className="py-5 px-4 dark:text-white">
                    {formatDate(purchase.createdAt)}
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-2">
                      {purchase.status === 'draft' && (
                        <button
                          onClick={() => handleSendTelegram(purchase.id)}
                          disabled={sendToTelegramMutation.isPending}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Отправить в Telegram"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      )}

                      {(purchase.status === 'paid' || purchase.status === 'in_transit') && (
                        <button
                          onClick={() => handleOpenReceiveModal(purchase)}
                          disabled={receivePurchaseMutation.isPending}
                          className="p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Товар приехал - оприходовать"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(purchase)}
                        disabled={deletePurchaseMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Удалить"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-stroke px-4 py-4 dark:border-dark-3">
          <div className="text-sm text-gray-500">
            Показано {startIndex + 1}-{Math.min(startIndex + pageSize, filteredPurchases.length)} из {filteredPurchases.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Назад
            </button>
            <span className="px-3 py-1 text-sm">
              {currentPage + 1} из {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно оприходования */}
      <ReceivePurchaseModal
        isOpen={isReceiveModalOpen}
        onClose={() => {
          setIsReceiveModalOpen(false);
          setSelectedPurchaseForReceive(null);
        }}
        purchase={selectedPurchaseForReceive}
        onReceive={handleReceivePurchase}
        isLoading={receivePurchaseMutation.isPending}
      />
    </section>
  );
} 