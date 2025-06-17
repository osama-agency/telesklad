import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, queryKeys } from '@/lib/api';

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
    }) => post('/purchases', data),
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

  return useMutation({
    mutationFn: ({ id, data }: { 
      id: number; 
      data: {
        stock_quantity?: number;
        price?: number;
        old_price?: number;
      };
    }) => patch<{ success: boolean; data: any; message: string }>(`/products/${id}/update`, data),
    onSuccess: (response, variables) => {
      // Инвалидируем кэш аналитики товаров для перезагрузки данных
      queryClient.invalidateQueries({ queryKey: queryKeys.productsAnalytics() });
      
      // Также инвалидируем простой список товаров на всякий случай
      queryClient.invalidateQueries({ queryKey: queryKeys.productsSimple });
      
      console.log(`✅ Товар #${variables.id} обновлен:`, response.message);
    },
    onError: (error, variables) => {
      console.error(`❌ Ошибка обновления товара #${variables.id}:`, error);
    }
  });
} 