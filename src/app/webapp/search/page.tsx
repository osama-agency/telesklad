"use client";

import React from 'react';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import { AlgoliaSearchPage } from "../_components/AlgoliaSearchPage";
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

// Fallback страница поиска с использованием стандартного API
function FallbackSearchPage({ query }: { query: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [subscribedProductIds, setSubscribedProductIds] = useState<number[]>([]);
  const router = useRouter();

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

  // Поиск товаров
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      console.log('🔍 Fallback search for:', searchQuery);
      
      const [searchResponse, subscriptionsResponse] = await Promise.all([
        webAppFetch(`/api/webapp/products/search?q=${encodeURIComponent(searchQuery)}`),
        webAppFetch('/api/webapp/subscriptions')
      ]);

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        console.log('🔍 Fallback search results:', searchData);
        setProducts(searchData.products || []);
      } else {
        const errorData = await searchResponse.json();
        console.error('🔍 Search API error:', errorData);
        setError('Ошибка поиска товаров');
        setProducts([]);
      }

      if (subscriptionsResponse.ok) {
        const subscriptionsData = await subscriptionsResponse.json();
        const subscriptions = subscriptionsData.subscriptions || [];
        setSubscribedProductIds(subscriptions.map((sub: any) => sub.product_id));
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Ошибка соединения');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Выполняем поиск при изменении query
  useEffect(() => {
    if (query.trim()) {
      handleSearch(query);
    } else {
      setProducts([]);
      setHasSearched(false);
      setLoading(false);
    }
  }, [query]);

  // Загружаем подписки при первом рендере
  useEffect(() => {
    loadSubscriptions();
  }, []);

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

  // Обработчик изменения подписок
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
          <div className="search-error-icon mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-red-400">
              <path d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => handleSearch(query)} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Повторить поиск
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

// Компонент-обертка для использования useSearchParams
function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  // Проверяем доступность Algolia
  const hasAlgolia = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID && 
                     process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;

  if (hasAlgolia) {
    // Используем Algolia InstantSearch
    return <AlgoliaSearchPage initialQuery={query} />;
  } else {
    // Используем fallback поиск с улучшенным дизайном
    return <FallbackSearchPage query={query} />;
  }
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="webapp-container search-page">
        <div className="search-header-section">
          <div className="search-query-info">
            <h1>Поиск товаров</h1>
          </div>
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
} 