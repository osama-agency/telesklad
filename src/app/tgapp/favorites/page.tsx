"use client";

import { useEffect, useState } from "react";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useBackButton } from "../_components/useBackButton";
import FavoriteButton from "../_components/FavoriteButton";
import { ProductActionButton } from "../_components/ProductActionButton";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
}

export default function TgappFavoritesPage() {
  const { user, isAuthenticated } = useTelegramAuth();
  const { favoriteIds, isLoading: favoritesLoading } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  // Показываем кнопку "Назад" в Telegram
  useBackButton(true);

  const loadFavoriteProducts = async () => {
    if (!isAuthenticated || !user?.tg_id || favoriteIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/webapp/favorites?tg_id=${user.tg_id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const mapped: Product[] = data.favorites.map((p: any) => ({
          id: p.product_id,
          name: p.title,
          price: p.price,
          image_url: p.image_url,
          stock_quantity: p.stock_quantity || 0,
        }));
        setProducts(mapped);
      } else {
        setProducts([]);
      }
    } catch (e) {
      console.error('Ошибка загрузки избранного:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем продукты когда изменяется список избранного
  useEffect(() => {
    if (!favoritesLoading) {
      loadFavoriteProducts();
    }
  }, [isAuthenticated, user?.tg_id, favoriteIds, favoritesLoading]);

  // Компонент загрузки с единым стилем
  if (loading || favoritesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 hide-scrollbar">
        <div className="tgapp-favorites">
          <h1 className="tgapp-favorites-title">Избранное</h1>
          <div className="tgapp-favorites-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800/60 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
                <Skeleton className="w-full aspect-square rounded-lg mb-3 dark:bg-gray-700/50" />
                <Skeleton className="h-4 w-3/4 mb-2 dark:bg-gray-700/50" />
                <Skeleton className="h-5 w-1/2 mb-3 dark:bg-gray-700/50" />
                <Skeleton className="h-10 w-full rounded-lg dark:bg-gray-700/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Состояние неавторизованного пользователя
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 hide-scrollbar">
        <div className="tgapp-favorites">
          <h1 className="tgapp-favorites-title">Избранное</h1>
          <div className="tgapp-favorites-grid">
            <div className="text-center px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gray-100 dark:bg-gray-800">
                <Heart className="w-10 h-10 text-gray-400 dark:text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-2">
                Войдите в аккаунт
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                Чтобы увидеть избранные товары
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Пустое состояние избранного
  if (favoriteIds.length === 0 || products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 hide-scrollbar">
        <div className="tgapp-favorites">
          <h1 className="tgapp-favorites-title">Избранное</h1>
          <div className="tgapp-favorites-grid">
            <div className="text-center px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-red-50 dark:bg-red-900/20">
                <Heart className="w-10 h-10 text-red-400 dark:text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-2">
                Избранное пусто
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6">
                Добавьте товары в избранное из каталога
              </p>
              <button
                onClick={() => window.location.href = '/tgapp/catalog'}
                className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium text-sm rounded-lg transition-all duration-200 active:scale-95"
              >
                Перейти в каталог
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Основное состояние с товарами
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 hide-scrollbar">
      <div className="tgapp-favorites">
        <h1 className="tgapp-favorites-title">Избранное</h1>
        <div className="tgapp-favorites-grid">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="group relative bg-white dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-black/20 transition-all duration-300 flex flex-col overflow-hidden backdrop-blur-sm"
            >
              {/* Кнопка избранного - абсолютное позиционирование */}
              <div className="absolute top-2 right-2 z-10">
                <FavoriteButton productId={product.id} />
              </div>
              
              {/* Сделаем кликабельной часть карточки (изображение + информация) */}
              <Link href={`/tgapp/products/${product.id}`} className="block flex-1" prefetch={false}>
                {/* Контейнер для изображения с правильными отступами */}
                <div className="p-4 pb-2">
                  <div className="relative w-full aspect-square bg-gray-50 dark:bg-gray-700/30 rounded-lg overflow-hidden">
                    <Image
                      src={product.image_url || '/images/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 50vw, 33vw"
                      loading="lazy"
                      quality={60}
                    />
                  </div>
                </div>
                
                {/* Информация о товаре с единым вертикальным ритмом */}
                <div className="flex flex-col flex-1 px-4 space-y-2 pb-4">
                  {/* Название товара */}
                  <h3 
                    className="text-sm font-medium text-gray-900 dark:text-gray-200 line-clamp-2 min-h-[2.5rem] leading-tight"
                    title={product.name}
                  >
                    {product.name}
                  </h3>
                  
                  {/* Цена */}
                  <p className="text-lg font-bold text-webapp-brand dark:text-webapp-brand">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </Link>

              {/* Кнопка действия (корзина или подписка) - выровнена по низу */}
              <div className="px-4 pb-4 mt-auto">
                <ProductActionButton
                  productId={product.id}
                  productName={product.name}
                  productPrice={product.price}
                  stockQuantity={product.stock_quantity || 0}
                  maxQuantity={product.stock_quantity || 10}
                  imageUrl={product.image_url}
                  initiallySubscribed={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}