import { useState, useEffect, useCallback } from 'react';
import { get, post, put, del } from '@/lib/api';

// Типы для закупок
export interface Purchase {
  id: number;
  totalAmount: number;
  isUrgent: boolean;
  expenses?: number;
  status: "draft" | "sent" | "awaiting_payment" | "paid" | "in_transit" | "received" | "cancelled";
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  id: number;
  productId: number;
  quantity: number;
  costPrice: number;
  total: number;
  productName?: string; // Добавляем поле productName из API
  product?: {
    id: number;
    name: string;
  };
}

export interface PurchasesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  period?: string;
  productId?: number;
}

interface UsePurchasesResult {
  data: Purchase[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Основной хук для получения закупок
export function usePurchases(params: PurchasesParams = {}): UsePurchasesResult {
  const [data, setData] = useState<Purchase[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryParams = {
    ...params,
    page: params.page || 1,
    limit: params.limit || 10,
  };

  const fetchPurchases = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      
      const endpoint = `/purchases?${searchParams.toString()}`;
      console.log('🔍 usePurchases: Making request to:', endpoint);
      
      const result = await get<any>(endpoint);
      console.log('✅ usePurchases: Received data:', result);
      
      // Проверяем новую структуру API с пагинацией
      if (result && result.purchases) {
        // Новая структура с пагинацией
        setData(result.purchases as Purchase[]);
      } else if (Array.isArray(result)) {
        // Старая структура - просто массив
        setData(result as Purchase[]);
      } else {
        console.warn('⚠️ Unexpected API response structure:', result);
        setData([]);
      }
    } catch (err) {
      console.error('❌ usePurchases: Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(queryParams)]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchPurchases,
  };
}

interface UsePurchaseResult {
  data: Purchase | null;
  isLoading: boolean;
  error: string | null;
}

// Получение одной закупки
export function usePurchase(id: number): UsePurchaseResult {
  const [data, setData] = useState<Purchase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPurchase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await get<Purchase>(`/purchases/${id}`);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchase();
  }, [id]);

  return { data, isLoading, error };
}

interface UseMutationResult<T, V> {
  mutate: (variables: V) => Promise<T>;
  isLoading: boolean;
  error: string | null;
}

// Мутация для создания закупки
export function useCreatePurchase(): UseMutationResult<Purchase, Partial<Purchase>> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (purchaseData: Partial<Purchase>) => {
    try {
      setIsLoading(true);
      setError(null);
      return await post<Purchase>('/purchases', purchaseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

// Мутация для обновления закупки
export function useUpdatePurchase(): UseMutationResult<Purchase, { id: number; data: Partial<Purchase> }> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ id, data }: { id: number; data: Partial<Purchase> }) => {
    try {
      setIsLoading(true);
      setError(null);
      return await put<Purchase>(`/purchases/${id}`, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

// Мутация для удаления закупки
export function useDeletePurchase(): UseMutationResult<void, number> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await del(`/purchases/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

// Мутация для обновления статуса закупки
export function useUpdatePurchaseStatus(): UseMutationResult<Purchase, { id: number; status: Purchase['status'] }> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ id, status }: { id: number; status: Purchase['status'] }) => {
    try {
      setIsLoading(true);
      setError(null);
      return await put<Purchase>(`/purchases/${id}/status`, { status });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

// Мутация для отправки закупки в Telegram
export function useSendPurchaseToTelegram(): UseMutationResult<void, number> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await post(`/purchases/${id}/send-telegram`, {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

// Мутация для оприходования закупки
export function useReceivePurchase(): UseMutationResult<void, { 
  id: number; 
  data: {
    items: Array<{
      id: number;
      receivedQuantity: number;
    }>;
    logisticsExpense?: number;
    receivedAt: string;
    notes?: string;
  };
}> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ id, data }: { 
    id: number; 
    data: {
      items: Array<{
        id: number;
        receivedQuantity: number;
      }>;
      logisticsExpense?: number;
      receivedAt: string;
      notes?: string;
    };
  }): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await post(`/purchases/${id}/receive`, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function getPurchaseStatusLabel(status: Purchase['status']): string {
  const statusLabels: Record<Purchase['status'], string> = {
    'draft': 'Черновик',
    'sent': 'Отправлена',
    'awaiting_payment': 'Ожидает оплаты',
    'paid': 'Оплачена',
    'in_transit': 'В пути',
    'received': 'Получена',
    'cancelled': 'Отменена',
  };
  
  return statusLabels[status] || status;
} 