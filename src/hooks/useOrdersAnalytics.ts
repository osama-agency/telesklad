import { useState, useEffect, useCallback } from 'react';
import { get, PaginatedResponse } from '@/lib/api';
import { OrderEntity } from './useOrders';

interface OrdersAnalyticsStats {
  totalRevenue: number;
  averageOrderValue: number;
  totalDeliveryCost: number;
  totalBonus: number;
  uniqueCities: number;
  ordersWithTracking: number;
  paidOrders: number;
  shippedOrders: number;
  cityDistribution: Record<string, number>;
}

interface OrdersAnalyticsResponse {
  orders: OrderEntity[];
  pagination: any;
  stats: OrdersAnalyticsStats;
}

export function useOrdersAnalytics() {
  const [stats, setStats] = useState<OrdersAnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Запрашиваем только 1 элемент, чтобы получить только статистику без лишних данных
      const response = await get<OrdersAnalyticsResponse>('/orders?limit=1');
      setStats(response.stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить аналитику';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { stats, loading, error, refetch: fetchAnalytics };
} 