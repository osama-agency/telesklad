'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';

// Локальный интерфейс для webapp
interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  image_url?: string;
  ancestry?: string;
}

interface OptimizedProductGridProps {
  products: Product[];
  isLoading?: boolean;
  className?: string;
}

// Skeleton компонент для загрузки
const ProductSkeleton = () => (
  <div className="product-wrapper product-skeleton">
    <div className="product-img-skeleton" />
    <div className="product-title-skeleton" />
    <div className="product-title-skeleton-2" />
    <div className="product-price-skeleton" />
    <div className="product-button-skeleton" />
  </div>
);

// Оптимизированный компонент товара
const OptimizedProductCard = React.memo(({ product }: { product: Product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);
  
  // Мемоизированные вычисления цен
  const priceInfo = useMemo(() => {
    const currentPrice = product.price;
    const oldPrice = product.old_price;
    const hasDiscount = oldPrice && oldPrice > currentPrice;
    
    return {
      currentPrice,
      oldPrice: hasDiscount ? oldPrice : null,
      hasDiscount,
      isAvailable: product.stock_quantity > 0
    };
  }, [product.price, product.old_price, product.stock_quantity]);
  
  // Оптимизированное изображение
  const imageComponent = useMemo(() => {
    if (!product.image_url || imageError) {
      return (
        <div className="product-image-placeholder">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.9 21 5 21H11V19H5V3H13V9H21Z" />
          </svg>
        </div>
      );
    }
    
    return (
      <Image
        src={product.image_url}
        alt={product.name}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
        style={{ objectFit: 'contain' }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    );
  }, [product.image_url, product.name, imageError, imageLoaded, handleImageLoad, handleImageError]);
  
  return (
    <div className={`product-wrapper ${!priceInfo.isAvailable ? 'out-of-stock' : ''}`}>
      <div className="product-img">
        <Link href={`/webapp/products/${product.id}`} prefetch={false}>
          {imageComponent}
        </Link>
      </div>
      
      <div className="product-title">
        <Link href={`/webapp/products/${product.id}`} prefetch={false}>
          {product.name}
        </Link>
      </div>
      
      <div className="product-footer">
        <div className="product-pricing">
          {priceInfo.isAvailable ? (
            <>
              <div className={priceInfo.oldPrice ? 'price' : 'price-without-old'}>
                {priceInfo.currentPrice?.toFixed(2)} ₽
              </div>
              {priceInfo.oldPrice && (
                <div className="old-price">
                  {priceInfo.oldPrice.toFixed(2)} ₽
                </div>
              )}
            </>
          ) : (
            <div className={priceInfo.oldPrice ? 'price-unavailable' : 'price-unavailable-without-old'}>
              Нет в наличии
            </div>
          )}
        </div>
        
        {priceInfo.isAvailable && (
          <button 
            className="add-to-cart-btn"
            type="button"
            aria-label={`Добавить ${product.name} в корзину`}
          >
            <span className="btn-text">В корзину</span>
          </button>
        )}
      </div>
    </div>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

// Главный компонент сетки
const OptimizedProductGrid: React.FC<OptimizedProductGridProps> = ({ 
  products, 
  isLoading = false,
  className = ''
}) => {
  const router = useRouter();
  const { impactLight } = useTelegramHaptic();
  
  const handleProductClick = (productId: number) => {
    impactLight(); // Тактильный отклик при клике
    // Показать загрузку через Telegram
    window.Telegram?.WebApp?.showPopup({
      title: 'Загрузка',
      message: 'Загружаем информацию о товаре...',
      buttons: []
    });
    
    router.push(`/webapp/products/${productId}`);
  };

  // Показываем скелетоны во время загрузки
  if (isLoading) {
    return (
      <div className={`product-grid ${className}`}>
        {Array.from({ length: 8 }, (_, index) => (
          <ProductSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }
  
  // Если нет товаров
  if (!products || products.length === 0) {
    return (
      <div className="no-items-wrapper">
        <div className="no-items-title">Товары не найдены</div>
        <div className="no-items-subtitle">
          Попробуйте изменить критерии поиска или посмотрите другие категории
        </div>
      </div>
    );
  }
  
  return (
    <div className={`product-grid ${className}`}>
      {products.map((product) => (
        <OptimizedProductCard 
          key={`product-${product.id}`} 
          product={product} 
        />
      ))}
    </div>
  );
};

export default React.memo(OptimizedProductGrid); 