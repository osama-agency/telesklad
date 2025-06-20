import { useState, useEffect, useCallback } from 'react';
import { get, post, patch } from '@/lib/api';
import toast from 'react-hot-toast';

// Типы для продуктовой аналитики
export interface ProductAnalytics {
  id: number;
  name: string;
  brand: string;
  
  // ОСТАТКИ И ЗАПАСЫ
  currentStock: number;
  inTransitQuantity: number;
  totalAvailable: number;
  
  // СКОРОСТЬ ПРОДАЖ
  avgDailySales: number;
  daysUntilZero: number;
  stockStatus: 'critical' | 'low' | 'normal' | 'excess';
  
  // РЕКОМЕНДАЦИИ ПО ЗАКУПКАМ
  recommendedOrderQuantity: number;
  optimalStockLevel: number;
  
  // ФИНАНСОВЫЕ ПОКАЗАТЕЛИ
  avgPurchasePrice: number;
  avgpurchasepricetry: number;
  prime_cost: number;
  avgSalePrice: number;
  oldPrice?: number; // старая цена для отображения скидки
  profitMargin: number;
  profitMarginBasic: number;
  deliveryCostPerUnit: number;
  allocatedExpensesPerUnit: number;
  profitPerUnit: number;
  totalRealProfit: number;
  roi: number;
  
  // ДИНАМИКА И ТРЕНДЫ
  salesTrend: 'growing' | 'stable' | 'declining';
  salesVariability: 'stable' | 'moderate' | 'volatile';
  seasonalityFactor: number;
  
  // ABC/XYZ КЛАССИФИКАЦИЯ
  abcClass: 'A' | 'B' | 'C';
  xyzClass: 'X' | 'Y' | 'Z';
  
  // ПОКАЗАТЕЛИ ОБОРАЧИВАЕМОСТИ
  inventoryTurnover: number;
  avgInventoryValue: number;
  daysInInventory: number;
}

export interface AnalyticsResponse {
  products: ProductAnalytics[];
  summary: {
    totalProducts: number;
    criticalStock: number;
    lowStock: number;
    normalStock: number;
    excessStock: number;
    needsReorder: number;
    inTransitTotal: number;
    avgProfitMargin: number;
    totalExpensesAllocated: number;
    expensePerUnit: number;
  };
  period: {
    days: number;
    from: string;
    to: string;
  };
}

export interface CartItem {
  id: number;
  name: string;
  brand: string;
  quantity: number;
  costPrice: number;
  costPriceTRY: number;
}

export interface SimpleProduct {
  id: number;
  name: string;
  prime_cost?: number;
  avgpurchasepricerub?: number;
}

interface UseProductsAnalyticsResult {
  data: AnalyticsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Хук для получения аналитики товаров
export function useProductsAnalytics(period?: number): UseProductsAnalyticsResult {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await get<{ success: boolean; data: AnalyticsResponse }>(`/products/analytics${period ? `?period=${period}` : ''}`);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}

interface UseSimpleProductsResult {
  data: SimpleProduct[] | null;
  isLoading: boolean;
  error: string | null;
}

// Хук для получения простого списка товаров
export function useSimpleProducts(): UseSimpleProductsResult {
  const [data, setData] = useState<SimpleProduct[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await get<{ success: boolean; data: { products: SimpleProduct[] } }>('/products/simple');
        setData(response.data.products);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { data, isLoading, error };
}

interface UseMutationResult<T, V> {
  mutate: (variables: V) => Promise<T>;
  isLoading: boolean;
  error: string | null;
}

// Хук для создания закупки из корзины
export function useCreatePurchase(): UseMutationResult<void, {
  items: CartItem[];
  totalTRY: number;
  totalRUB: number;
  supplierName?: string;
  notes?: string;
}> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: {
    items: CartItem[];
    totalTRY: number;
    totalRUB: number;
    supplierName?: string;
    notes?: string;
  }): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await post('/purchases/create', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

interface UseExchangeRateResult {
  data: { rate: number; rateWithBuffer: number } | null;
  isLoading: boolean;
  error: string | null;
}

// Хук для получения курса валют
export function useExchangeRate(currency: string = 'TRY'): UseExchangeRateResult {
  const [data, setData] = useState<{ rate: number; rateWithBuffer: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await get<{ success: boolean; data: { rate: number; rateWithBuffer: number } }>(`/rates/latest?currency=${currency}`);
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRate();
  }, [currency]);

  return { data, isLoading, error };
}

// Хук для обновления товара (остатки, цены)
export function useUpdateProduct(): UseMutationResult<void, {
  id: number;
  data: Partial<Pick<ProductAnalytics, 'currentStock' | 'avgSalePrice' | 'oldPrice'>> & Record<string, any>;
  period?: number;
}> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ id, data }: {
    id: number;
    data: Partial<Pick<ProductAnalytics, 'currentStock' | 'avgSalePrice' | 'oldPrice'>> & Record<string, any>;
    period?: number;
  }): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await patch(`/products/${id}/update`, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
} 