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
    uniqueCities: number;
    ordersWithTracking: number;
    paidOrders: number;
    shippedOrders: number;
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
  order_items?: {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: string;
    created_at: string;
    updated_at: string;
    productid: string;
    createdat: string;
    orderid: string;
    name: string;
    total: string;
    updatedat: string;
  }[];
}

export interface OrdersStats {
  totalOrders: number;
  totalAmount: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalDeliveryCost: number;
  totalBonus: number;
  uniqueCities: number;
  ordersWithTracking: number;
  paidOrders: number;
  shippedOrders: number;
  statusCounts: Record<number, number>;
}

export interface OrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: number;
  customerCity?: string;
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
    customerCity,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = params;

  const queryParams = {
    page,
    limit,
    search,
    status,
    customerCity,
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
  3: 'Готовим к отправке',
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

// Основной хук для страницы заказов
export function useOrders(options: UseOrdersOptions = {}) {
  const [filters, setFilters] = useState<{
    search?: string;
    status?: number;
    customercity?: string;
  }>({
    search: options.initialFilters?.search || '',
    status: options.initialFilters?.status,
    customercity: options.initialFilters?.customercity,
  });

  const { data, isLoading, error, refetch } = useOrdersQuery({
    page: options.page || 1,
    limit: options.limit || 25,
    search: filters.search,
    status: filters.status,
    customerCity: filters.customercity,
    sortBy: options.sortBy || 'created_at',
    sortOrder: options.sortOrder || 'desc',
  });

  const searchOrders = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  }, []);

  const filterByStatus = useCallback((status: string) => {
    setFilters(prev => ({ 
      ...prev, 
      status: status === 'all' ? undefined : parseInt(status)
    }));
  }, []);

  const filterByCity = useCallback((city: string) => {
    setFilters(prev => ({ 
      ...prev, 
      customercity: city === 'all' ? undefined : city
    }));
  }, []);

  // Преобразуем данные в формат, ожидаемый страницей
  const orders = data?.orders.map(order => ({
    id: order.id,
    externalId: order.externalid || `#${order.id}`,
    customerName: order.customername,
    customerEmail: order.customeremail,
    customerPhone: order.customerphone,
    customerCity: order.customercity,
    customerAddress: order.customeraddress,
    total: order.total_amount || order.total || 0,
    currency: order.currency || 'RUB',
    status: mapOrderStatus(order.status),
    createdAt: order.created_at || order.createdat,
    paidAt: order.paid_at || order.paidat,
    shippedAt: order.shipped_at || order.shippedat,
    trackingNumber: order.tracking_number,
    deliveryCost: order.deliverycost || 0,
    bonusUsed: order.bonus || 0,
    bankCard: order.bankcard,
    items: order.order_items?.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    })) || [],
  })) || [];

  return {
    orders,
    pagination: data?.pagination ? {
      ...data.pagination,
      limit: options.limit || 25
    } : null,
    stats: data?.stats ? {
      totalRevenue: data.stats.totalRevenue || 0,
      averageOrderValue: data.stats.averageOrderValue || 0,
      totalDeliveryCost: data.stats.totalDeliveryCost || 0,
      totalBonus: data.stats.totalBonus || 0,
      uniqueCities: data.stats.uniqueCities || 0,
      ordersWithTracking: data.stats.ordersWithTracking || 0,
      paidOrders: data.stats.paidOrders || 0,
      shippedOrders: data.stats.shippedOrders || 0,
    } : null,
    loading: isLoading,
    error: error as Error | null,
    searchOrders,
    filterByStatus,
    filterByCity,
  };
}

// Хук для получения городов
export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => get<{ cities: { value: string; label: string; count: number }[] }>('/orders/cities'),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });
}

// Маппинг числовых статусов в строковые
function mapOrderStatus(status: number): string {
  const statusMap: Record<number, string> = {
    1: 'pending',
    2: 'processing',
    3: 'processing',
    4: 'shipped',
    5: 'cancelled',
    6: 'refunded',
    7: 'overdue',
  };
  return statusMap[status] || 'pending';
} 