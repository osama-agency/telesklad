"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PencilSquareIcon, TrashIcon } from "@/assets/icons";

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
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-[#1F2937] dark:shadow-card">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 text-6xl">📭</div>
          <h3 className="mb-2 text-lg font-semibold text-dark dark:text-[#F9FAFB]">
            Нет данных о расходах
          </h3>
          <p className="text-center text-body-sm text-dark-5 dark:text-[#94A3B8]">
            Добавьте первый расход, чтобы начать отслеживание
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-[#1F2937] dark:shadow-card">
      {/* Таблица */}
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] font-semibold text-dark dark:text-[#F9FAFB]">
                Дата
              </TableHead>
              <TableHead className="font-semibold text-dark dark:text-[#F9FAFB]">
                Категория
              </TableHead>
              <TableHead className="font-semibold text-dark dark:text-[#F9FAFB]">
                Описание
              </TableHead>
              <TableHead className="w-[130px] text-right font-semibold text-dark dark:text-[#F9FAFB]">
                Сумма
              </TableHead>
              <TableHead className="w-[100px] text-center font-semibold text-dark dark:text-[#F9FAFB]">
                Действия
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="text-dark-5 dark:text-[#94A3B8]">
                  {formatDate(expense.date)}
                </TableCell>
                <TableCell className="font-medium text-dark dark:text-[#F9FAFB]">
                  {expense.category}
                </TableCell>
                <TableCell className="text-dark-5 dark:text-[#94A3B8]">
                  {expense.description}
                </TableCell>
                <TableCell className="text-right font-semibold text-dark dark:text-[#F9FAFB]">
                  {formatAmount(expense.amount)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(expense)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                      title="Редактировать"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20"
                      title="Удалить"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="border-t border-stroke px-6 py-4 dark:border-[#334155]">
          <div className="flex items-center justify-between">
            <div className="text-body-sm text-dark-5 dark:text-[#94A3B8]">
              Показано {startIndex + 1}—{Math.min(endIndex, expenses.length)} из {expenses.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke bg-white text-dark transition-colors hover:bg-gray-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#334155] dark:bg-[#1F2937] dark:text-[#F9FAFB] dark:hover:bg-[#374151]"
              >
                ‹
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-primary text-white"
                      : "border border-stroke bg-white text-dark hover:bg-gray-2 dark:border-[#334155] dark:bg-[#1F2937] dark:text-[#F9FAFB] dark:hover:bg-[#374151]"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke bg-white text-dark transition-colors hover:bg-gray-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#334155] dark:bg-[#1F2937] dark:text-[#F9FAFB] dark:hover:bg-[#374151]"
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