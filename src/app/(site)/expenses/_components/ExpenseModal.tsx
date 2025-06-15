"use client";

import { useState, useEffect } from "react";

interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  editExpense?: Expense | null;
}

const categories = [
  "Реклама",
  "Логистика",
  "Прочее"
];

const ExpenseModal = ({ isOpen, onClose, onSave, editExpense }: ExpenseModalProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editExpense) {
      setFormData({
        date: editExpense.date,
        category: editExpense.category,
        description: editExpense.description,
        amount: editExpense.amount.toString()
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: ''
      });
    }
  }, [editExpense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const expenseData = {
        date: formData.date,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount)
      };

      await onSave(expenseData);
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении расхода:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = formData.category && formData.description && formData.amount && parseFloat(formData.amount) > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <h2 className="text-xl font-semibold text-[#1E293B] dark:text-white flex items-center gap-2">
            <svg className="h-6 w-6 text-[#1A6DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {editExpense ? 'Редактировать расход' : 'Новый расход'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Date */}
            <div>
              <label htmlFor="date" className="mb-2 block text-sm font-medium text-[#1E293B] dark:text-gray-300">
                Дата <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="mb-2 block text-sm font-medium text-[#1E293B] dark:text-gray-300">
                Категория <span className="text-rose-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="mb-2 block text-sm font-medium text-[#1E293B] dark:text-gray-300">
                Сумма (₽) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-[#1E293B] dark:text-gray-300">
                Описание <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Опишите расход..."
                rows={3}
                required
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-medium text-[#64748B] dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="flex-1 rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Сохранение...</span>
                </div>
              ) : (
                <span>{editExpense ? 'Обновить' : 'Сохранить'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal; 