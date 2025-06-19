'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDateRange, getDateRangeParams } from '@/context/DateRangeContext';

interface UseDateFilteredDataOptions {
  endpoint: string;
  dependencies?: any[];
}

export function useDateFilteredData<T>(options: UseDateFilteredDataOptions) {
  const { endpoint, dependencies = [] } = options;
  const { dateRange } = useDateRange();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const dateParams = getDateRangeParams(dateRange);
      const queryParams = new URLSearchParams();
      
      // Добавляем только существующие параметры
      Object.entries(dateParams).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error(`Error fetching data from ${endpoint}:`, err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, dateRange, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// Специализированные хуки для конкретных сущностей
export function useExpenses() {
  return useDateFilteredData<any>({
    endpoint: '/api/expenses'
  });
}

export function useProducts() {
  return useDateFilteredData({
    endpoint: '/api/products'
  });
}

export function usePurchases() {
  return useDateFilteredData({
    endpoint: '/api/purchases'
  });
} 