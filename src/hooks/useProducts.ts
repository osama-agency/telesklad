import { useState, useEffect, useCallback } from 'react';
import { useDateRange, getDateRangeParams } from '@/context/DateRangeContext';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  prime_cost: number;
  avgPurchasePriceRub?: number; // Средняя закупочная цена в рублях
  stock_quantity: number;
  soldQuantity?: number; // Количество проданных штук
  revenue?: number; // Общая выручка
  baseCost?: number; // Себестоимость
  expenseShare?: number; // Доля общих расходов
  deliveryCost?: number; // Стоимость доставки
  totalCosts?: number; // Общие расходы
  netProfitPerUnit?: number; // Чистая прибыль с 1 шт
  brand?: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  ancestry?: string;
  weight?: string;
  dosage_form?: string;
  package_quantity?: number;
  main_ingredient?: string;
  old_price?: number;
}

export interface ProductFilters {
  search?: string;
  status?: 'all' | 'critical' | 'low-stock' | 'need-order' | 'in-stock';
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  showHidden?: boolean; // Показывать скрытые товары
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    totalProducts: number;
    totalPurchaseValue: number;
    averageMargin: number;
    criticalStock: number;
    totalValue: number;
    averagePrice: number;
  };
}

interface UseProductsOptions {
  initialFilters?: Partial<ProductFilters>;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  autoRefresh?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { dateRange } = useDateRange();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ProductsResponse['pagination'] | null>(null);
  const [stats, setStats] = useState<ProductsResponse['stats'] | null>(null);
  const [filters, setFilters] = useState<Partial<ProductFilters>>(options.initialFilters || {});

  const {
    page = 1,
    limit = 25,
    sortBy = 'name',
    sortOrder = 'asc',
    autoRefresh = true,
  } = options;

  const fetchProducts = useCallback(async () => {
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
      const dateParams = getDateRangeParams(dateRange);
      Object.entries(dateParams).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      // Добавляем фильтры
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Product[] = await response.json();
      
      // Преобразуем Decimal значения в числа для корректной работы
      const normalizedData = data.map(product => ({
        ...product,
        price: product.price ? (typeof product.price === 'object' ? parseFloat((product.price as any).toString()) : Number(product.price)) : 0,
        prime_cost: product.prime_cost ? (typeof product.prime_cost === 'object' ? parseFloat((product.prime_cost as any).toString()) : Number(product.prime_cost)) : 0,
        avgPurchasePriceRub: product.avgPurchasePriceRub ? (typeof product.avgPurchasePriceRub === 'object' ? parseFloat((product.avgPurchasePriceRub as any).toString()) : Number(product.avgPurchasePriceRub)) : 0,
        stock_quantity: product.stock_quantity || 0,
        soldQuantity: product.soldQuantity || 0,
        revenue: product.revenue || 0,
        baseCost: product.baseCost || 0,
        expenseShare: product.expenseShare || 0,
        deliveryCost: product.deliveryCost || 350, // Фиксированная стоимость доставки 350₽
        totalCosts: product.totalCosts || 0,
        netProfitPerUnit: product.netProfitPerUnit || 0,
      }));
      
      // Обрабатываем данные и вычисляем статистику
      const processedData = processProductsData(normalizedData, { page, limit });
      
      setProducts(processedData.products);
      setPagination(processedData.pagination);
      setStats(processedData.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, filters, page, limit, sortBy, sortOrder]);

  // Автоматическое обновление при изменении фильтров
  useEffect(() => {
    if (autoRefresh) {
      fetchProducts();
    }
  }, [fetchProducts, autoRefresh]);

  // Синхронизация с внешним API (если нужно)
  const syncProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Если нет endpoint для синхронизации, просто обновляем данные
        if (response.status === 404) {
          await fetchProducts();
          return { message: 'Products refreshed successfully' };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // После синхронизации обновляем список товаров
      await fetchProducts();

      return result;
    } catch (err) {
      console.error('Error syncing products:', err);
      // В случае ошибки просто обновляем данные
      await fetchProducts();
      return { message: 'Products refreshed' };
    }
  }, [fetchProducts]);

  // Обновление фильтров
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Очистка фильтров
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Поиск товаров
  const searchProducts = useCallback((searchTerm: string) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  // Фильтрация по статусу
  const filterByStatus = useCallback((status: string) => {
    updateFilters({ status: status === 'all' ? undefined : status as ProductFilters['status'] });
  }, [updateFilters]);

  // Фильтрация по бренду
  const filterByBrand = useCallback((brand: string) => {
    updateFilters({ brand: brand === 'all' ? undefined : brand });
  }, [updateFilters]);

  // Переключение видимости товара
  const toggleProductVisibility = useCallback(async (productId: number, isVisible: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_visible: isVisible }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Обновляем товар в локальном состоянии без полного refetch
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, is_visible: isVisible, updated_at: result.product.updated_at }
            : product
        )
      );

      return result;
    } catch (err) {
      console.error('Error toggling product visibility:', err);
      throw err;
    }
  }, []);

  // Переключение показа скрытых товаров
  const toggleShowHidden = useCallback((showHidden: boolean) => {
    updateFilters({ showHidden });
  }, [updateFilters]);

  return {
    // Данные
    products,
    pagination,
    stats,
    loading,
    error,
    filters,

    // Методы
    fetchProducts,
    syncProducts,
    updateFilters,
    clearFilters,
    searchProducts,
    filterByStatus,
    filterByBrand,
    toggleProductVisibility,
    toggleShowHidden,

    // Вспомогательные значения
    hasProducts: products.length > 0,
    totalProducts: pagination?.totalCount || 0,
    isFiltered: Object.keys(filters).length > 0,
  };
}

