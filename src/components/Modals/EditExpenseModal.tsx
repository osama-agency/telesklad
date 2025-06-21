"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (expense: Expense) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  expense: Expense | null;
}

const EXPENSE_CATEGORIES = [
  "Офис",
  "Транспорт", 
  "Коммунальные",
  "Маркетинг",
  "Оборудование",
  "Канцелярия",
  "Связь",
  "Программное обеспечение",
  "Консультации",
  "Прочее"
];

export function EditExpenseModal({ isOpen, onClose, onEdit, onDelete, expense }: EditExpenseModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    category: "",
    description: "",
    amount: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Заполняем форму данными при открытии модала
  useEffect(() => {
    if (expense && isOpen) {
      setFormData({
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount.toString()
      });
      setErrors({});
      setShowDeleteConfirm(false);
    }
  }, [expense, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = "Дата обязательна";
    }

    if (!formData.category) {
      newErrors.category = "Категория обязательна";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Описание обязательно";
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = "Сумма должна быть положительным числом";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expense || !validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onEdit({
        id: expense.id,
        date: formData.date,
        category: formData.category,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount)
      });
      
      onClose();
    } catch (error) {
      console.error('Error editing expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!expense) return;

    setIsLoading(true);
    try {
      await onDelete(expense.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setShowDeleteConfirm(false);
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-[#F8FAFC] dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1E293B] dark:text-white">
              Редактировать расход
            </h2>
            <div className="flex items-center gap-2">
              {/* Delete Button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Удалить расход"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              
              {/* Close Button */}
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 text-[#64748B] dark:text-gray-400 hover:text-[#1E293B] dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Удалить расход?
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    Расход "{expense.description}" будет удален безвозвратно.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Удаление...' : 'Удалить'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors disabled:opacity-50"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Дата
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-[#1E293B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all ${
                  errors.date 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-200 dark:border-gray-700 focus:border-[#1A6DFF]'
                }`}
                disabled={isLoading}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Категория
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-[#1E293B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all ${
                  errors.category 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-200 dark:border-gray-700 focus:border-[#1A6DFF]'
                }`}
                disabled={isLoading}
              >
                <option value="">Выберите категорию</option>
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Описание
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Введите описание расхода"
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-[#1E293B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all ${
                  errors.description 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-200 dark:border-gray-700 focus:border-[#1A6DFF]'
                }`}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Сумма (₽)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-[#1E293B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all ${
                  errors.amount 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-200 dark:border-gray-700 focus:border-[#1A6DFF]'
                }`}
                disabled={isLoading}
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-[#64748B] dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading || showDeleteConfirm}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Сохранение...
                  </div>
                ) : (
                  'Сохранить'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
