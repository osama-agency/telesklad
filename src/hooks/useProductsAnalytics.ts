import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, queryKeys } from '@/lib/api';
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
    needsReorder: number;
    inTransitTotal: number;
    avgProfitMargin: number;
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
  avgPurchasePriceRub?: number;
}

// Хук для получения аналитики товаров
export function useProductsAnalytics(period?: number) {
  return useQuery({
    queryKey: queryKeys.productsAnalytics(period),
    queryFn: () => get<{ success: boolean; data: AnalyticsResponse }>(`/products/analytics${period ? `?period=${period}` : ''}`),
    select: (data) => data.data, // Извлекаем только данные из success/data обертки
    staleTime: 2 * 60 * 1000, // 2 минуты для аналитики
    gcTime: 5 * 60 * 1000, // 5 минут в кэше
  });
}

// Хук для получения простого списка товаров
export function useSimpleProducts() {
  return useQuery({
    queryKey: queryKeys.productsSimple,
    queryFn: () => get<{ success: boolean; data: { products: SimpleProduct[] } }>('/products/simple'),
    select: (data) => data.data.products,
    staleTime: 10 * 60 * 1000, // 10 минут для справочника товаров
    gcTime: 30 * 60 * 1000, // 30 минут в кэше
  });
}

// Хук для создания закупки из корзины
export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      items: CartItem[];
      totalTRY: number;
      totalRUB: number;
      supplierName?: string;
      notes?: string;
    }) => post('/purchases/create', data),
    onSuccess: () => {
      // Инвалидируем кэш закупок
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases });
      // Обновляем аналитику товаров
      queryClient.invalidateQueries({ queryKey: queryKeys.productsAnalytics() });
    },
  });
}

// Хук для получения курса валют
export function useExchangeRate(currency: string = 'TRY') {
  return useQuery({
    queryKey: queryKeys.rateLatest(currency),
    queryFn: () => get<{ success: boolean; data: { rate: number; rateWithBuffer: number } }>(`/rates/latest?currency=${currency}`),
    select: (data) => data.data,
    staleTime: 60 * 60 * 1000, // 1 час
    gcTime: 2 * 60 * 60 * 1000, // 2 часа в кэше
  });
}

// Хук для обновления товара (остатки, цены)
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  type UpdateProductArgs = {
    id: number;
    data: Partial<Pick<ProductAnalytics, 'currentStock' | 'avgSalePrice' | 'oldPrice'>> & Record<string, any>;
    period?: number;
  };

  const updateProductMutation = useMutation<
    any, // server response type
    Error,
    UpdateProductArgs,
    { previousData?: AnalyticsResponse | ProductAnalytics[] | undefined }
  >({
    mutationFn: async ({ id, data }: UpdateProductArgs): Promise<any> => patch(`/products/${id}/update`, data),
    onMutate: async ({ id, data, period }: UpdateProductArgs) => {
      const queryKey = queryKeys.productsAnalytics(period);
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<AnalyticsResponse>(queryKey);

      queryClient.setQueryData(queryKey, (old: AnalyticsResponse | undefined) => {
        if (!old || !Array.isArray(old.products)) return old;
        // Обновляем products
        let newProducts = old.products.map((product: ProductAnalytics) =>
          product.id === id ? { ...product, ...data } : product
        );
        // Обновляем summary (например, критичные остатки)
        let criticalStock = newProducts.filter(p => Number(p.currentStock) < 10).length;
        let lowStock = newProducts.filter(p => Number(p.currentStock) >= 10 && Number(p.currentStock) < 30).length;
        let needsReorder = newProducts.filter(p => p.recommendedOrderQuantity > 0).length;
        let inTransitTotal = newProducts.reduce((sum, p) => sum + (p.inTransitQuantity || 0), 0);
        let avgProfitMargin = newProducts.length > 0 ? Math.round(newProducts.reduce((sum, p) => sum + (p.profitMargin || 0), 0) / newProducts.length) : 0;
        return {
          ...old,
          products: newProducts,
          summary: {
            ...old.summary,
            criticalStock,
            lowStock,
            needsReorder,
            inTransitTotal,
            avgProfitMargin,
          },
        };
      });

      return { previousData };
    },
    onError: (err: Error, variables: UpdateProductArgs, context: { previousData?: AnalyticsResponse | ProductAnalytics[] | undefined } | undefined) => {
      if (context?.previousData) {
        const queryKey = queryKeys.productsAnalytics(variables.period);
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error('Ошибка при обновлении товара: ' + err.message);
    },
    onSuccess: (data, variables) => {
      // Если сервер вернул обновленный товар, подменяем его в кэше
      if (data && data.data && data.data.id) {
        const queryKey = queryKeys.productsAnalytics(variables.period);
        queryClient.setQueryData(queryKey, (old: AnalyticsResponse | undefined) => {
          if (!old || !Array.isArray(old.products)) return old;
          let newProducts = old.products.map((product: ProductAnalytics) =>
            product.id === data.data.id ? { ...product, ...data.data } : product
          );
          // Пересчитываем summary
          let criticalStock = newProducts.filter(p => Number(p.currentStock) < 10).length;
          let lowStock = newProducts.filter(p => Number(p.currentStock) >= 10 && Number(p.currentStock) < 30).length;
          let needsReorder = newProducts.filter(p => p.recommendedOrderQuantity > 0).length;
          let avgProfitMargin = newProducts.length > 0 ? Math.round(newProducts.reduce((sum, p) => sum + (p.profitMargin || 0), 0) / newProducts.length) : 0;
          return {
            ...old,
            products: newProducts,
            summary: {
              ...old.summary,
              criticalStock,
              lowStock,
              needsReorder,
              avgProfitMargin,
            },
          };
        });
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productsAnalytics(variables.period) });
    },
  });

  return updateProductMutation;
} 