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
    
    const hasDiscount = product.old_price && product.old_price > product.price;
    const discountPercent = hasDiscount ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100) : 0;

    return (
      <div className="tgapp-product-card">
        <div className="tgapp-product-favorite">
          <FavoriteButton productId={product.id} />
        </div>
        
        <div className="tgapp-product-image-container">
          <div className="tgapp-product-image-wrapper">
            {product.image_url && !imageError ? (
              <>
                {imageLoading && (
                  <div className="tgapp-product-image-placeholder">
                    <div className="tgapp-skeleton-element" role="status" aria-label="Загрузка изображения">
                      <svg 
                        width="40" 
                        height="40" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
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
                  className={`tgapp-product-image ${imageLoading ? 'loading' : ''}`}
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
              <div className="tgapp-product-image-placeholder" role="img" aria-label="Изображение товара недоступно">
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
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
        
        <div className="tgapp-product-content">
          <Link 
            href={`/tgapp/products/${product.id}`} 
            className="tgapp-product-link" 
            prefetch={false}
            aria-label={`Перейти к товару ${product.name}`}
          >
            <h3 className="tgapp-product-name" title={product.name}>
              {product.name}
            </h3>
            <div className="tgapp-product-price-container">
              {product.old_price && product.old_price > product.price && (
                <div className="tgapp-product-price-row">
                  <p className="tgapp-product-old-price" aria-label={`Старая цена ${product.old_price.toLocaleString("ru-RU")} рублей`}>
                    {product.old_price.toLocaleString("ru-RU")} ₽
                  </p>
                  {hasDiscount && (
                    <span className="tgapp-product-discount-inline" role="text" aria-label={`Скидка ${discountPercent} процентов`}>
                      -{discountPercent}%
                    </span>
                  )}
                </div>
              )}
              <p className="tgapp-product-price" aria-label={`Цена ${product.price.toLocaleString("ru-RU")} рублей`}>
                {product.price.toLocaleString("ru-RU")} ₽
              </p>
            </div>
          </Link>
        </div>
        
        <div className="tgapp-product-actions">
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
      prevProps.product.old_price === nextProps.product.old_price &&
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
      <div style={{...style, padding: '0 1rem'}} className="tgapp-product-grid">
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
      <div className="tgapp-catalog-empty">
        <p className="tgapp-catalog-empty-title">Нет товаров для отображения</p>
        <p className="tgapp-catalog-empty-message">Debug: SimpleGrid получил 0 товаров</p>
      </div>
    );
  }
  
      return (
      <div>
        <div className="tgapp-product-grid">
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
      <div className="tgapp-catalog-error" role="alert">
        <p>Ошибка загрузки товаров: {error}</p>
        <span className="sr-only">Произошла ошибка при загрузке каталога товаров</span>
      </div>
    );
  }

  if (products.length === 0) {
    console.log('[VirtualProductCatalog] No products found');
    return (
      <div className="tgapp-catalog-empty">
        <p className="tgapp-catalog-empty-title">Товары не найдены</p>
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
    <div role="main" aria-label="Каталог товаров">
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
