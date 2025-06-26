"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { IconComponent } from "@/components/webapp/IconComponent";
import { AddToCartButton } from "./AddToCartButton";
import { AnimatedFavoriteButton } from "./AnimatedFavoriteButton";
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import SkeletonLoading from './SkeletonLoading';
import { webAppFetch } from '@/lib/utils/webapp-fetch';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  image_url?: string;
  ancestry?: string;
}

interface ProductGridProps {
  products: Product[];
  subscribedProductIds?: number[]; // ID товаров, на которые подписан пользователь
  onSubscriptionChange?: () => void; // Колбэк для обновления подписок
}

export function ProductGrid({ products, subscribedProductIds = [], onSubscriptionChange }: ProductGridProps) {
  const { user } = useTelegramAuth();
  const [subscribedProducts, setSubscribedProducts] = useState(new Set(subscribedProductIds));
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const { impactLight } = useTelegramHaptic();

  const handleSubscriptionToggle = async (product: Product) => {
    if (!user) return;

    const isSubscribed = subscribedProducts.has(product.id);
    setLoading(prev => ({ ...prev, [product.id]: true }));

    try {
      if (isSubscribed) {
        // Отписываемся
        const response = await webAppFetch(`/api/webapp/subscriptions?product_id=${product.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setSubscribedProducts(prev => {
            const newSet = new Set(prev);
            newSet.delete(product.id);
            return newSet;
          });
          console.log(`✅ Unsubscribed from product ${product.id}`);
          onSubscriptionChange?.();
        } else {
          throw new Error('Failed to unsubscribe');
        }
      } else {
        // Подписываемся
        const response = await webAppFetch('/api/webapp/subscriptions', {
          method: 'POST',
          body: JSON.stringify({
            product_id: product.id
          })
        });

        if (response.ok) {
          setSubscribedProducts(prev => {
            const newSet = new Set(prev);
            newSet.add(product.id);
            return newSet;
          });
          console.log(`✅ Subscribed to product ${product.id}`);
          onSubscriptionChange?.();
        } else {
          throw new Error('Failed to subscribe');
        }
      }
    } catch (error) {
      console.error('Subscription toggle error:', error, {
        productId: product.id,
        userId: user?.tg_id
      });
    } finally {
      setLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleProductClick = (productId: number) => {
    // Добавляем haptic feedback БЕЗ изменения навигации
    impactLight();
    
    // Навигация осуществляется через Link компоненты в карточке
  };

  return (
    <div className="product-grid" id="products">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product}
          isSubscribed={subscribedProducts.has(product.id)}
          onSubscriptionChange={() => handleSubscriptionToggle(product)}
          onProductClick={handleProductClick}
        />
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  isSubscribed?: boolean;
  onSubscriptionChange?: () => void;
  onProductClick?: (productId: number) => void;
}

function ProductCard({ product, isSubscribed = false, onSubscriptionChange, onProductClick }: ProductCardProps) {
  const hasStock = product.stock_quantity > 0;
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(isSubscribed);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Используем Telegram haptic feedback
  const { impactLight, impactMedium, notificationSuccess, notificationError } = useTelegramHaptic();
  
  // Добавляем контекст аутентификации
  const { user } = useTelegramAuth();

  // Обработка нажатия на кнопку уведомления
  const handleNotificationToggle = async () => {
    console.log('🔄 ProductCard handleNotificationToggle called', { 
      user: user ? { id: user.id, tg_id: user.tg_id } : null,
      product: { id: product.id, name: product.name },
      isNotificationEnabled,
      isLoading
    });
    
    if (isLoading || !user) {
      console.log('❌ Aborting toggle:', { isLoading, hasUser: !!user });
      return;
    }

    setIsAnimating(true);
    setIsLoading(true);
    impactMedium(); // Тактильный отклик при нажатии
    
    try {
      if (isNotificationEnabled) {
        // Отключаем уведомление
        console.log('📤 Sending DELETE request for subscription');
        const response = await fetch(`/api/webapp/subscriptions?product_id=${product.id}&tg_id=${user.tg_id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setIsNotificationEnabled(false);
          notificationSuccess(); // Успешное отключение
          console.log(`✅ Unsubscribed from product ${product.id}`);
          onSubscriptionChange?.(); // Уведомляем родительский компонент
        } else {
          const error = await response.json();
          console.error('❌ Failed to unsubscribe:', error);
          notificationError(); // Ошибка
        }
      } else {
        // Включаем уведомление
        const requestBody = {
          product_id: product.id,
          tg_id: user.tg_id
        };
        console.log('📤 Sending POST request for subscription:', requestBody);
        
        const response = await fetch('/api/webapp/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        console.log('📥 Subscription response:', { 
          ok: response.ok, 
          status: response.status, 
          statusText: response.statusText 
        });

        if (response.ok) {
          const result = await response.json();
          setIsNotificationEnabled(true);
          notificationSuccess(); // Успешное включение
          console.log(`✅ Subscribed to product ${product.id}:`, result.message || 'Success');
          onSubscriptionChange?.(); // Уведомляем родительский компонент
        } else {
          const error = await response.json();
          console.error('❌ Failed to subscribe:', error);
          notificationError(); // Ошибка
        }
      }
    } catch (error) {
      console.error('💥 Error toggling notification:', error);
      notificationError(); // Ошибка
    } finally {
      setIsLoading(false);
      // Анимация завершается через 200ms
      setTimeout(() => setIsAnimating(false), 200);
    }
  };

  return (
    <div className="product-card haptic-feedback" onClick={() => onProductClick?.(product.id)}>
      <div className={`product-wrapper ${!hasStock ? 'out-of-stock' : ''}`}>
        {/* Кнопка избранного - как в Rails */}
        <div className="absolute right-3 top-3 z-10">
                          <AnimatedFavoriteButton productId={product.id} />
        </div>

        {/* Индикатор "нет в наличии" */}
        {!hasStock && (
          <div className="absolute left-2 top-2 z-10">
            <div className="out-of-stock-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
              </svg>
            </div>
          </div>
        )}

        {/* Product Image - улучшенная версия */}
        <div className="product-img">
          <Link href={`/webapp/products/${product.id}`} title={product.name}>
            <div className="relative w-full h-full" style={{ height: '172px' }}>
              {product.image_url && !imageError ? (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="animate-pulse">
                        <IconComponent name="no-image" size={40} />
                      </div>
                    </div>
                  )}
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className={`transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    loading="lazy"
                    onLoad={() => {
                      setImageLoading(false);
                    }}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <IconComponent name="no-image" size={40} />
                  {imageError && (
                    <div className="absolute bottom-1 right-1 text-xs text-red-500">
                      Error
                    </div>
                  )}
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Product Title - точно как в Rails */}
        <div className="product-title">
          <Link href={`/webapp/products/${product.id}`} title={product.name}>
            {product.name}
          </Link>
        </div>

        {/* Product Footer - современный дизайн цен */}
        <div className="product-footer">
          {hasStock ? (
            <>
              {product.old_price ? (
                <div className="price-block">
                  <div className="price-row">
                    <div className="price">{Math.floor(product.price)}₽</div>
                    <div className="discount-badge">
                      -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                    </div>
                  </div>
                  <div className="old-price">{Math.floor(product.old_price)}₽</div>
                </div>
              ) : (
                <div className="price-without-old">{Math.floor(product.price)}₽</div>
              )}
              {/* Современная кнопка добавления в корзину 2025 */}
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                productPrice={product.price}
                maxQuantity={product.stock_quantity}
                imageUrl={product.image_url}
              />
            </>
          ) : (
            <>
              {/* Показываем цену даже для товаров не в наличии */}
              {product.old_price ? (
                <div className="price-block">
                  <div className="price-row">
                    <div className="price-unavailable">{Math.floor(product.price)}₽</div>
                    <div className="discount-badge">
                      -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                    </div>
                  </div>
                  <div className="old-price">{Math.floor(product.old_price)}₽</div>
                </div>
              ) : (
                <div className="price-unavailable-without-old">{Math.floor(product.price)}₽</div>
              )}
              <div className="title-has">Нет в наличии</div>
              <button 
                className={`webapp-btn-secondary ${isNotificationEnabled ? 'notification-enabled' : ''} ${isAnimating ? 'animating' : ''} ${isLoading ? 'loading' : ''}`}
                onClick={handleNotificationToggle}
                disabled={isAnimating || isLoading}
              >
                {isNotificationEnabled ? '🔔 Уведомление включено' : 'Уведомить о поступлении'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 