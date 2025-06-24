"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import { ProductGrid } from "../_components/ProductGrid";
import { ProductGridSkeleton } from "../_components/ProductSkeleton";
import { webAppFetch } from '@/lib/utils/webapp-fetch';

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  image_url?: string;
  category_name?: string;
}

interface Subscription {
  id: number;
  product_id: number;
  product: Product;
  created_at: string;
  updated_at: string;
}

export default function SearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribedProductIds, setSubscribedProductIds] = useState<number[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  // Fetch subscriptions
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

  // Search products
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Searching for:', searchQuery);
      
      const [searchResponse, subscriptionsResponse] = await Promise.all([
        webAppFetch(`/api/webapp/products/search?q=${encodeURIComponent(searchQuery)}`),
        webAppFetch('/api/webapp/subscriptions')
      ]);

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        console.log('🔍 Search results:', searchData);
        setProducts(searchData.products || []);
      } else {
        const errorData = await searchResponse.json();
        console.error('🔍 Search API error:', errorData);
        setError('Ошибка поиска товаров');
      }

      if (subscriptionsResponse.ok) {
        const subscriptionsData = await subscriptionsResponse.json();
        const subscriptions = subscriptionsData.subscriptions || [];
        setSubscribedProductIds(subscriptions.map((sub: any) => sub.product_id));
      }

      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  // Выполняем поиск при изменении query параметра
  useEffect(() => {
    if (query.trim()) {
      handleSearch(query);
    } else {
      setProducts([]);
      setHasSearched(false);
      setLoading(false);
    }
  }, [query]);

  // Set document title
  useEffect(() => {
    document.title = query ? `Поиск: ${query}` : "Поиск товаров";
    
    // Telegram Web App initialization
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#FFFFFF');
      tg.setBackgroundColor('#f9f9f9');
    }
  }, [query]);

  // Handle subscription changes
  const handleSubscriptionChange = () => {
    loadSubscriptions();
  };

  if (error) {
    return (
      <div className="webapp-container search-page">
        <div className="search-header-section">
          <div className="search-query-info">
            <h1>Поиск</h1>
            <p className="search-query">&ldquo;{query}&rdquo;</p>
          </div>
        </div>

        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => handleSearch(query)} 
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="webapp-container search-page">
      {/* Search Header */}
      <div className="search-header-section">
        <div className="search-query-info">
          <h1>Результаты поиска</h1>
          <p className="search-query">&ldquo;{query}&rdquo;</p>
          {!loading && hasSearched && (
            <p className="search-results-count">
              {products.length === 0 
                ? "Ничего не найдено" 
                : `Найдено ${products.length} ${products.length === 1 ? 'товар' : products.length < 5 ? 'товара' : 'товаров'}`
              }
            </p>
          )}
        </div>
      </div>

      {/* Search Results */}
      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length > 0 ? (
        <ProductGrid 
          products={products}
          subscribedProductIds={subscribedProductIds}
          onSubscriptionChange={handleSubscriptionChange}
        />
      ) : hasSearched ? (
        <div className="search-no-results-page">
          <div className="search-no-results-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="search-no-results-title">Ничего не найдено</h2>
          <p className="search-no-results-subtitle">
            Попробуйте изменить поисковый запрос или воспользуйтесь категориями
          </p>
          <button 
            onClick={() => router.push('/webapp')}
            className="search-back-button"
          >
            Вернуться к каталогу
          </button>
        </div>
      ) : null}
    </div>
  );
} 