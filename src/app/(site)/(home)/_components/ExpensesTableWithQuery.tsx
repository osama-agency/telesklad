"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useDateRange } from "@/context/DateRangeContext";

// Простой интерфейс для расходов
interface SimpleExpense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

// Моковые данные для демонстрации
const mockExpenses: SimpleExpense[] = [
  {
    id: 1,
    amount: 15000,
    category: "Офис",
    description: "Аренда помещения",
    date: "2025-06-15"
  },
  {
    id: 2,
    amount: 8500,
    category: "Транспорт",
    description: "Доставка товаров",
    date: "2025-06-14"
  },
  {
    id: 3,
    amount: 3200,
    category: "Коммунальные",
    description: "Электричество",
    date: "2025-06-13"
  },
  {
    id: 4,
    amount: 12000,
    category: "Маркетинг",
    description: "Реклама в соцсетях",
    date: "2025-06-12"
  },
  {
    id: 5,
    amount: 6800,
    category: "Офис",
    description: "Канцелярские товары",
    date: "2025-06-11"
  }
];

// Простой компонент статистики
const ExpenseStats = ({ totalAmount, totalCount }: { totalAmount: number; totalCount: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300 hover:scale-105">
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

    <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300 hover:scale-105">
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

    <div className="bg-container rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300 hover:scale-105">
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
  const [expenses] = useState<SimpleExpense[]>(mockExpenses);
  const [isLoading] = useState(false);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A6DFF]"></div>
        <span className="ml-3 text-[#64748B] dark:text-gray-300">Загрузка расходов...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B] dark:text-white">
            Расходы
          </h2>
          <p className="mt-1 text-sm text-[#64748B] dark:text-gray-400">
            Управление расходами компании
          </p>
        </div>
        <button
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 disabled:opacity-50"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Новый расход
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

      {/* Expense Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-container rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
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
              {expenses.map((expense, index) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
                >
                  <td className="py-4 px-6 text-[#64748B] dark:text-gray-400">
                    {formatDate(expense.date)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[#1E293B] dark:text-white">
                    {expense.description}
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-red-600 dark:text-red-400">
                    ₽{expense.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-[#1A6DFF] hover:text-[#00C5FF] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 text-red-500 hover:text-red-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {expenses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#1E293B] dark:text-white mb-2">
              Расходы не найдены
            </h3>
            <p className="text-[#64748B] dark:text-gray-400">
              Начните добавлять расходы для их отслеживания
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
} 