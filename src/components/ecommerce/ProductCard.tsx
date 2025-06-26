'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/catalyst/button';
import { Badge } from '@/components/catalyst/badge';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';

interface Product {
  id: number;
  product_id: number;
  title: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  is_in_stock: boolean;
  image_url: string;
  created_at: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
  loading?: boolean;
}

export default function ProductCard({ 
  product, 
  onAddToCart,
  loading = false 
}: ProductCardProps) {
  const { impactLight } = useTelegramHaptic();

  const handleAddToCart = () => {
    if (loading || !product.is_in_stock) return;
    impactLight();
    onAddToCart?.(product.product_id);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ru-RU')}₽`;
  };

  const getStockStatus = (product: Product) => {
    if (!product.is_in_stock || product.stock_quantity === 0) {
      return { text: 'Нет в наличии', color: 'text-red-500' };
    }
    if (product.stock_quantity < 10) {
      return { text: `Осталось ${product.stock_quantity} шт.`, color: 'text-orange-500' };
    }
    return { text: 'В наличии', color: 'text-green-600' };
  };

  const stockStatus = getStockStatus(product);
  const hasDiscount = product.old_price && product.old_price > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100) : 0;

  return (
    <div className="product-card group">
      {/* Product Image Container */}
      <div className="product-image-container">
        <Link href={`/webapp/products/${product.product_id}`}>
          <img
            alt={product.title}
            src={product.image_url}
            className="product-image"
            loading="lazy"
          />
        </Link>
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="product-badge product-badge-sale">
            -{discountPercent}%
          </div>
        )}
      </div>
      
      {/* Product Content */}
      <div className="product-content">
        {/* Product Title */}
        <Link href={`/webapp/products/${product.product_id}`}>
          <h3 className="product-title hover:text-green-600 transition-colors">
            {product.title}
          </h3>
        </Link>
        
        {/* Stock Status */}
        <div className={`product-status ${
          !product.is_in_stock || product.stock_quantity === 0 
            ? 'product-status-out-of-stock'
            : product.stock_quantity < 10 
              ? 'product-status-low-stock'
              : 'product-status-in-stock'
        }`}>
          {stockStatus.text}
        </div>
        
        {/* Price Section */}
        <div className="product-price-section">
          <div className="product-price-container">
            {hasDiscount && (
              <span className="product-old-price">
                {formatPrice(product.old_price!)}
              </span>
            )}
            <span className="product-current-price">
              {formatPrice(product.price)}
            </span>
          </div>
          
          {hasDiscount && (
            <div className="product-discount">
              -{discountPercent}%
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="product-button">
          {!product.is_in_stock ? (
            <button className="product-add-button-out-of-stock" disabled>
              Нет в наличии
            </button>
          ) : (
            <Button
              onClick={handleAddToCart}
              disabled={loading}
              className="product-add-button"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Добавление...
                </div>
              ) : (
                'В корзину'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 