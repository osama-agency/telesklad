import { useState, useEffect } from 'react';
import { useTelegramCache } from './useTelegramCache';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export interface ProductWithSubscription {
  id: number;
  name: string;
  price: number;
  old_price: number | null;
  stock_quantity: number;
  image_url?: string;
  isSubscribed: boolean;
}

export function useProductsWithSubscriptions(category?: string, search?: string, brand?: string | null) {
  const [products, setProducts] = useState<ProductWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cache = useTelegramCache();
  const { user } = useTelegramAuth();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;
      
      console.log('[useProductsWithSubscriptions] Starting fetch...', { search, user: user?.tg_id });
      setLoading(true);
      setError(null);

      try {
        const cacheKey = `products_${user?.tg_id || 'guest'}_v2`;
        
        let cachedData = null;
        if (cache.isAvailable) {
          cachedData = await cache.getItem(cacheKey);
          if (cachedData && Date.now() - cachedData.timestamp < 60000) { // 1 минута
            console.log('[useProductsWithSubscriptions] Using cached data');
            setProducts(cachedData.products);
            setLoading(false);
            return;
          }
        }

        const params = new URLSearchParams();
        // Восстанавливаем правильную аутентификацию
        if (user?.tg_id) params.append('tg_id', user.tg_id);
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (brand) params.append('brand', brand);
        
        const apiUrl = `/api/webapp/products${params.toString() ? `?${params.toString()}` : ''}`;

        console.log('[useProductsWithSubscriptions] Fetching from:', apiUrl);
        const response = await fetch(apiUrl);
        console.log('[useProductsWithSubscriptions] Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[useProductsWithSubscriptions] Error response:', errorText);
          throw new Error(`Failed to fetch products: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('[useProductsWithSubscriptions] Received data:', data);
        const fetchedProducts = data.products || [];
        
        if (!isMounted) return;

        console.log('[useProductsWithSubscriptions] Setting products:', fetchedProducts.length);
        console.log('[useProductsWithSubscriptions] First 3 products:', fetchedProducts.slice(0, 3));
        setProducts(fetchedProducts);
        
        if (cache.isAvailable) {
          await cache.setItem(cacheKey, {
            products: fetchedProducts,
            timestamp: Date.now()
          });
        }

      } catch (err) {
        if (!isMounted) return;
        console.error('[useProductsWithSubscriptions] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (isMounted) {
          console.log('[useProductsWithSubscriptions] Setting loading to false');
          setLoading(false);
        }
      }
    };

    fetchData();

    const handleSubscriptionsUpdate = () => fetchData();
    window.addEventListener('subscriptionsUpdated', handleSubscriptionsUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('subscriptionsUpdated', handleSubscriptionsUpdate);
    };
  }, [search, category, user?.tg_id]); // Добавляем category в зависимости

  return { products, loading, error };
} 