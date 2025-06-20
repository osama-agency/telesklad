import { useState, useEffect, useCallback } from 'react';
import { get, post, put, del } from '@/lib/api';

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

interface UseExpensesResult {
  data: Expense[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Основной хук для получения расходов
export function useExpenses(params: ExpensesParams = {}): UseExpensesResult {
  const [data, setData] = useState<Expense[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryParams = {
    ...params,
    page: params.page || 1,
    limit: params.limit || 25,
  };

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      
      const result = await get<Expense[]>(`/expenses?${searchParams.toString()}`);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(queryParams)]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchExpenses,
  };
}

interface UseExpenseResult {
  data: Expense | null;
  isLoading: boolean;
  error: string | null;
}

// Получение одного расхода
export function useExpense(id: number): UseExpenseResult {
  const [data, setData] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchExpense = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await get<Expense>(`/expenses/${id}`);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  return { data, isLoading, error };
}

interface UseExpensesStatsResult {
  data: ExpensesStats | null;
  isLoading: boolean;
  error: string | null;
}

// Получение статистики расходов
export function useExpensesStats(params: ExpensesParams = {}): UseExpensesStatsResult {
  const [data, setData] = useState<ExpensesStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(key, String(value));
          }
        });
        
        const result = await get<ExpensesStats>(`/expenses/stats?${searchParams.toString()}`);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [JSON.stringify(params)]);

  return { data, isLoading, error };
}

interface UseMutationResult<T, V> {
  mutate: (variables: V) => Promise<T>;
  isLoading: boolean;
  error: string | null;
}

// Мутация для создания расхода
export function useCreateExpense(): UseMutationResult<Expense, Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      return await post<Expense>('/expenses', expenseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

// Мутация для обновления расхода
export function useUpdateExpense(): UseMutationResult<Expense, { id: number; data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> }> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ id, data }: { id: number; data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> }) => {
    try {
      setIsLoading(true);
      setError(null);
      return await put<Expense>(`/expenses/${id}`, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

// Мутация для удаления расхода
export function useDeleteExpense(): UseMutationResult<void, number> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await del(`/expenses/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

// Мутация для массового удаления расходов
export function useBulkDeleteExpenses(): UseMutationResult<void, number[]> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (ids: number[]): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await post('/expenses/bulk-delete', { ids });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

interface UseExpenseCategoriesResult {
  data: string[] | null;
  isLoading: boolean;
  error: string | null;
}

// Хук для получения категорий расходов
export function useExpenseCategories(): UseExpenseCategoriesResult {
  const [data, setData] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await get<string[]>('/expenses/categories');
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { data, isLoading, error };
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