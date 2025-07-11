"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconComponent } from "@/components/webapp/IconComponent";
import { AnimatedFavoriteButton } from "../_components/AnimatedFavoriteButton";
import { AddToCartButton } from "../_components/AddToCartButton";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useTelegramHaptic } from "@/hooks/useTelegramHaptic";
import LoadingWrapper from "@/components/ui/loading-wrapper";

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  image_url?: string;
  favorited_at?: string;
}

export default function FavoritesPage() {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingProducts, setRemovingProducts] = useState<Set<number>>(new Set());
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const { setFavoritesCount } = useFavorites();
  const { impactMedium, notificationSuccess, notificationError } = useTelegramHaptic();

  // Загрузка избранных товаров
  const loadFavorites = async () => {
    if (!isAuthenticated || !user?.tg_id) {
      setFavoriteProducts([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/webapp/favorites?tg_id=${user.tg_id}`);
      const data = await response.json();
        
      if (response.ok && data.success) {
        const products = data.favorites.map((item: any) => ({
          id: item.product_id,
          name: item.title,
          price: item.price,
          old_price: item.old_price,
          stock_quantity: item.stock_quantity || 0,
          image_url: item.image_url,
          favorited_at: item.created_at
        }));
        
        setFavoriteProducts(products);
        
        // Обновляем контекст
        setFavoritesCount(products.length);
        
        // Синхронизируем localStorage
        const favoriteIds = products.map((p: Product) => p.id);
        localStorage.setItem('webapp_favorites', JSON.stringify(favoriteIds));
        window.dispatchEvent(new Event('favoritesSync'));
      } else {
        setError(data.error || 'Ошибка загрузки избранного');
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setError('Не удалось загрузить избранное');
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление товара из избранного
  const handleProductRemoved = (productId: number) => {
    setRemovingProducts(prev => new Set(prev).add(productId));
    
    setTimeout(() => {
      setFavoriteProducts(prev => {
        const newProducts = prev.filter(p => p.id !== productId);
        // Обновляем контекст при удалении товара
        setFavoritesCount(newProducts.length);
        return newProducts;
      });
      setRemovingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }, 300);
  };

  useEffect(() => {
    if (!authLoading) {
      loadFavorites();
    }

    const handleFavoriteRemoved = (event: CustomEvent) => {
      handleProductRemoved(event.detail.productId);
    };

    const handleFavoriteAdded = (event: CustomEvent) => {
      if (!authLoading) {
        loadFavorites();
      }
    };

    window.addEventListener('favoriteRemoved', handleFavoriteRemoved as EventListener);
    window.addEventListener('favoriteAdded', handleFavoriteAdded as EventListener);
    
    return () => {
      window.removeEventListener('favoriteRemoved', handleFavoriteRemoved as EventListener);
      window.removeEventListener('favoriteAdded', handleFavoriteAdded as EventListener);
    };
  }, [authLoading, isAuthenticated, user?.tg_id]);

  // Set document title for Telegram Web App
  useEffect(() => {
    document.title = "Избранное";
    
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#FFFFFF');
      tg.setBackgroundColor('#f9f9f9');
    }
  }, []);

  // Простая загрузка
  if (authLoading) {
    return (
      <div className="webapp-container favorites-page">
        <h1>Избранное</h1>
        <LoadingWrapper />
      </div>
    );
  }

  // Простая загрузка данных
  if (isLoading) {
    return (
      <div className="webapp-container favorites-page">
        <h1>Избранное</h1>
        <LoadingWrapper />
      </div>
    );
  }

  // Ошибка
  if (error) {
    return (
      <div className="webapp-container favorites-page">
        <h1>Избранное</h1>
        <div className="main-block">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={loadFavorites} 
              className="webapp-btn-secondary mt-4"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Не авторизован
  if (!isAuthenticated) {
    return (
      <div className="webapp-container favorites-page">
        <h1>Избранное</h1>
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">
              <IconComponent name="no-favorite" size={64} />
            </div>
            <div className="empty-state-title">Войдите для просмотра избранного</div>
            <div className="empty-state-subtitle">
              Для работы с избранными товарами необходимо войти через Telegram
            </div>
            <Link href="/webapp" className="empty-state-button">
              Вернуться в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="webapp-container favorites-page">
      <h1>Избранное</h1>
      
      {favoriteProducts.length > 0 ? (
        <div className="product-grid" id="favorites">
          {favoriteProducts.map((product) => (
            <div
              key={product.id}
              className={`product-card ${removingProducts.has(product.id) ? 'removing' : ''}`}
            >
              <div className={`product-wrapper ${product.stock_quantity <= 0 ? 'out-of-stock' : ''}`}>
                {/* Кнопка избранного */}
                <div className="absolute right-3 top-3 z-10">
                  <AnimatedFavoriteButton productId={product.id} />
                </div>

                {/* Индикатор "нет в наличии" */}
                {product.stock_quantity <= 0 && (
                  <div className="absolute left-3 top-3 z-10">
                    <div className="out-of-stock-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                      </svg>
                    </div>
                  </div>
                )}

                {/* Product Image */}
                <div className="product-img">
                  <Link href={`/webapp/products/${product.id}`} title={product.name}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        width={196}
                        height={196}
                        loading="lazy"
                      />
                    ) : (
                      <div className="no-image-placeholder">
                        <IconComponent name="no-image" size={40} />
                      </div>
                    )}
                  </Link>
                </div>

                {/* Product Title */}
                <div className="product-title">
                  <Link href={`/webapp/products/${product.id}`} title={product.name}>
                    {product.name}
                  </Link>
                </div>

                {/* Product Footer */}
                <div className="product-footer">
                  {product.stock_quantity > 0 ? (
                    <>
                      {product.old_price ? (
                        <div className="flex gap-1 items-center">
                          <div className="price">{Math.floor(product.price)}₽</div>
                          <div className="old-price">{Math.floor(product.old_price)}₽</div>
                        </div>
                      ) : (
                        <div className="price-without-old">{Math.floor(product.price)}₽</div>
                      )}
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
                      {product.old_price ? (
                        <div className="flex gap-1 items-center">
                          <div className="price-unavailable">{Math.floor(product.price)}₽</div>
                          <div className="old-price">{Math.floor(product.old_price)}₽</div>
                        </div>
                      ) : (
                        <div className="price-unavailable-without-old">{Math.floor(product.price)}₽</div>
                      )}
                      <div className="title-has">Нет в наличии</div>
                      <button 
                        className="webapp-btn-secondary"
                        onClick={() => impactMedium()}
                      >
                        Уведомить о поступлении
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">
              <IconComponent name="no-favorite" size={64} />
            </div>
            <div className="empty-state-title">Избранное пусто</div>
            <div className="empty-state-subtitle">
              Добавьте товары в избранное, чтобы быстро находить их позже
            </div>
            <Link href="/webapp" className="empty-state-button">
              Посмотреть каталог
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 