"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useDateRange } from "@/context/DateRangeContext";
import { AddExpenseModal } from "@/components/Modals/AddExpenseModal";
import { EditExpenseModal } from "@/components/Modals/EditExpenseModal";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

// Интерфейс для расходов
interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

// Простой компонент статистики
const ExpenseStats = ({ totalAmount, totalCount }: { totalAmount: number; totalCount: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300 hover:scale-105">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white">
            ₽{totalAmount.toLocaleString()}
          </h3>
          <p className="text-sm text-[#64748B] dark:text-gray-400">Общие расходы</p>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300 hover:scale-105">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white">
            {totalCount}
          </h3>
          <p className="text-sm text-[#64748B] dark:text-gray-400">Всего записей</p>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300 hover:scale-105">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white">
            ₽{totalCount > 0 ? Math.round(totalAmount / totalCount).toLocaleString() : 0}
          </h3>
          <p className="text-sm text-[#64748B] dark:text-gray-400">Средний расход</p>
        </div>
      </div>
    </div>
  </div>
);

export function ExpensesTable() {
  const { dateRange } = useDateRange();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  
  // Toast notifications
  const toast = useToast();

  // Загрузка расходов
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) {
        params.append('from', typeof dateRange.from === 'string' ? dateRange.from : dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange.to) {
        params.append('to', typeof dateRange.to === 'string' ? dateRange.to : dateRange.to.toISOString().split('T')[0]);
      }

      const response = await fetch(`/api/expenses?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data || []);
      } else {
        console.error('Failed to fetch expenses');
        setExpenses([]);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.from, dateRange.to]);

  // Загружаем данные при монтировании и изменении фильтров
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Подсчет статистики
  const stats = useMemo(() => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalCount = expenses.length;
    return { totalAmount, totalCount };
  }, [expenses]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Обработчики модалов
  const handleAddExpense = async (expenseData: {
    date: string;
    category: string;
    description: string;
    amount: number;
  }) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      if (response.ok) {
        await fetchExpenses(); // Перезагружаем данные
        toast.success('Расход успешно создан');
      } else {
        throw new Error('Failed to create expense');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Ошибка при создании расхода');
      throw error;
    }
  };

  const handleEditExpense = async (expense: Expense) => {
    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: expense.date,
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
        }),
      });

      if (response.ok) {
        await fetchExpenses(); // Перезагружаем данные
        toast.success('Расход успешно обновлен');
      } else {
        throw new Error('Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Ошибка при обновлении расхода');
      throw error;
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchExpenses(); // Перезагружаем данные
        toast.success('Расход успешно удален');
      } else {
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Ошибка при удалении расхода');
      throw error;
    }
  };

  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  const handleDeleteClick = (expense: Expense) => {
    if (window.confirm(`Вы уверены, что хотите удалить расход "${expense.description}"?\n\nЭто действие нельзя отменить.`)) {
      setDeletingExpenseId(expense.id);
      handleDeleteExpense(expense.id).finally(() => {
        setDeletingExpenseId(null);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A6DFF]"></div>
        <span className="ml-3 text-[#64748B] dark:text-gray-300">Загрузка расходов...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ExpenseStats 
            totalAmount={stats.totalAmount}
            totalCount={stats.totalCount}
          />
        </motion.div>

        {/* Add Expense Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-end"
        >
          <button
            onClick={() => setShowAddModal(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Новый расход
          </button>
        </motion.div>

        {/* Expense Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6 text-left font-medium text-[#1E293B] dark:text-white">
                    Дата
                  </th>
                  <th className="py-4 px-6 text-left font-medium text-[#1E293B] dark:text-white">
                    Категория
                  </th>
                  <th className="py-4 px-6 text-left font-medium text-[#1E293B] dark:text-white">
                    Описание
                  </th>
                  <th className="py-4 px-6 text-right font-medium text-[#1E293B] dark:text-white">
                    Сумма
                  </th>
                  <th className="py-4 px-6 text-center font-medium text-[#1E293B] dark:text-white">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[#64748B] dark:text-gray-400">Расходы не найдены</p>
                          <p className="text-sm text-[#64748B] dark:text-gray-500">Создайте первый расход, нажав кнопку выше</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense, index) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-4 px-6 text-[#64748B] dark:text-gray-300">
                        {formatDate(expense.date)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#1E293B] dark:text-white font-medium">
                        {expense.description}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-red-600 dark:text-red-400">
                        ₽{expense.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(expense)}
                            className="p-2 text-[#64748B] dark:text-gray-400 hover:text-[#1A6DFF] dark:hover:text-[#1A6DFF] transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Редактировать"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteClick(expense)}
                            disabled={deletingExpenseId === expense.id}
                            className="p-2 text-[#64748B] dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                            title="Удалить"
                          >
                            {deletingExpenseId === expense.id ? (
                              <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modals */}
        <AddExpenseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddExpense}
        />

        <EditExpenseModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          expense={selectedExpense}
        />
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </>
  );
} 