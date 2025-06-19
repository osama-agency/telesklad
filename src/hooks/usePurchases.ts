import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del, queryKeys } from '@/lib/api';

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

// Основной хук для получения закупок
export function usePurchases(params: PurchasesParams = {}) {
  const queryParams = {
    ...params,
    page: params.page || 1,
    limit: params.limit || 10,
  };

  return useQuery({
    queryKey: queryKeys.purchasesList(queryParams),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      
      const endpoint = `/purchases?${searchParams.toString()}`;
      console.log('🔍 usePurchases: Making request to:', endpoint);
      
      try {
        const result = await get<any>(endpoint);
        console.log('✅ usePurchases: Received data:', result);
        
        // Проверяем новую структуру API с пагинацией
        if (result && result.purchases) {
          // Новая структура с пагинацией
          return result.purchases as Purchase[];
        } else if (Array.isArray(result)) {
          // Старая структура - просто массив
          return result as Purchase[];
        } else {
          console.warn('⚠️ Unexpected API response structure:', result);
          return [];
        }
      } catch (error) {
        console.error('❌ usePurchases: Error:', error);
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1 минута
    gcTime: 5 * 60 * 1000, // 5 минут в кэше
  });
}

// Получение одной закупки
export function usePurchase(id: number) {
  return useQuery({
    queryKey: queryKeys.purchase(id),
    queryFn: () => get<Purchase>(`/purchases/${id}`),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 минута
  });
}

// Мутация для создания закупки
export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseData: Partial<Purchase>) => post<Purchase>('/purchases', purchaseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases });
      // Также обновляем аналитику товаров
      queryClient.invalidateQueries({ queryKey: queryKeys.productsAnalytics() });
    },
  });
}

// Мутация для обновления закупки
export function useUpdatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Purchase> }) => 
      put<Purchase>(`/purchases/${id}`, data),
    onSuccess: (data, variables) => {
      // Обновляем кэш конкретной закупки
      queryClient.setQueryData(queryKeys.purchase(variables.id), data);
      // Перезагружаем список закупок
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases });
      // Обновляем аналитику товаров
      queryClient.invalidateQueries({ queryKey: queryKeys.productsAnalytics() });
    },
  });
}

// Мутация для удаления закупки
export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => del(`/purchases/${id}`),
    onSuccess: (_, id) => {
      // Удаляем из кэша конкретную закупку
      queryClient.removeQueries({ queryKey: queryKeys.purchase(id) });
      // Перезагружаем список закупок
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases });
      // Обновляем аналитику товаров
      queryClient.invalidateQueries({ queryKey: queryKeys.productsAnalytics() });
    },
  });
}

// Мутация для обновления статуса закупки
export function useUpdatePurchaseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Purchase['status'] }) => 
      put<Purchase>(`/purchases/${id}/status`, { status }),
    onSuccess: (data, variables) => {
      // Обновляем кэш конкретной закупки
      queryClient.setQueryData(queryKeys.purchase(variables.id), data);
      // Перезагружаем список закупок
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases });
      // Обновляем аналитику товаров
      queryClient.invalidateQueries({ queryKey: queryKeys.productsAnalytics() });
    },
  });
}

// Мутация для отправки закупки в Telegram
export function useSendPurchaseToTelegram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => post(`/purchases/${id}/send-telegram`, {}),
    onSuccess: (_, id) => {
      // Обновляем статус закупки на "ordered"
      queryClient.invalidateQueries({ queryKey: queryKeys.purchase(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases });
    },
  });
}

// Мутация для оприходования закупки
export function useReceivePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { 
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
    }) => post(`/purchases/${id}/receive`, data),
    onSuccess: (_, variables) => {
      // Обновляем кэш конкретной закупки
      queryClient.invalidateQueries({ queryKey: queryKeys.purchase(variables.id) });
      // Перезагружаем список закупок
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases });
      // Обновляем аналитику товаров
      queryClient.invalidateQueries({ queryKey: queryKeys.productsAnalytics() });
      // Обновляем расходы
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    },
  });
}

// Утилиты для работы со статусами
export const PURCHASE_STATUSES = {
  draft: '🗒️ Черновик',
  sent: '📤 Отправлено',
  awaiting_payment: '💳 Ожидает оплату',
  paid: '💰 Оплачено',
  in_transit: '🚚 В пути',
  received: '✅ Получено',
  cancelled: '❌ Отменено',
} as const;

export function getPurchaseStatusLabel(status: Purchase['status']): string {
  return PURCHASE_STATUSES[status] || status;
} 