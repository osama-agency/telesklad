"use client";

import { useState, useMemo } from "react";
import ExpenseStats from "./ExpenseStats";
import ExpenseTable from "./ExpenseTable";
import ExpenseModal from "./ExpenseModal";
import { Expense } from "../types";
import { useExpenses } from "@/hooks/useDateFilteredData";



export default function ExpensesClient() {
  const { data: expenses, isLoading: isInitialLoading, refetch } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      const error = await response.json();
      throw new Error(error.error || 'Failed to create expense');
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
      const error = await response.json();
      throw new Error(error.error || 'Failed to update expense');
    }
    
    return response.json();
  };

  // Функция для удаления расхода через API
  const deleteExpenseAPI = async (id: number) => {
    const response = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete expense');
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

  // Обработчик удаления расхода
  const handleDeleteExpense = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот расход?')) {
      setIsLoading(true);
      try {
        await deleteExpenseAPI(id);
        // Перезагружаем данные после удаления
        refetch();
      } catch (error) {
        console.error('Ошибка при удалении расхода:', error);
        alert('Ошибка при удалении расхода');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Обработчик сохранения расхода
  const handleSaveExpense = async (expenseData: Omit<Expense, 'id'>) => {
    setIsLoading(true);
    try {
      if (editingExpense) {
        // Редактирование существующего расхода
        await updateExpenseAPI(editingExpense.id, expenseData);
      } else {
        // Создание нового расхода
        await createExpenseAPI(expenseData);
      }
      // Перезагружаем данные после любой операции
      refetch();
    } catch (error) {
      console.error('Ошибка при сохранении расхода:', error);
      alert('Ошибка при сохранении расхода');
      throw error; // Чтобы модальное окно не закрылось
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
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Расходы
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-dark-5 dark:text-dark-6">Загрузка расходов...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Заголовок и кнопка */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-[#F9FAFB]">
          Расходы
        </h2>
        <button
          onClick={handleCreateExpense}
          disabled={isLoading}
          className="rounded-[7px] bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Новый расход
        </button>
      </div>

      {/* Статистические карточки */}
      <div className="mb-6">
        <ExpenseStats 
          totalAmount={stats.totalAmount}
          totalCount={stats.totalCount}
        />
      </div>

      {/* Таблица расходов */}
      <ExpenseTable
        expenses={expenses}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />

      {/* Модальное окно */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveExpense}
        editExpense={editingExpense}
      />
    </div>
  );
} 