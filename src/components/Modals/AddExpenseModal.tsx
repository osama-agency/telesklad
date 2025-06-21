"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: {
    date: string;
    category: string;
    description: string;
    amount: number;
  }) => Promise<void>;
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

export function AddExpenseModal({ isOpen, onClose, onAdd }: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: "",
    description: "",
    amount: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onAdd({
        date: formData.date,
        category: formData.category,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount)
      });
      
      // Сброс формы
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: "",
        description: "",
        amount: ""
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: "",
        description: "",
        amount: ""
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

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
              Новый расход
            </h2>
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
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Создание...
                  </div>
                ) : (
                  'Создать'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 