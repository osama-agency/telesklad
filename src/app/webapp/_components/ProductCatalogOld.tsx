"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ProductGrid } from './ProductGrid';
import { AlgoliaModernSearch } from './AlgoliaModernSearch';
import { CategoryFilter } from './CategoryFilter';
import SkeletonLoading from './SkeletonLoading';
import { webAppFetch } from '@/lib/utils/webapp-fetch';
import { ProductGridSkeleton } from "./ProductSkeleton";

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  image_url?: string;
  ancestry?: string;
}

interface Subscription {
  id: number;
  product_id: number;
  product: Product;
  created_at: string;
  updated_at: string;
}

interface ProductCatalogProps {
  // Удаляем showSearch prop
}

export function ProductCatalog({}: ProductCatalogProps) {
  console.log('🏗️ ProductCatalog render', { 
    timestamp: new Date().toISOString().split('T')[1].split('.')[0] 
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribedProductIds, setSubscribedProductIds] = useState<number[]>([]);
  
  // Используем useRef для предотвращения двойных вызовов
  const initializedRef = useRef(false);

  // Загрузка подписок пользователя
  const loadSubscriptions = useCallback(async () => {
    try {
      const response = await webAppFetch('/api/webapp/subscriptions');
      if (response.ok) {
        const data = await response.json();
        const subscriptions = data.subscriptions || [];
        setSubscribedProductIds(subscriptions.map((sub: any) => sub.product_id));
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  }, []);

  // Загрузка товаров с поддержкой фильтрации по категориям
  const loadProducts = useCallback(async (categoryId?: number | null) => {
    try {
      setLoading(true);
      setError(null);
      let url = '/api/webapp/products';
      if (categoryId) {
        url += `?category_id=${categoryId}`;
      }
      
      const [productsResponse, subscriptionsResponse] = await Promise.all([
        webAppFetch(url),
        webAppFetch('/api/webapp/subscriptions')
      ]);

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log('📦 Products loaded:', productsData);
        setProducts(productsData.products || []);
      } else {
        console.error('❌ Products API error:', productsResponse.status);
        setError('Ошибка загрузки товаров');
      }

      if (subscriptionsResponse.ok) {
        const subscriptionsData = await subscriptionsResponse.json();
        const subscriptions = subscriptionsData.subscriptions || [];
        setSubscribedProductIds(subscriptions.map((sub: any) => sub.product_id));
      }
    } catch (error) {
      setError('Ошибка соединения');
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Обработчик изменения подписок
  const handleSubscriptionChange = useCallback(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Обработчик изменения категории
  const handleCategoryChange = useCallback((categoryId: number | null) => {
    setSelectedCategory(categoryId);
  }, []);

  // Загрузка товаров при изменении категории
  useEffect(() => {
    if (initializedRef.current) {
      console.log('📦 Category changed:', selectedCategory);
      loadProducts(selectedCategory);
    }
  }, [selectedCategory, loadProducts]);

  // Загрузка данных при первом рендере
  useEffect(() => {
    if (initializedRef.current) {
      console.log('⏭️ ProductCatalog already initialized, skipping');
      return;
    }
    
    console.log('🚀 ProductCatalog initial effect');
    
    initializedRef.current = true;
    loadProducts();
    loadSubscriptions();
  }, []); // Пустой массив зависимостей

  if (error) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-red-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="product-catalog">
      {/* Category Filter - современный фильтр под поиском */}
      <div className="mb-6">
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
        />
      </div>

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
        <div className="no-items-wrapper py-8">
          <div className="w-full space-y-2">
            <div className="flex justify-center text-gray-no-active w-full mb-6">
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

export const ProductCatalogOld = ProductCatalog; 