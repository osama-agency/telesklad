import { useState, useEffect, useCallback } from 'react';
import { useDateRange } from '@/context/DateRangeContext';
import { Order, OrderFilters, SyncResult } from '@/types/order';
import { get, post, put, del, PaginatedResponse } from '@/lib/api';
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
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    phone_number: string;
    username?: string;
    full_name: string;
    address?: string;
    street?: string;
    home?: string;
    build?: string;
    apartment?: string;
    postal_code?: number;
  };
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

interface UseOrdersQueryResult {
  data: OrdersApiResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseMutationResult<T, V> {
  mutate: (variables: V) => Promise<T>;
  isLoading: boolean;
  error: string | null;
}

// Основной хук для получения заказов
export function useOrdersQuery(params: OrdersParams = {}): UseOrdersQueryResult & {
  removeOrderOptimistically: (id: number) => void;
} {
  const [data, setData] = useState<OrdersApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      
      const result = await get<OrdersApiResponse>(`/orders?${searchParams.toString()}`);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(queryParams)]);

  const removeOrderOptimistically = useCallback((id: number) => {
    setData(prevData => {
      if (!prevData) return prevData;
      
      const filteredOrders = prevData.orders.filter(order => order.id !== id);
      
      return {
        ...prevData,
        orders: filteredOrders,
        pagination: {
          ...prevData.pagination,
          totalCount: prevData.pagination.totalCount - 1
        }
      };
    });
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchOrders,
    removeOrderOptimistically,
  };
}

interface UseOrderQueryResult {
  data: OrderEntity | null;
  isLoading: boolean;
  error: string | null;
}

// Получение одного заказа
export function useOrderQuery(id: number): UseOrderQueryResult {
  const [data, setData] = useState<OrderEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await get<OrderEntity>(`/orders/${id}`);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  return { data, isLoading, error };
}

// Мутация для создания заказа
export function useCreateOrder(): UseMutationResult<OrderEntity, Partial<OrderEntity>> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (orderData: Partial<OrderEntity>) => {
    try {
      setIsLoading(true);
      setError(null);
      return await post<OrderEntity>('/orders', orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

// Мутация для обновления заказа
export function useUpdateOrder(): UseMutationResult<OrderEntity, { id: number; data: Partial<OrderEntity> }> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ id, data }: { id: number; data: Partial<OrderEntity> }) => {
    try {
      setIsLoading(true);
      setError(null);
      return await put<OrderEntity>(`/orders/${id}`, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

// Мутация для удаления заказа
export function useDeleteOrder(): UseMutationResult<void, number> & { 
  mutateOptimistic: (id: number, onOptimisticUpdate?: (id: number) => void) => Promise<void>;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await del(`/orders/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutateOptimistic = useCallback(async (
    id: number, 
    onOptimisticUpdate?: (id: number) => void
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Сначала выполняем оптимистичное обновление UI
      if (onOptimisticUpdate) {
        onOptimisticUpdate(id);
      }
      
      // Затем отправляем запрос на сервер
      await del(`/orders/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, mutateOptimistic, isLoading, error };
}

// Хук для массового удаления заказов
export function useBulkDeleteOrders(): UseMutationResult<{ deletedCount: number; message: string }, number[]> & {
  mutateOptimistic: (ids: number[], onOptimisticUpdate?: (ids: number[]) => void) => Promise<{ deletedCount: number; message: string }>;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (orderIds: number[]): Promise<{ deletedCount: number; message: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 Sending bulk delete request with IDs:', orderIds);
      
      const response = await fetch('/api/orders/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении заказов');
      }

      const result = await response.json();
      return {
        deletedCount: result.deletedCount,
        message: result.message
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutateOptimistic = useCallback(async (
    orderIds: number[], 
    onOptimisticUpdate?: (ids: number[]) => void
  ): Promise<{ deletedCount: number; message: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Сначала оптимистично обновляем UI
      if (onOptimisticUpdate) {
        onOptimisticUpdate(orderIds);
      }
      
      // Затем выполняем запрос
      return await mutate(orderIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mutate]);

  return { mutate, mutateOptimistic, isLoading, error };
}

// Хук для обновления статуса заказа
export function useUpdateOrderStatus(): UseMutationResult<OrderEntity, { id: number; status: number }> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ id, status }: { id: number; status: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      return await put<OrderEntity>(`/orders/${id}/status`, { status });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
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

interface UseCitiesResult {
  data: { cities: { value: string; label: string; count: number }[] } | null;
  isLoading: boolean;
  error: string | null;
}

// Хук для получения городов
export function useCities(): UseCitiesResult {
  const [data, setData] = useState<{ cities: { value: string; label: string; count: number }[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await get<{ cities: { value: string; label: string; count: number }[] }>('/orders/cities');
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, []);

  return { data, isLoading, error };
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