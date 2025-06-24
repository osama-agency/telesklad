"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconComponent } from "@/components/webapp/IconComponent";
import { FavoriteButton } from "../_components/FavoriteButton";
import { AddToCartButton } from "../_components/AddToCartButton";
import LoadingSpinner from "../_components/LoadingSpinner";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramHaptic } from "@/hooks/useTelegramHaptic";

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  image_url?: string;
  favorited_at?: string;
}

interface FavoritesApiResponse {
  success: boolean;
  favorites: Product[];
  count: number;
  error?: string;
}

export default function FavoritesPage() {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingProducts, setRemovingProducts] = useState<Set<number>>(new Set());
  const [subscribedProducts, setSubscribedProducts] = useState<Set<number>>(new Set());
  const [subscriptionLoading, setSubscriptionLoading] = useState<Set<number>>(new Set());
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const { impactMedium, notificationSuccess, notificationError } = useTelegramHaptic();

  // Загрузка избранных товаров из API
  const loadFavoriteProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Если пользователь не аутентифицирован, показываем только товары из localStorage
      if (!isAuthenticated || !user?.tg_id) {
        console.warn('User not authenticated, loading favorites from localStorage only');
        const localFavorites = JSON.parse(localStorage.getItem('webapp_favorites') || '[]');
        setFavoriteProducts([]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/webapp/favorites?tg_id=${user.tg_id}`);
      const data = await response.json();
        
      if (response.ok && data.success) {
        console.log('Loaded favorites data:', data.favorites);
        // Преобразуем данные из API в нужный формат
        const products = data.favorites.map((item: any) => ({
          id: item.product_id,
          name: item.title,
          price: item.price,
          old_price: item.old_price,
          stock_quantity: item.stock_quantity || 0, // Используем stock_quantity из API
          image_url: item.image_url,
          favorited_at: item.created_at
        }));
        
        setFavoriteProducts(products);
        
        // Синхронизируем localStorage с данными из API
        const favoriteIds = products.map((product: Product) => product.id);
        localStorage.setItem('webapp_favorites', JSON.stringify(favoriteIds));
        
        // Уведомляем все FavoriteButton компоненты об обновлении
        window.dispatchEvent(new Event('favoritesSync'));
        
        console.log(`✅ Loaded ${products.length} favorites for user ${user.tg_id}`);
      } else {
        setError(data.error || 'Ошибка загрузки избранного');
      }
    } catch (error) {
      console.error('Error loading favorite products:', error);
      setError('Не удалось загрузить избранное. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик удаления товара из избранного с анимацией
  const handleProductRemoved = (productId: number) => {
    // Добавляем товар в список удаляемых для анимации
    setRemovingProducts(prev => new Set(prev).add(productId));
    
    // Через 300ms удаляем товар из списка
    setTimeout(() => {
      setFavoriteProducts(prev => prev.filter(product => product.id !== productId));
      setRemovingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }, 300);
  };

  // Обработчик подписки на уведомления
  const handleSubscriptionToggle = async (product: Product) => {
    if (!user || subscriptionLoading.has(product.id)) return;

    const isSubscribed = subscribedProducts.has(product.id);
    
    // Добавляем в состояние загрузки
    setSubscriptionLoading(prev => new Set(prev).add(product.id));
    impactMedium();

    try {
      if (isSubscribed) {
        // Отписываемся
        const response = await fetch(`/api/webapp/subscriptions?product_id=${product.id}&tg_id=${user.tg_id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setSubscribedProducts(prev => {
            const newSet = new Set(prev);
            newSet.delete(product.id);
            return newSet;
          });
          notificationSuccess();
          console.log(`✅ Unsubscribed from product ${product.id}`);
        } else {
          notificationError();
          console.error('❌ Failed to unsubscribe');
        }
      } else {
        // Подписываемся
        const body = JSON.stringify({
          product_id: product.id,
          tg_id: user.tg_id,
          user_id: user?.id ?? null // Fix: use optional chaining and fallback to null
        });

        console.log('📥 Final auth data:', {
          product_id: product.id,
          user: user,
          user_id: user?.id,
          tg_id: user?.tg_id
        });

        const tgInitData = window.Telegram?.WebApp?.initData || '';
        const response = await fetch('/api/webapp/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-telegram-init-data': tgInitData
          },
          body: body
        });

        if (response.ok) {
          const result = await response.json();
          setSubscribedProducts(prev => new Set(prev).add(product.id));
          notificationSuccess();
          console.log(`✅ Subscribed to product ${product.id}:`, result.message || 'Success');
        } else {
          const error = await response.json();
          notificationError();
          console.error('❌ Failed to subscribe:', error);
        }
      }
    } catch (error) {
      console.error('💥 Subscription error:', error, {
        productId: product.id,
        userId: user?.tg_id
      });
      notificationError();
    } finally {
      // Убираем из состояния загрузки
      setSubscriptionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  useEffect(() => {
    // Ждем завершения аутентификации перед загрузкой избранного
    if (!authLoading) {
      loadFavoriteProducts();
    }

    // Слушаем события удаления из избранного
    const handleFavoriteRemoved = (event: CustomEvent) => {
      const productId = event.detail.productId;
      handleProductRemoved(productId);
    };

    // Слушаем события добавления в избранное (для обновления без перезагрузки)
    const handleFavoriteAdded = (event: CustomEvent) => {
      // Если товар добавлен в избранное, перезагружаем список
      if (!authLoading) {
        loadFavoriteProducts();
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
    
    // Telegram Web App initialization
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#FFFFFF');
      tg.setBackgroundColor('#f9f9f9');
    }
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className="webapp-container favorites-page">
        <h1>Избранное</h1>
        <LoadingSpinner variant="page" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="webapp-container favorites-page">
        <h1>Избранное</h1>
        <div className="main-block">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={loadFavoriteProducts} 
              className="webapp-btn-secondary mt-4"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Если пользователь не аутентифицирован, показываем сообщение
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
          {favoriteProducts.map((product) => {
            console.log('Favorite product data:', product);
            return (
              <div
                key={product.id}
                className={`product-card ${removingProducts.has(product.id) ? 'removing' : ''}`}
              >
                <div className={`product-wrapper ${product.stock_quantity <= 0 ? 'out-of-stock' : ''}`}>
                  {/* Кнопка избранного - как в Rails */}
                  <div className="absolute right-3 top-3 z-10">
                    <FavoriteButton 
                      productId={product.id} 
                      onRemoved={() => handleProductRemoved(product.id)}
                    />
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
                          className={`webapp-btn-secondary ${subscribedProducts.has(product.id) ? 'notification-enabled' : ''} ${subscriptionLoading.has(product.id) ? 'loading' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSubscriptionToggle(product);
                          }}
                          disabled={subscriptionLoading.has(product.id)}
                        >
                          {subscriptionLoading.has(product.id) 
                            ? '...' 
                            : subscribedProducts.has(product.id) 
                              ? '🔔 Уведомление включено' 
                              : 'Уведомить о поступлении'
                          }
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
    </div>
  );
} 