"use client";

import { useState, useEffect } from "react";
import { ProductGrid } from "./ProductGrid";
import { CategoryNavigation } from "./CategoryNavigation";
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

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/webapp/subscriptions');
      if (response.ok) {
        const data = await response.json();
        // API теперь возвращает объект с полем subscriptions
        setSubscriptions(data.subscriptions || []);
      }
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/webapp/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products and subscriptions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Параллельно загружаем товары и подписки
        const [productsResponse, subscriptionsResponse] = await Promise.all([
          fetch(selectedCategory 
          ? `/api/webapp/products?category_id=${selectedCategory}`
            : '/api/webapp/products'),
          fetch('/api/webapp/subscriptions')
        ]);
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        } else {
          setError('Ошибка загрузки товаров');
        }

        if (subscriptionsResponse.ok) {
          const subscriptionsData = await subscriptionsResponse.json();
          // API теперь возвращает объект с полем subscriptions
          setSubscriptions(subscriptionsData.subscriptions || []);
        }
      } catch (err) {
        setError('Ошибка соединения');
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  // Обработчик изменения подписок
  const handleSubscriptionChange = () => {
    fetchSubscriptions();
  };

  // Получаем ID товаров, на которые подписан пользователь
  const subscribedProductIds = subscriptions.map(sub => sub.product_id);

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