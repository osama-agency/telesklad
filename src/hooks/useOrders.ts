import { useState, useEffect, useCallback } from 'react';
import { useDateRange } from '@/context/DateRangeContext';
import { Order, OrderFilters, SyncResult } from '@/types/order';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del, queryKeys, PaginatedResponse } from '@/lib/api';
// ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
// import { useSession } from 'next-auth/react';

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    totalRevenue: number;
    averageOrderValue: number;
    totalDeliveryCost: number;
    totalBonus: number;
  };
}

interface UseOrdersOptions {
  initialFilters?: Partial<OrderFilters>;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  autoRefresh?: boolean;
}

// Типы для заказов
export interface OrderEntity {
  id: number;
  user_id: number | null;
  total_amount: number;
  status: number;
  created_at: string;
  updated_at: string;
  msg_id: string | null;
  tracking_number: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  has_delivery: boolean;
  bank_card_id: number | null;
  bonus: number;
  externalid: string | null;
  customername: string | null;
  customeremail: string | null;
  customerphone: string | null;
  currency: string | null;
  orderdate: string | null;
  bankcard: string | null;
  customercity: string | null;
  deliverycost: number | null;
  customeraddress: string | null;
  createdat: string | null;
  paidat: string | null;
  shippedat: string | null;
  total: number | null;
  updatedat: string | null;
}

export interface OrdersStats {
  totalOrders: number;
  totalAmount: number;
  averageOrderValue: number;
  statusCounts: Record<number, number>;
}

export interface OrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrdersApiResponse {
  orders: OrderEntity[];
  pagination: {
    page: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: OrdersStats;
}

// Основной хук для получения заказов
export function useOrdersQuery(params: OrdersParams = {}) {
  const {
    page = 1,
    limit = 25,
    search = '',
    status,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = params;

  const queryParams = {
    page,
    limit,
    search,
    status,
    sortBy,
    sortOrder
  };

  return useQuery({
    queryKey: queryKeys.ordersList(queryParams),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      
      return get<OrdersApiResponse>(`/orders?${searchParams.toString()}`);
    },
    staleTime: 30 * 1000, // 30 секунд для заказов (часто обновляемые данные)
    gcTime: 2 * 60 * 1000, // 2 минуты в кэше
  });
}

// Получение одного заказа
export function useOrderQuery(id: number) {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => get<OrderEntity>(`/orders/${id}`),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 минута
  });
}

// Мутация для создания заказа
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: Partial<OrderEntity>) => post<OrderEntity>('/orders', orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

// Мутация для обновления заказа
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<OrderEntity> }) => 
      put<OrderEntity>(`/orders/${id}`, data),
    onSuccess: (data, variables) => {
      // Обновляем кэш конкретного заказа
      queryClient.setQueryData(queryKeys.order(variables.id), data);
      // Перезагружаем список заказов
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

// Мутация для удаления заказа
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => del(`/orders/${id}`),
    onSuccess: (_, id) => {
      // Удаляем из кэша конкретный заказ
      queryClient.removeQueries({ queryKey: queryKeys.order(id) });
      // Перезагружаем список заказов
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

// Хук для обновления статуса заказа
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => 
      put<OrderEntity>(`/orders/${id}/status`, { status }),
    onSuccess: (data, variables) => {
      // Обновляем кэш конкретного заказа
      queryClient.setQueryData(queryKeys.order(variables.id), data);
      // Перезагружаем список заказов
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

// Утилиты для работы со статусами
export const ORDER_STATUSES = {
  1: 'Ожидает',
  2: 'На отправке', 
  3: 'Доставлен',
  4: 'Отправлен',
  5: 'Отменён',
  6: 'Возврат',
  7: 'Просрочен',
} as const;

export function getOrderStatusLabel(status: number): string {
  return ORDER_STATUSES[status as keyof typeof ORDER_STATUSES] || 'Неизвестно';
}

// Хук для получения одного заказа
export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  };
}

// Хук для статистики заказов
export function useOrderStats() {
  const { dateRange } = useDateRange();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: '1', // Нужна только статистика
      });

      // Добавляем параметры даты
      if (dateRange.from) {
        params.append('from', dateRange.from.toISOString());
      }
      if (dateRange.to) {
        params.append('to', dateRange.to.toISOString());
      }

      const response = await fetch(`/api/orders?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OrdersResponse = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order stats');
      console.error('Error fetching order stats:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
} 