"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ProductGrid } from "./ProductGrid";
import { CategoryNavigation } from "./CategoryNavigation";
import { ProductGridSkeleton } from "./ProductSkeleton";
import { webappCache } from "@/lib/services/webappCache";

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  image_url?: string;
  ancestry?: string;
}

interface Category {
  id: number;
  name: string;
  children?: Category[];
}

interface Subscription {
  id: number;
  product_id: number;
  product: Product;
  created_at: string;
  updated_at: string;
}

export function OptimizedProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Мемоизируем список ID подписанных товаров
  const subscribedProductIds = useMemo(() => {
    return subscriptions.map(sub => sub.product_id);
  }, [subscriptions]);

  // Оптимизированная загрузка категорий с кэшированием
  const fetchCategories = useCallback(async () => {
    try {
      const data = await webappCache.fetchCached<Category[]>(
        '/api/webapp/categories',
        undefined,
        10 * 60 * 1000 // 10 минут кэш для категорий
      );
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Оптимизированная загрузка подписок с кэшированием
  const fetchSubscriptions = useCallback(async () => {
    try {
      const data = await webappCache.fetchCached<{ subscriptions: Subscription[] }>(
        '/api/webapp/subscriptions',
        undefined,
        2 * 60 * 1000 // 2 минуты кэш для подписок
      );
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    }
  }, []);

  // Оптимизированная загрузка продуктов с кэшированием
  const fetchProducts = useCallback(async (categoryId: number | null) => {
    try {
      const url = categoryId 
        ? `/api/webapp/products?category_id=${categoryId}`
        : '/api/webapp/products';
        
      const data = await webappCache.fetchCached<Product[]>(
        url,
        undefined,
        3 * 60 * 1000 // 3 минуты кэш для продуктов
      );
      
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      throw err;
    }
  }, []);

  // Загружаем категории при монтировании
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Загружаем продукты и подписки при изменении категории
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Параллельно загружаем продукты и подписки
        await Promise.all([
          fetchProducts(selectedCategory),
          fetchSubscriptions()
        ]);
      } catch (err) {
        setError('Ошибка загрузки данных');
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategory, fetchProducts, fetchSubscriptions]);

  // Обработчик изменения подписок с инвалидацией кэша
  const handleSubscriptionChange = useCallback(() => {
    webappCache.invalidateSubscriptions();
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Предзагрузка изображений для видимых продуктов
  useEffect(() => {
    if (products.length > 0) {
      // Предзагружаем первые 6 изображений
      const visibleProducts = products.slice(0, 6);
      visibleProducts.forEach(product => {
        if (product.image_url) {
          const img = new Image();
          img.src = product.image_url;
        }
      });
    }
  }, [products]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => {
            webappCache.clear();
            window.location.reload();
          }} 
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="product-catalog">
      {/* Category Navigation */}
      {categories.length > 0 && (
        <CategoryNavigation 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* Products Grid */}
      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length > 0 ? (
        <ProductGrid 
          products={products}
          subscribedProductIds={subscribedProductIds}
          onSubscriptionChange={handleSubscriptionChange}
        />
      ) : (
        <div className="no-items-wrapper">
          <div className="w-full">
            <div className="flex justify-center text-gray-no-active w-full mb-1">
              <svg className="pointer-events-none" style={{ fill: "currentColor", width: 40, height: 40 }}>
                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="no-items-title">Ничего не найдено</div>
          </div>
        </div>
      )}
    </div>
  );
} 