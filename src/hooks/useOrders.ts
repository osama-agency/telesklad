import { useState, useEffect, useCallback } from 'react';
import { useDateRange } from '@/context/DateRangeContext';
import { Order, OrderFilters, SyncResult } from '@/types/order';

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

export function useOrders(options: UseOrdersOptions = {}) {
  const { dateRange } = useDateRange();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<OrdersResponse['pagination'] | null>(null);
  const [stats, setStats] = useState<OrdersResponse['stats'] | null>(null);
  const [filters, setFilters] = useState<Partial<OrderFilters>>(options.initialFilters || {});

  const {
    page = 1,
    limit = 25,
    sortBy = 'orderDate',
    sortOrder = 'desc',
    autoRefresh = true,
  } = options;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      // Добавляем параметры даты
      if (dateRange.from) {
        params.append('from', dateRange.from.toISOString());
      }
      if (dateRange.to) {
        params.append('to', dateRange.to.toISOString());
      }

      // Добавляем фильтры
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/orders?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OrdersResponse = await response.json();
      
      setOrders(data.orders);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, filters, page, limit, sortBy, sortOrder]);

  // Автоматическое обновление при изменении даты
  useEffect(() => {
    if (autoRefresh) {
      fetchOrders();
    }
  }, [fetchOrders, autoRefresh]);

  // Синхронизация с внешним API
  const syncOrders = useCallback(async (): Promise<SyncResult | null> => {
    try {
      const response = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SyncResult = await response.json();
      
      // После синхронизации обновляем список заказов
      if (result.ordersCreated > 0 || result.ordersUpdated > 0) {
        await fetchOrders();
      }

      return result;
    } catch (err) {
      console.error('Error syncing orders:', err);
      return null;
    }
  }, [fetchOrders]);

  // Получение статуса синхронизации
  const getSyncStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/orders/sync');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error getting sync status:', err);
      return null;
    }
  }, []);

  // Обновление фильтров
  const updateFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Очистка фильтров
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Поиск заказов
  const searchOrders = useCallback((searchTerm: string) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  // Фильтрация по статусу
  const filterByStatus = useCallback((status: string) => {
    updateFilters({ status: status === 'all' ? undefined : status });
  }, [updateFilters]);

  return {
    // Данные
    orders,
    pagination,
    stats,
    loading,
    error,
    filters,

    // Методы
    fetchOrders,
    syncOrders,
    getSyncStatus,
    updateFilters,
    clearFilters,
    searchOrders,
    filterByStatus,

    // Вспомогательные значения
    hasOrders: orders.length > 0,
    totalOrders: pagination?.totalCount || 0,
    isFiltered: Object.keys(filters).length > 0,
  };
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