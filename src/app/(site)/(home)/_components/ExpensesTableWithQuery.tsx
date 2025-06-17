"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useDateRange } from "@/context/DateRangeContext";
import { 
  useExpenses, 
  useCreateExpense, 
  useUpdateExpense, 
  useDeleteExpense,
  useExpenseCategories,
  type Expense
} from "@/hooks/useExpenses";
import ExpenseStats from "../../expenses/_components/ExpenseStats";
import ExpenseModal from "../../expenses/_components/ExpenseModal";
import ConfirmDeleteModal from "../../expenses/_components/ConfirmDeleteModal";
import { ToastContainer, useToast } from "@/components/ui/toastNotification";

export function ExpensesTable() {
  const { dateRange } = useDateRange();
  const { toasts, removeToast, success, error } = useToast();

  // React Query hooks
  const { 
    data: expenses = [], 
    isLoading: isInitialLoading, 
    refetch 
  } = useExpenses({
    dateFrom: dateRange.from?.toISOString(),
    dateTo: dateRange.to?.toISOString(),
  });

  const { data: categories = [] } = useExpenseCategories();
  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  // Локальное состояние для модальных окон
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  // Подсчет статистики
  const stats = useMemo(() => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalCount = expenses.length;
    return { totalAmount, totalCount };
  }, [expenses]);

  // Проверяем состояние любых активных мутаций
  const isLoading = createExpenseMutation.isPending || 
                   updateExpenseMutation.isPending || 
                   deleteExpenseMutation.isPending;

  // Обработчик создания нового расхода
  const handleCreateExpense = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  // Обработчик редактирования расхода
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  // Обработчик открытия модального окна удаления
  const handleDeleteExpense = async (id: number) => {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
      setDeletingExpense(expense);
      setIsDeleteModalOpen(true);
    }
  };

  // Обработчик подтверждения удаления
  const handleConfirmDelete = async () => {
    if (!deletingExpense) return;
    
    try {
      await deleteExpenseMutation.mutateAsync(deletingExpense.id);
      setIsDeleteModalOpen(false);
      setDeletingExpense(null);
      success('Расход удален', 'Расход успешно удален из системы');
    } catch (err) {
      console.error('Ошибка при удалении расхода:', err);
      error('Ошибка удаления', 'Не удалось удалить расход. Попробуйте еще раз.');
    }
  };

  // Обработчик отмены удаления
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingExpense(null);
  };

  // Обработчик сохранения расхода
  const handleSaveExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingExpense) {
        await updateExpenseMutation.mutateAsync({
          id: editingExpense.id,
          data: expenseData
        });
        success('Расход обновлен', 'Изменения успешно сохранены');
      } else {
        await createExpenseMutation.mutateAsync(expenseData);
        success('Расход создан', 'Новый расход добавлен в систему');
      }
      setIsModalOpen(false);
      setEditingExpense(null);
    } catch (err) {
      console.error('Ошибка при сохранении расхода:', err);
      error('Ошибка сохранения', 'Не удалось сохранить расход. Попробуйте еще раз.');
      throw err;
    }
  };

  // Обработчик закрытия модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  if (isInitialLoading) {
    return (
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-dark dark:text-white">Загрузка расходов...</span>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-dark dark:text-white">
              Расходы
            </h2>
            <p className="mt-1 text-sm text-[#64748B] dark:text-gray-400">
              Управление расходами компании
            </p>
          </div>
          <button
            onClick={handleCreateExpense}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isLoading ? 'Сохранение...' : 'Новый расход'}
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ExpenseStats 
            totalAmount={stats.totalAmount}
            totalCount={stats.totalCount}
          />
        </motion.div>

        {/* Simple Expense Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-dark rounded-lg shadow-sm border border-stroke dark:border-dark-3"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-2 dark:bg-dark-2">
                  <th className="py-4 px-6 text-left font-medium text-dark dark:text-white">
                    Дата
                  </th>
                  <th className="py-4 px-6 text-left font-medium text-dark dark:text-white">
                    Категория
                  </th>
                  <th className="py-4 px-6 text-left font-medium text-dark dark:text-white">
                    Описание
                  </th>
                  <th className="py-4 px-6 text-right font-medium text-dark dark:text-white">
                    Сумма
                  </th>
                  <th className="py-4 px-6 text-center font-medium text-dark dark:text-white">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      Расходы не найдены
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-stroke dark:border-dark-3">
                      <td className="py-4 px-6 text-dark dark:text-white">
                        {new Date(expense.date).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-dark dark:text-white">
                        {expense.description}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-dark dark:text-white">
                        {new Intl.NumberFormat('ru-RU', {
                          style: 'currency',
                          currency: 'RUB',
                          minimumFractionDigits: 0,
                        }).format(expense.amount)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            disabled={isLoading}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            disabled={isLoading}
                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Expense Modal */}
        <ExpenseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveExpense}
          editExpense={editingExpense}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          expense={deletingExpense}
          isLoading={deleteExpenseMutation.isPending}
        />
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
} 