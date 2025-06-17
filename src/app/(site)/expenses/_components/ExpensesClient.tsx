"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import ExpenseStats from "./ExpenseStats";
import ExpenseTable from "./ExpenseTable";
import ExpenseModal from "./ExpenseModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { ToastContainer, useToast } from "@/components/ui/toastNotification";
import { Expense } from "../types";
import { useExpenses } from "@/hooks/useDateFilteredData";

export default function ExpensesClient() {
  const { data: expenses, isLoading: isInitialLoading, refetch } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  // Подсчет статистики
  const stats = useMemo(() => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalCount = expenses.length;
    return { totalAmount, totalCount };
  }, [expenses]);

  // Функция для создания расхода через API
  const createExpenseAPI = async (expenseData: Omit<Expense, 'id'>) => {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create expense');
    }
    
    return response.json();
  };

  // Функция для обновления расхода через API
  const updateExpenseAPI = async (id: number, expenseData: Omit<Expense, 'id'>) => {
    const response = await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update expense');
    }
    
    return response.json();
  };

  // Функция для удаления расхода через API
  const deleteExpenseAPI = async (id: number) => {
    const response = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete expense');
    }
    
    return response.ok;
  };

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
    
      setIsLoading(true);
      try {
      await deleteExpenseAPI(deletingExpense.id);
        refetch();
      setIsDeleteModalOpen(false);
      setDeletingExpense(null);
      success('Расход удален', 'Расход успешно удален из системы');
    } catch (err) {
      console.error('Ошибка при удалении расхода:', err);
      error('Ошибка удаления', 'Не удалось удалить расход. Попробуйте еще раз.');
      } finally {
        setIsLoading(false);
      }
  };

  // Обработчик отмены удаления
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingExpense(null);
  };

  // Обработчик сохранения расхода
  const handleSaveExpense = async (expenseData: Omit<Expense, 'id'>) => {
    setIsLoading(true);
    try {
      if (editingExpense) {
        // Редактирование существующего расхода
        await updateExpenseAPI(editingExpense.id, expenseData);
        success('Расход обновлен', 'Изменения успешно сохранены');
      } else {
        // Создание нового расхода
        await createExpenseAPI(expenseData);
        success('Расход создан', 'Новый расход добавлен в систему');
      }
      // Перезагружаем данные после любой операции
      refetch();
    } catch (err) {
      console.error('Ошибка при сохранении расхода:', err);
      error('Ошибка сохранения', 'Не удалось сохранить расход. Попробуйте еще раз.');
      throw err; // Чтобы модальное окно не закрылось
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик закрытия модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  if (isInitialLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A6DFF] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] bg-clip-text text-transparent">
              Расходы
            </h1>
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
            Новый расход
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
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
      >
        <ExpenseTable
          expenses={expenses}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
        />
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
          isLoading={isLoading}
        />
    </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
} 