// Функция для обработки данных и вычисления статистики
function processProductsData(data: Product[], options: { page: number; limit: number }) {
  const { page, limit } = options;
  
  // Применяем фильтрацию (в реальном приложении это должно происходить на сервере)
  const filteredProducts = data;
  
  // Пагинация
  const totalCount = filteredProducts.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  // Статистика
  const totalProducts = filteredProducts.length;
  const totalPurchaseValue = filteredProducts.reduce((sum, product) => {
    // Используем среднюю закупочную цену если есть, иначе обычную себестоимость
    const purchasePrice = Number(product.avgPurchasePriceRub) || Number(product.prime_cost) || 0;
    const stockQty = Number(product.stock_quantity) || 0;
    return sum + (purchasePrice * stockQty);
  }, 0);
  const totalValue = filteredProducts.reduce((sum, product) => {
    const price = Number(product.price) || 0;
    const stockQty = Number(product.stock_quantity) || 0;
    return sum + (price * stockQty);
  }, 0);
  const averageMargin = filteredProducts.length > 0 
    ? filteredProducts.reduce((sum, product) => {
        // Используем среднюю закупочную цену для более точного расчета маржи
        const purchasePrice = Number(product.avgPurchasePriceRub) || Number(product.prime_cost) || 0;
        const price = Number(product.price) || 0;
        if (price === 0) return sum;
        const margin = ((price - purchasePrice) / price) * 100;
        return sum + (margin > 0 ? margin : 0);
      }, 0) / filteredProducts.length
    : 0;
  const criticalStock = filteredProducts.filter(product => Number(product.stock_quantity) < 10).length;
  const averagePrice = filteredProducts.length > 0
    ? filteredProducts.reduce((sum, product) => sum + Number(product.price), 0) / filteredProducts.length
    : 0;

  return {
    products: paginatedProducts,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    stats: {
      totalProducts,
      totalPurchaseValue,
      averageMargin: Math.round(averageMargin),
      criticalStock,
      totalValue,
      averagePrice,
    },
  };
}

// Хук для получения одного товара
export function useProduct(productId: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  };
}

// Хук для статистики товаров
export function useProductStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: '1000', // Получаем все товары для статистики
      });

      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Product[] = await response.json();
      const processedData = processProductsData(data, { page: 1, limit: 1000 });
      setStats(processedData.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product stats');
      console.error('Error fetching product stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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