"use client";

import React from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { ProductActionButton } from "./ProductActionButton";
import FavoriteButton from "./FavoriteButton";
import Link from "next/link";
import Image from "next/image";
import { useProductsWithSubscriptions, ProductWithSubscription } from "@/hooks/useProductsWithSubscriptions";
import SkeletonCatalog from "./SkeletonCatalog";

interface VirtualCatalogProps {
  search?: string;
  category?: string | null;
  debugMode?: boolean; // Опция для fallback grid при отладке
}

// Оптимизированная карточка товара с memo и custom areEqual
const ProductCard = React.memo<{ product: ProductWithSubscription; index: number }>(
  ({ product, index }) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoading, setImageLoading] = React.useState(true);

    return (
      <div className="group relative bg-white dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-black/20 transition-all duration-300 flex flex-col overflow-hidden backdrop-blur-sm h-full">
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton productId={product.id} />
        </div>
        <Link 
          href={`/tgapp/products/${product.id}`} 
          className="block flex-1" 
          prefetch={false}
          aria-label={`Перейти к товару ${product.name}`}
        >
          <div className="p-4 pb-3">
            <div className="relative w-full bg-gray-50 dark:bg-gray-700/30 rounded-lg overflow-hidden" style={{ height: '180px' }}>
              {product.image_url && !imageError ? (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <div className="animate-pulse" role="status" aria-label="Загрузка изображения">
                        <svg 
                          width="40" 
                          height="40" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-gray-400"
                          aria-hidden="true"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <span className="sr-only">Загрузка изображения товара</span>
                      </div>
                    </div>
                  )}
                  <Image
                    src={product.image_url}
                    alt={`Изображение товара ${product.name}`}
                    fill
                    className={`object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    sizes="(max-width: 640px) 50vw, 200px"
                    unoptimized
                    priority={index < 4} // Приоритет для первых 4 товаров
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-700" role="img" aria-label="Изображение товара недоступно">
                  <svg 
                    width="40" 
                    height="40" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-gray-400"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  {imageError && (
                    <div className="absolute bottom-1 right-1 text-xs text-red-500" aria-hidden="true">
                      Ошибка
                    </div>
                  )}
                  <span className="sr-only">Изображение товара недоступно</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col flex-1 px-4 space-y-3 pb-3">
            <h3 
              className="text-sm font-medium text-gray-900 dark:text-gray-200 line-clamp-2 min-h-[2.5rem] leading-tight" 
              title={product.name}
            >
              {product.name}
            </h3>
            <p className="text-lg font-bold text-green-500 dark:text-green-400" aria-label={`Цена ${product.price.toLocaleString("ru-RU")} рублей`}>
              {product.price.toLocaleString("ru-RU")} ₽
            </p>
          </div>
        </Link>
        <div className="px-4 pb-4 mt-auto">
          <ProductActionButton
            productId={product.id}
            productName={product.name}
            productPrice={product.price}
            stockQuantity={product.stock_quantity || 0}
            maxQuantity={product.stock_quantity || 10}
            imageUrl={product.image_url}
            initiallySubscribed={product.isSubscribed}
          />
        </div>
      </div>
    );
  },
  // Custom areEqual для оптимизации перерендеров
  (prevProps, nextProps) => {
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.name === nextProps.product.name &&
      prevProps.product.price === nextProps.product.price &&
      prevProps.product.image_url === nextProps.product.image_url &&
      prevProps.product.stock_quantity === nextProps.product.stock_quantity &&
      prevProps.product.isSubscribed === nextProps.product.isSubscribed &&
      prevProps.index === nextProps.index
    );
  }
);

ProductCard.displayName = "ProductCard";

// Компонент строки для виртуализации (2 товара в строке)
const VirtualRow = React.memo<{ 
  index: number; 
  style: React.CSSProperties; 
  data: { products: ProductWithSubscription[]; itemsPerRow: number; } 
}>(({ index, style, data }) => {
  const { products, itemsPerRow } = data;
  const startIndex = index * itemsPerRow;
  const rowItems = products.slice(startIndex, startIndex + itemsPerRow);

    return (
      <div style={style} className="grid grid-cols-2 gap-4 px-4 w-full">
      {rowItems.map((product, itemIndex) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          index={startIndex + itemIndex}
        />
        ))}
      </div>
    );
}, (prevProps, nextProps) => {
  // Оптимизация перерендера строк
  const prevRowProducts = prevProps.data.products.slice(
    prevProps.index * prevProps.data.itemsPerRow,
    (prevProps.index + 1) * prevProps.data.itemsPerRow
  );
  const nextRowProducts = nextProps.data.products.slice(
    nextProps.index * nextProps.data.itemsPerRow,
    (nextProps.index + 1) * nextProps.data.itemsPerRow
  );
  
  return (
    prevProps.index === nextProps.index &&
    prevRowProducts.length === nextRowProducts.length &&
    prevRowProducts.every((product, i) => 
      product.id === nextRowProducts[i]?.id &&
      product.isSubscribed === nextRowProducts[i]?.isSubscribed
    )
  );
});

VirtualRow.displayName = "VirtualRow";

// Fallback Grid для отладки
const SimpleGrid = React.memo<{ products: ProductWithSubscription[] }>(({ products }) => {
  console.log('[SimpleGrid] Rendering with products:', products.length);
  console.log('[SimpleGrid] Products data:', products.slice(0, 3));
  
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-lg text-gray-500">Нет товаров для отображения</p>
          <p className="text-sm text-gray-400">Debug: SimpleGrid получил 0 товаров</p>
        </div>
      </div>
    );
  }
  
      return (
      <div>
        <div className="grid grid-cols-2 gap-3">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
});

SimpleGrid.displayName = "SimpleGrid";

export default function VirtualProductCatalog({ search, category, debugMode = false }: VirtualCatalogProps) {
  const { products, loading, error } = useProductsWithSubscriptions(category || undefined, search, undefined);
  
  // Параметры виртуализации
  const itemsPerRow = 2;
  const itemHeight = 360; // Высота строки в пикселях
  const rowCount = Math.ceil(products.length / itemsPerRow);

  // ВРЕМЕННАЯ ОТЛАДКА
  console.log('=== VirtualProductCatalog RENDER ===');
  console.log('[VirtualProductCatalog] Props:', { search, category, debugMode });
  console.log('[VirtualProductCatalog] Hook result:', { 
    loading, 
    error, 
    productsCount: products.length, 
    productsType: typeof products,
    isArray: Array.isArray(products)
  });
  console.log('[VirtualProductCatalog] First 2 products:', products.slice(0, 2));
  console.log('[VirtualProductCatalog] Render decision:', {
    willShowLoading: loading,
    willShowError: !!error,
    willShowEmpty: products.length === 0 && !loading && !error,
    willShowProducts: products.length > 0 && !loading && !error
  });
  console.log('=====================================');

  if (loading) {
    console.log('[VirtualProductCatalog] Showing loading...');
    return <SkeletonCatalog />;
  }
  
  if (error) {
    console.log('[VirtualProductCatalog] Showing error:', error);
    return (
      <div className="text-center py-8 text-red-500" role="alert">
        <p>Ошибка загрузки товаров: {error}</p>
        <span className="sr-only">Произошла ошибка при загрузке каталога товаров</span>
      </div>
    );
  }

  if (products.length === 0) {
    console.log('[VirtualProductCatalog] No products found');
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Товары не найдены</p>
        <span className="sr-only">В каталоге нет товаров, соответствующих поисковому запросу</span>
      </div>
    );
  }

  // Если включен режим отладки или товаров немного - используем простую сетку
  if (debugMode || products.length <= 50) {
    console.log('[VirtualProductCatalog] Using simple grid', { reason: debugMode ? 'debug mode' : 'few products', count: products.length });
    return <SimpleGrid products={products} />;
  }

  // Основной виртуализированный рендер
  console.log('[VirtualProductCatalog] Using virtualized render');
  
  // Используем фиксированные размеры для Telegram WebApp
  const containerHeight = typeof window !== 'undefined' ? window.innerHeight - 200 : 600; // Высота экрана минус header
  const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 375; // Стандартная ширина мобильного
  
  console.log('[VirtualProductCatalog] Container dimensions:', { containerHeight, containerWidth });
  
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 hide-scrollbar" role="main" aria-label="Каталог товаров">
      <div aria-live="polite" aria-label={`Сетка товаров, ${products.length} товаров в ${rowCount} строках`} className="sr-only" />
      <List 
        height={containerHeight} 
        width={containerWidth} 
        itemCount={rowCount} 
        itemSize={itemHeight} 
        overscanCount={2}
        itemData={{ products, itemsPerRow }}
        className="hide-scrollbar"
      >
        {VirtualRow}
      </List>
    </div>
  );
}
