"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IconComponent } from "@/components/webapp/IconComponent";
import LoadingSpinner from "../_components/LoadingSpinner";
import { webAppFetch } from "@/lib/utils/webapp-fetch";
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  quantity: number;
  available: boolean;
  image_url?: string;
}

interface Subscription {
  id: number;
  product_id: number;
  product: Product;
  created_at: string;
  updated_at: string;
}

const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();

  // Загружаем подписки
  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Проверяем аутентификацию
      if (!isAuthenticated || !user?.tg_id) {
        console.warn('User not authenticated, cannot load subscriptions');
        setSubscriptions([]);
        setLoading(false);
        return;
      }
      
      const response = await webAppFetch(`/api/webapp/subscriptions?tg_id=${user.tg_id}`);
      const data = await response.json();

      if (response.ok && data.subscriptions) {
        setSubscriptions(data.subscriptions);
        console.log(`✅ Loaded ${data.subscriptions.length} subscriptions for user ${user.tg_id}`);
      } else {
        setError(data.error || 'Ошибка загрузки подписок');
      }
    } catch (err) {
      setError('Ошибка соединения');
      console.error('Failed to fetch subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Отписаться от товара
  const handleUnsubscribe = async (productId: number) => {
    if (!user?.tg_id) return;

    try {
      const response = await webAppFetch(`/api/webapp/subscriptions?product_id=${productId}&tg_id=${user.tg_id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Обновляем список подписок
        setSubscriptions(prev => prev.filter(sub => sub.product_id !== productId));
        console.log(`✅ Unsubscribed from product ${productId}`);
      } else {
        const error = await response.json();
        console.error('Failed to unsubscribe:', error);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  // Загружаем данные при монтировании
  useEffect(() => {
    // Ждем завершения аутентификации перед загрузкой подписок
    if (!authLoading) {
      loadSubscriptions();
    }
  }, [authLoading, isAuthenticated, user?.tg_id]);

  // Функция для определения статуса товара
  const getProductStatus = (product: Product) => {
    if (product.available && product.quantity > 0) {
      return { status: 'available', text: 'В наличии', color: 'text-green-600' };
    } else {
      return { status: 'waiting', text: 'Ожидаем поступления', color: 'text-orange-600' };
    }
  };

  if (loading) {
    return (
      <LoadingSpinner variant="page" size="lg" />
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadSubscriptions} 
          className="mt-2 webapp-btn-secondary"
        >
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="subscriptions-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1>Товары в ожидании</h1>
        <Link href="/webapp/profile" className="text-gray-600 hover:text-gray-800">
          <IconComponent name="close" size={24} />
        </Link>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length > 0 ? (
        <div className="space-y-4">
          {subscriptions.map((subscription) => {
            const product = subscription.product;
            const status = getProductStatus(product);
            
            return (
              <div key={subscription.id} className="main-block">
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-green-600">
                        <IconComponent name="no-image" size={24} />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/webapp/products/${product.id}`}
                      className="block"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1 hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {product.old_price ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-600">
                            {Math.floor(product.price)}₽
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {Math.floor(product.old_price)}₽
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-green-600">
                          {Math.floor(product.price)}₽
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${status.color} font-medium`}>
                        {status.text}
                      </span>
                      
                      <button
                        onClick={() => handleUnsubscribe(product.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Отписаться
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Actions */}
                {status.status === 'available' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link 
                      href={`/webapp/products/${product.id}`}
                      className="webapp-btn w-full block text-center"
                    >
                      Купить сейчас
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">
              <IconComponent name="clock" size={64} />
            </div>
            <h2 className="empty-state-title">
              Нет отслеживаемых товаров
            </h2>
            <p className="empty-state-subtitle">
              Подпишитесь на уведомления о поступлении товаров, которые сейчас не в наличии
            </p>
            <Link href="/webapp" className="empty-state-button">
              Перейти в каталог
            </Link>
          </div>
        </div>
      )}

      {/* Info Block */}
      {subscriptions.length > 0 && (
        <div className="main-block mt-6">
          <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
               <IconComponent name="info" size={16} />
             </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Как это работает?
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Когда товар, на который вы подписались, появится в наличии, 
                мы сразу уведомим вас. Вы сможете быстро оформить заказ, 
                пока товар снова не закончился.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage; 