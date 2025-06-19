"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconComponent } from "@/components/webapp/IconComponent";
import { FavoriteButton } from "../_components/FavoriteButton";
import { AddToCartButton } from "../_components/AddToCartButton";

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  image_url?: string;
  ancestry?: string;
}

export default function FavoritesPage() {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка избранных товаров
  const loadFavoriteProducts = async () => {
    try {
      // Получаем список избранных товаров из localStorage
      const favoriteIds = JSON.parse(localStorage.getItem('webapp_favorites') || '[]');
      
      if (favoriteIds.length === 0) {
        setFavoriteProducts([]);
        setIsLoading(false);
        return;
      }

      // Загружаем данные о товарах
      const response = await fetch('/api/webapp/products');
      if (response.ok) {
        const data = await response.json();
        
        // Фильтруем только избранные товары
        const favorites = data.products.filter((product: Product) => 
          favoriteIds.includes(product.id)
        );
        
        setFavoriteProducts(favorites);
      }
    } catch (error) {
      console.error('Error loading favorite products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavoriteProducts();

    // Слушаем изменения избранного
    const handleFavoritesUpdate = () => {
      loadFavoriteProducts();
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

  // Set document title for Telegram Web App
  useEffect(() => {
    document.title = "Избранное";
    
    // Telegram Web App initialization
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#FFFFFF');
      tg.setBackgroundColor('#f9f9f9');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1>Избранное</h1>
      
      {favoriteProducts.length > 0 ? (
        <div className="product-grid" id="favorites">
          {favoriteProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className={`product-wrapper ${product.stock_quantity <= 0 ? 'out-of-stock' : ''}`}>
                {/* Кнопка избранного - как в Rails */}
                <div className="absolute right-3 top-3 z-10">
                  <FavoriteButton productId={product.id} />
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
                    <div className="relative">
                      <div className="flex justify-center space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center">
                        <div className="flex items-center justify-center w-full h-48">
                          <IconComponent name="no-image" size={40} />
                        </div>
                      </div>
                      {product.image_url && (
                        <div className="absolute left-0 top-0 block w-full h-full">
                          <div className="flex justify-center items-center h-full">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              width={196}
                              height={196}
                              loading="lazy"
                            />
                          </div>
                        </div>
                      )}
                    </div>
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
                      <button className="webapp-btn-secondary">
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
        // Пустое состояние - красивое центрированное
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">
              <IconComponent name="no-favorite" size={64} />
            </div>
            <div className="empty-state-title">Нет избранных товаров</div>
            <div className="empty-state-subtitle">
              Добавляйте товары в избранное, чтобы не потерять их
            </div>
            <Link href="/webapp" className="empty-state-button">
              Вернуться в каталог
            </Link>
          </div>
        </div>
      )}
    </>
  );
} 