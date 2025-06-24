"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  orderData: {
    id: number;
    externalid: string | null;
    customername: string | null;
    total_amount: number;
    status: number;
  };
}

const statusLabels: Record<number, string> = {
  0: 'Ожидает оплаты',
  1: 'Ожидает',
  2: 'На отправке',
  3: 'Готовим к отправке',
  4: 'Отправлен',
  5: 'Отменён',
  6: 'Возврат',
  7: 'Просрочен',
};

export default function DeleteOrderModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  orderData 
}: DeleteOrderModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting order:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const canDelete = true; // Можно удалять любой заказ

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl transition-all border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <svg
                  className="h-8 w-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white mb-2">
                  Удалить заказ?
                </h3>
                
                <div className="text-sm text-[#64748B] dark:text-gray-400 mb-4">
                  Вы уверены, что хотите удалить заказ? Это действие нельзя отменить.
                </div>

                {/* Order Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 text-left">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#64748B] dark:text-gray-400">Номер заказа:</span>
                      <span className="text-sm font-medium text-[#1E293B] dark:text-white">
                        #{orderData.externalid || orderData.id}
                      </span>
                    </div>
                    
                    {orderData.customername && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#64748B] dark:text-gray-400">Клиент:</span>
                        <span className="text-sm font-medium text-[#1E293B] dark:text-white">
                          {orderData.customername}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#64748B] dark:text-gray-400">Сумма:</span>
                      <span className="text-sm font-medium text-[#1E293B] dark:text-white">
                        {formatCurrency(orderData.total_amount)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#64748B] dark:text-gray-400">Статус:</span>
                      <span className="text-sm font-medium text-[#1E293B] dark:text-white">
                        {statusLabels[orderData.status] || 'Неизвестно'}
                      </span>
                    </div>
                  </div>
                </div>


              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm font-medium text-[#1E293B] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  onClick={onClose}
                  disabled={isDeleting}
                >
                  Отмена
                </button>
                
                <button
                  type="button"
                  className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all ${
                    canDelete 
                      ? 'bg-red-600 hover:bg-red-700 hover:scale-105' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  onClick={handleConfirm}
                  disabled={isDeleting || !canDelete}
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Удаление...
                    </div>
                  ) : (
                    'Удалить заказ'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
} 