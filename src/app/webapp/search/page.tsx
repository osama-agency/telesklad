"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductGrid } from "../_components/ProductGrid";
import { ProductGridSkeleton } from "../_components/ProductSkeleton";

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
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/webapp/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    }
  };

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        router.push('/webapp');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const [productsResponse, subscriptionsResponse] = await Promise.all([
          fetch(`/api/webapp/products/search?q=${encodeURIComponent(query)}`),
          fetch('/api/webapp/subscriptions')
        ]);
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        } else {
          setError('Ошибка поиска товаров');
        }

        if (subscriptionsResponse.ok) {
          const subscriptionsData = await subscriptionsResponse.json();
          setSubscriptions(subscriptionsData.subscriptions || []);
        }
      } catch (err) {
        setError('Ошибка соединения');
        console.error('Failed to search products:', err);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query, router]);

  // Set document title
  useEffect(() => {
    document.title = query ? `Поиск: ${query}` : "Поиск товаров";
    
    // Telegram Web App initialization
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#FFFFFF');
      tg.setBackgroundColor('#f9f9f9');
    }
  }, [query]);

  // Handle subscription changes
  const handleSubscriptionChange = () => {
    fetchSubscriptions();
  };

  // Get subscribed product IDs
  const subscribedProductIds = subscriptions.map(sub => sub.product_id);

  if (error) {
    return (
      <div className="webapp-container search-page">
        <div className="search-header-section">
          <div className="search-query-info">
            <h1>Поиск</h1>
            <p className="search-query">"{query}"</p>
          </div>
        </div>

        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
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
          <p className="search-query">"{query}"</p>
          {!loading && (
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
      ) : (
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
      )}
    </div>
  );
} 