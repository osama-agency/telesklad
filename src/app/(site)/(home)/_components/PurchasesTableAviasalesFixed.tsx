'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { EditPurchaseModal } from '@/components/Modals/EditPurchaseModal';
import { useSendPurchaseToTelegram, useDeletePurchase, Purchase as FullPurchase } from '@/hooks/usePurchases';
import toast from 'react-hot-toast';

/*
  Тип записи покупки. Расширяем для полной поддержки.
*/
export interface Purchase {
  id: string;
  title: string;
  createdAt: string; // ISO строка
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  totalRUB: number;
  totalTRY: number;
}

interface Props {
  purchases: Purchase[];
  onSelect?: (purchase: Purchase) => void;
  onRefresh?: () => void; // Функция для обновления данных
}

/*
  Современный компонент: адаптивная сетка карт в фирменном стиле Telesklad.
  Без сторонних UI-библиотек, только Tailwind + Framer Motion.
*/
const PurchasesTableAviasalesFixed: React.FC<Props> = ({ purchases, onSelect, onRefresh }) => {
  const [editingPurchase, setEditingPurchase] = useState<FullPurchase | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Мутации
  const sendToTelegramMutation = useSendPurchaseToTelegram();
  const deletePurchaseMutation = useDeletePurchase();

  // Обработчик отправки в Telegram
  const handleSendTelegram = async (purchaseId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    
    setSendingId(purchaseId);
    try {
      await sendToTelegramMutation.mutate(parseInt(purchaseId));
      toast.success('✅ Закупка успешно отправлена в Telegram!');
      onRefresh?.(); // Обновляем данные
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      toast.error('❌ Ошибка отправки в Telegram');
    } finally {
      setSendingId(null);
    }
  };

  // Обработчик редактирования
  const handleEdit = async (purchase: Purchase, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Загружаем полные данные закупки
      const response = await fetch(`/api/purchases/${purchase.id}`);
      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных закупки');
      }
      
      const fullPurchase = await response.json();
      setEditingPurchase(fullPurchase);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error loading purchase data:', error);
      toast.error('Ошибка при загрузке данных закупки');
    }
  };

  // Обработчик удаления
  const handleDelete = async (purchase: Purchase, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Вы уверены, что хотите удалить закупку #${purchase.id}?`)) {
      return;
    }

    try {
      await deletePurchaseMutation.mutate(parseInt(purchase.id));
      toast.success('Закупка удалена');
      onRefresh?.(); // Обновляем данные
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error('Ошибка при удалении закупки');
    }
  };

  // Закрытие модального окна редактирования
  const handleCloseEditModal = () => {
    setEditingPurchase(null);
    setIsEditModalOpen(false);
  };

  // Обработчик сохранения изменений
  const handleSaveChanges = async () => {
    handleCloseEditModal();
    onRefresh?.(); // Обновляем данные
    toast.success('Закупка обновлена');
  };

  if (!purchases?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 dark:text-gray-400">
        <Image 
          src="/images/illustration/illustration-01.svg" 
          alt="Empty" 
          width={160}
          height={160}
          className="mb-6 opacity-80 dark:opacity-60" 
        />
        <p className="text-lg font-medium">Пока нет закупок</p>
        <p className="text-sm">Добавьте первую закупку, чтобы увидеть её здесь.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <AnimatePresence>
          {purchases.map((p) => (
            <motion.div
              key={p.id}
              layout
              whileHover={{ scale: 1.02 }}
              className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl hover:border-[#1A6DFF]/30 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#1A6DFF]/30"
            >
              {/* Header */}
              <div 
                className="flex items-start justify-between gap-2 p-4 cursor-pointer"
                onClick={() => onSelect?.(p)}
              >
                <h3 className="line-clamp-2 text-left text-base font-semibold text-[#1E293B] dark:text-white">
                  {p.title}
                </h3>
                {/* Статусная метка */}
                <span
                  className={
                    {
                      draft: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      sent: 'bg-[#1A6DFF] text-white inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap',
                      paid: 'bg-green-100 text-green-600 dark:bg-green-600/20 dark:text-green-300 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      cancelled: 'bg-red-100 text-red-600 dark:bg-red-600/20 dark:text-red-300 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    }[p.status]
                  }
                >

                  {statusLabel(p.status)}
                </span>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />

              {/* Body */}
              <div 
                className="flex flex-1 flex-col justify-between gap-4 p-4 cursor-pointer"
                onClick={() => onSelect?.(p)}
              >
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Создано: {formatDate(p.createdAt)}</span>
                </div>
                {/* Сумма */}
                <div>
                  <p className="text-lg font-bold text-[#1E293B] dark:text-white">
                    {formatNumber(p.totalRUB)} ₽
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatNumber(p.totalTRY)} ₺
                  </p>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex items-center justify-between gap-2 p-4 pt-0 border-t border-gray-100 dark:border-gray-700">
                {/* Кнопка отправки (только для черновиков) */}
                {p.status === 'draft' && (
                  <motion.button
                    onClick={(e) => handleSendTelegram(p.id, e)}
                    disabled={sendingId === p.id || sendToTelegramMutation.isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingId === p.id ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Отправка...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Отправить</span>
                      </>
                    )}
                  </motion.button>
                )}

                {/* Кнопки редактирования и удаления */}
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={(e) => handleEdit(p, e)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-600 hover:text-[#1A6DFF] hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                    title="Редактировать закупку"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </motion.button>

                  <motion.button
                    onClick={(e) => handleDelete(p, e)}
                    disabled={deletePurchaseMutation.isLoading}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                    title="Удалить закупку"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Градиентная полоса внизу */}
              <div className="mt-auto h-1 w-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] group-hover:animate-pulse" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Модальное окно редактирования */}
      {editingPurchase && (
        <EditPurchaseModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          purchase={editingPurchase}
          onSave={handleSaveChanges}
          isLoading={false}
        />
      )}
    </>
  );
};

export default PurchasesTableAviasalesFixed;

// ----------------- helpers -----------------
function statusLabel(status: Purchase['status']) {
  switch (status) {
    case 'draft':
      return 'Черновик';
    case 'sent':
      return 'Отправлено в Телеграм';
    case 'paid':
      return 'Оплачен';
    case 'cancelled':
      return 'Отменён';
    default:
      return status;
  }
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU');
} 