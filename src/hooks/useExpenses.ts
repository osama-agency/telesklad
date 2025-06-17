import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del, queryKeys } from '@/lib/api';

// Типы для расходов
export interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpensesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ExpensesStats {
  totalAmount: number;
  totalCount: number;
  categorySums: Record<string, number>;
  monthlyTotals: Record<string, number>;
}

// Основной хук для получения расходов
export function useExpenses(params: ExpensesParams = {}) {
  const queryParams = {
    ...params,
    page: params.page || 1,
    limit: params.limit || 25,
  };

  return useQuery({
    queryKey: queryKeys.expensesList(queryParams),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      
      return get<Expense[]>(`/expenses?${searchParams.toString()}`);
    },
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 10 * 60 * 1000, // 10 минут в кэше
  });
}

// Получение одного расхода
export function useExpense(id: number) {
  return useQuery({
    queryKey: queryKeys.expense(id),
    queryFn: () => get<Expense>(`/expenses/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

// Получение статистики расходов
export function useExpensesStats(params: ExpensesParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.expenses, 'stats', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      
      return get<ExpensesStats>(`/expenses/stats?${searchParams.toString()}`);
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 15 * 60 * 1000, // 15 минут в кэше
  });
}

// Мутация для создания расхода
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => 
      post<Expense>('/expenses', expenseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    },
  });
}

// Мутация для обновления расхода
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { 
      id: number; 
      data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> 
    }) => put<Expense>(`/expenses/${id}`, data),
    onSuccess: (data, variables) => {
      // Обновляем кэш конкретного расхода
      queryClient.setQueryData(queryKeys.expense(variables.id), data);
      // Перезагружаем список расходов
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    },
  });
}

// Мутация для удаления расхода
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => del(`/expenses/${id}`),
    onSuccess: (_, id) => {
      // Удаляем из кэша конкретный расход
      queryClient.removeQueries({ queryKey: queryKeys.expense(id) });
      // Перезагружаем список расходов
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    },
  });
}

// Мутация для массового удаления расходов
export function useBulkDeleteExpenses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => post('/expenses/bulk-delete', { ids }),
    onSuccess: (_, ids) => {
      // Удаляем из кэша конкретные расходы
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: queryKeys.expense(id) });
      });
      // Перезагружаем список расходов
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    },
  });
}

// Хук для получения категорий расходов
export function useExpenseCategories() {
  return useQuery({
    queryKey: [...queryKeys.expenses, 'categories'],
    queryFn: () => get<string[]>('/expenses/categories'),
    staleTime: 30 * 60 * 1000, // 30 минут для справочника категорий
    gcTime: 60 * 60 * 1000, // 1 час в кэше
  });
}

// Утилиты для форматирования
export function formatExpenseAmount(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatExpenseDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Константы для категорий расходов (можно использовать как fallback)
export const DEFAULT_EXPENSE_CATEGORIES = [
  'Аренда',
  'Коммунальные услуги',
  'Зарплата',
  'Маркетинг',
  'Офисные расходы',
  'Транспорт',
  'Связь',
  'Программное обеспечение',
  'Налоги',
  'Прочее',
] as const; 