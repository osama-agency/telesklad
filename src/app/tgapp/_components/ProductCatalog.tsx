"use client";

import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import FavoriteButton from "./FavoriteButton";
import { useProductsWithSubscriptions } from "@/hooks/useProductsWithSubscriptions";
import Link from "next/link";
import { memo } from "react";
import dynamic from "next/dynamic";

// Динамический импорт тяжелого компонента
const ProductActionButton = dynamic(
  () => import("./ProductActionButton").then(m => ({ default: m.ProductActionButton })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
    )
  }
);

// Мемоизированная карточка товара
const ProductCard = memo(function ProductCard({ product }: { product: any }) {
  return (
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
          initiallySubscribed={product.isSubscribed}
        />
      </div>
    </div>
  );
});

export default function ProductCatalog({ search, category }: { search?: string; category?: string | null }) {
  // Хук теперь принимает параметры поиска и категории
  const { products, loading, error } = useProductsWithSubscriptions(category || undefined, search);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800/60 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
            <Skeleton className="w-full aspect-square rounded-lg mb-3 dark:bg-gray-700/50" />
            <Skeleton className="h-4 w-3/4 mb-2 dark:bg-gray-700/50" />
            <Skeleton className="h-5 w-1/2 mb-3 dark:bg-gray-700/50" />
            <Skeleton className="h-10 w-full rounded-lg dark:bg-gray-700/50" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      
      {products.length === 0 && (
        <div className="col-span-2 text-center py-12">
          <div className="text-gray-400 dark:text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Нет товаров
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Попробуйте изменить поисковый запрос
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 