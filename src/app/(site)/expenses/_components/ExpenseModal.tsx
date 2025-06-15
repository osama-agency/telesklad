"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { CloseIcon } from "@/assets/icons";

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

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className="max-h-fit w-full max-w-[500px] rounded-[15px] bg-white p-8 shadow-3 dark:bg-[#1F2937] dark:shadow-card"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-dark dark:text-[#F9FAFB]">
          {editExpense ? 'Редактировать расход' : 'Новый расход'}
        </h3>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-2 text-dark transition-colors hover:bg-gray-3 dark:bg-[#374151] dark:text-[#F9FAFB] dark:hover:bg-[#4B5563]"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Дата */}
        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-medium text-dark dark:text-[#F9FAFB]">
            Дата <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="focus:ring-gradient w-full rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 text-dark outline-none transition disabled:cursor-default disabled:bg-gray-2 dark:border-[#334155] dark:bg-[#374151] dark:text-[#F9FAFB] dark:disabled:bg-[#4B5563]"
          />
        </div>

        {/* Категория */}
        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-medium text-dark dark:text-[#F9FAFB]">
            Категория <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="focus:ring-gradient w-full rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 text-dark outline-none transition disabled:cursor-default disabled:bg-gray-2 dark:border-[#334155] dark:bg-[#374151] dark:text-[#F9FAFB] dark:disabled:bg-[#4B5563]"
          >
            <option value="">Выберите категорию</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Сумма */}
        <div>
          <label htmlFor="amount" className="mb-2 block text-sm font-medium text-dark dark:text-[#F9FAFB]">
            Сумма (₽) <span className="text-red-500">*</span>
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
            className="focus:ring-gradient w-full rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 text-dark outline-none transition disabled:cursor-default disabled:bg-gray-2 dark:border-[#334155] dark:bg-[#374151] dark:text-[#F9FAFB] dark:disabled:bg-[#4B5563]"
          />
        </div>

        {/* Описание */}
        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-dark dark:text-[#F9FAFB]">
            Описание <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Опишите расход..."
            rows={3}
            required
            className="focus:ring-gradient w-full rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 text-dark outline-none transition disabled:cursor-default disabled:bg-gray-2 dark:border-[#334155] dark:bg-[#374151] dark:text-[#F9FAFB] dark:disabled:bg-[#4B5563]"
          />
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[7px] border border-stroke bg-gray-2 px-4 py-2.5 text-center font-medium text-dark transition hover:border-gray-3 hover:bg-gray-3 dark:border-[#334155] dark:bg-[#374151] dark:text-[#F9FAFB] dark:hover:border-[#4B5563] dark:hover:bg-[#4B5563]"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="flex-1 rounded-[7px] bg-primary px-4 py-2.5 text-center font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseModal; 