'use client';

import { useState, useEffect } from 'react';
import CatalogLayout from './layout/CatalogLayout';
import ProductCard from './components/ProductCard/ProductCard';
import CatalogGrid from './layout/CatalogGrid';
import Pagination from './components/Pagination';
import { ProductCardSkeleton } from './components/ProductCard/ProductCardSkeleton';
import { catalogStyles } from './utils/catalogStyles';
import CategoryNav from './components/CategoryNav';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

function SkeletonGrid() {
  return (
    <div className={catalogStyles.grid.skeleton}>
      {[...Array(8)].map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className={catalogStyles.emptyState.wrapper}>
      <div className={catalogStyles.emptyState.content}>
        <div className={catalogStyles.emptyState.icon}>📦</div>
        <h3 className={catalogStyles.emptyState.title}>Товаров не найдено</h3>
        <p className={catalogStyles.emptyState.subtitle}>
          Попробуйте изменить параметры поиска или фильтры
        </p>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={catalogStyles.errorState.wrapper}>
      <div className={catalogStyles.errorState.icon}>⚠️</div>
      <p className={catalogStyles.errorState.message}>
        Произошла ошибка при загрузке товаров
      </p>
      <button className={catalogStyles.errorState.button} onClick={onRetry}>
        Попробовать снова
      </button>
    </div>
  );
}

export default function CatalogPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('Все товары');
  const { user } = useTelegramAuth();
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(false);
      
      const response = await fetch(`/api/webapp/products${user?.tg_id ? `?tg_id=${user.tg_id}` : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      console.log('Fetched products:', data);
      
      // Преобразуем данные в нужный формат
      const formattedProducts = data.products.map((product: any) => ({
        id: product.id.toString(),
        name: product.name,
        image: product.image_url || '/placeholder.jpg',
        price: product.price,
        oldPrice: product.old_price,
        description: product.description,
        inStock: product.in_stock,
        hasSubscription: product.hasSubscription
      }));
      
      setProducts(formattedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, [user?.tg_id]);
  
  const handleRetry = () => {
    fetchProducts();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryNav 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <ErrorState onRetry={handleRetry} />
      ) : products.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <CatalogGrid>
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </CatalogGrid>
          
          <Pagination />
        </>
      )}
    </div>
  );
} 