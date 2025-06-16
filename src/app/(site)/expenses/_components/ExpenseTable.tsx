"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Типы данных
export interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
}

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

const ExpenseTable = ({ expenses, onEdit, onDelete }: ExpenseTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = expenses.slice(startIndex, endIndex);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  // Форматирование суммы
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₽';
  };

  // Если нет данных
  if (expenses.length === 0) {
    return (
      <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 rounded-full bg-gray-50 dark:bg-gray-700 p-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mb-1 text-sm font-medium text-[#1E293B] dark:text-white">
            Нет данных о расходах
          </h3>
          <p className="text-sm text-[#64748B] dark:text-gray-400">
            Добавьте первый расход, чтобы начать отслеживание
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white flex items-center gap-2">
          <svg className="h-5 w-5 text-[#1A6DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          История расходов
        </h3>
      </div>

      {/* Desktop Table - скрыта на мобильных */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 text-left">
              <th className="px-6 py-3 text-sm font-medium text-[#1E293B] dark:text-gray-300">
                Дата
              </th>
              <th className="px-6 py-3 text-sm font-medium text-[#1E293B] dark:text-gray-300">
                Категория
              </th>
              <th className="px-6 py-3 text-sm font-medium text-[#1E293B] dark:text-gray-300">
                Описание
              </th>
              <th className="px-6 py-3 text-sm font-medium text-[#1E293B] dark:text-gray-300 text-right">
                Сумма
              </th>
              <th className="px-6 py-3 text-sm font-medium text-[#1E293B] dark:text-gray-300 text-center">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {currentExpenses.map((expense, index) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-900"
                  }
                >
                  <td className="px-6 py-4 text-sm text-[#64748B] dark:text-gray-400">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[#1E293B] dark:text-white">
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748B] dark:text-gray-400">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-rose-600 dark:text-rose-400 text-right">
                    {formatAmount(expense.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(expense)}
                        className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#1A6DFF]"
                        title="Редактировать"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="rounded-lg p-2 text-gray-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600"
                        title="Удалить"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - показаны только на мобильных */}
      <div className="md:hidden space-y-4 p-4">
        <AnimatePresence>
          {currentExpenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#F8FAFC] dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Header с датой и категорией */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-[#64748B] dark:text-gray-400">
                    {formatDate(expense.date)}
                  </span>
                </div>
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  {expense.category}
                </span>
              </div>

              {/* Описание */}
              <div className="mb-3">
                <p className="text-[#1E293B] dark:text-white font-medium">
                  {expense.description}
                </p>
              </div>

              {/* Сумма и действия */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="font-bold text-lg text-rose-600 dark:text-rose-400">
                    {formatAmount(expense.amount)}
                  </span>
                </div>

                {/* Кнопки действий */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(expense)}
                    className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#1A6DFF]"
                    title="Редактировать"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="rounded-lg p-2 text-gray-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600"
                    title="Удалить"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[#64748B] dark:text-gray-400">
              Показано {startIndex + 1}—{Math.min(endIndex, expenses.length)} из {expenses.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-[#64748B] dark:text-gray-400 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? "bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white shadow-lg"
                      : "border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-[#64748B] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-[#64748B] dark:text-gray-400 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTable; 