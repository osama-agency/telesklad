"use client";

import React, { useState, useEffect } from 'react';
import { ProductGrid } from './ProductGrid';
import { CategoryNavigation } from './CategoryNavigation';
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

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribedProductIds, setSubscribedProductIds] = useState<number[]>([]);

  // Загрузка подписок пользователя
  const loadSubscriptions = async () => {
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
  };

  // Загрузка категорий
  const loadCategories = async () => {
    try {
      const response = await webAppFetch('/api/webapp/categories');
      if (response.ok) {
        const data = await response.json();
        console.log('📂 Categories loaded:', data);
        setCategories(data.categories || []);
      } else {
        console.error('❌ Categories API error:', response.status);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Загрузка товаров
  const loadProducts = async (categoryId?: number | null) => {
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
  };

  // Обработчик изменения подписок
  const handleSubscriptionChange = () => {
    loadSubscriptions();
  };

  // Загрузка данных при изменении категории
  useEffect(() => {
    loadProducts(selectedCategory);
  }, [selectedCategory]);

  // Загрузка данных при первом рендере
  useEffect(() => {
    loadCategories();
    loadSubscriptions();
  }, []);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
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