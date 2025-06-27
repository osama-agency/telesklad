"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import FavoriteButton from "../../_components/FavoriteButton";
import { ProductActionButton } from "../../_components/ProductActionButton";
import { useBackButton } from "../../_components/useBackButton";
import { ArrowLeft, Package } from "lucide-react";
import dynamic from "next/dynamic";

// Динамические импорты крупногабаритных компонентов (ленивая загрузка)
const TgReviewsList = dynamic<any>(
  () => import("../../_components/TgReviewsList"),
  { ssr: false }
) as any;
const TgReviewForm = dynamic<any>(
  () => import("../../_components/TgReviewForm"),
  { ssr: false }
) as any;

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  brand?: string;
  weight?: string;
  dosage_form?: string;
  package_quantity?: string;
  main_ingredient?: string;
  description?: string;
  image_url?: string;
  isSubscribed?: boolean; // приходит из /products/{id} в новом API
}

export default function TgProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  // Показываем кнопку «Назад»
  useBackButton(true, () => router.back());

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0);

  /* ------------------------- fetch product ------------------------- */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const resp = await fetch(`/api/webapp/products/${productId}`);
        if (!resp.ok) throw new Error("Product not found");
        const data = await resp.json();
        setProduct(data);
      } catch (e: any) {
        setError(e.message || "Ошибка загрузки товара");
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  /* --------------------------- handlers --------------------------- */
  const handleReviewFormShow = () => setShowReviewForm(true);
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setReviewsKey((k) => k + 1);
  };
  const handleReviewCancel = () => setShowReviewForm(false);

  /* ----------------------------- UI ------------------------------- */
  
  // Состояние загрузки
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        {/* Фиксированный заголовок */}
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-200">Товар</h1>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Загрузка товара...</p>
          </div>
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (error || !product) {
    return (
      <div className="flex flex-col h-full">
        {/* Фиксированный заголовок */}
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-200">Ошибка</h1>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-red-50 dark:bg-red-900/20">
              <Package className="w-10 h-10 text-red-400 dark:text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-2">
              {error || "Товар не найден"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6">
              Проверьте правильность ссылки или попробуйте позже
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium text-sm rounded-lg transition-all duration-200 active:scale-95"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  const discountPercent =
    product.old_price && product.old_price > product.price
      ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
      : null;

  const properties = [
    { key: "brand", label: "Производитель", value: product.brand },
    { key: "weight", label: "Вес", value: product.weight },
    { key: "dosage_form", label: "Форма выпуска", value: product.dosage_form },
    { key: "package_quantity", label: "Количество в упаковке", value: product.package_quantity },
    { key: "main_ingredient", label: "Основное вещество", value: product.main_ingredient },
  ].filter((p) => p.value);

  // Основное состояние с товаром
  return (
    <div className="flex flex-col h-full">
      {/* Фиксированный заголовок */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-200 line-clamp-1">
            {product.name}
          </h1>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className="px-4 py-4 space-y-6">
          {/* Изображение товара */}
          <div className="relative">
            <div className="relative w-full bg-gray-50 dark:bg-gray-700/30 rounded-xl overflow-hidden" style={{ aspectRatio: '1' }}>
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-contain"
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 600px"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400 dark:text-gray-600">
                  <Package className="w-16 h-16" />
                </div>
              )}
            </div>
            {/* Кнопка избранного */}
            <div className="absolute top-3 right-3 z-10">
              <FavoriteButton productId={product.id} />
            </div>
          </div>

          {/* Основная информация о товаре */}
          <div className="bg-white dark:bg-gray-800/60 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm space-y-4">
            {/* Название и наличие */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200 leading-tight">
                {product.name}
              </h2>
              {product.stock_quantity > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    В наличии ({product.stock_quantity} шт.)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Нет в наличии
                  </span>
                </div>
              )}
            </div>

            {/* Цена и скидка */}
            {product.stock_quantity > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-webapp-brand dark:text-webapp-brand">
                    {product.price.toLocaleString("ru-RU")} ₽
                  </span>
                  {discountPercent && (
                    <span className="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
                {product.old_price && (
                  <span className="text-lg line-through text-gray-400 dark:text-gray-500">
                    {product.old_price.toLocaleString("ru-RU")} ₽
                  </span>
                )}
              </div>
            )}

            {/* Кнопка действия */}
            <ProductActionButton
              productId={product.id}
              productName={product.name}
              productPrice={product.price}
              stockQuantity={product.stock_quantity}
              maxQuantity={product.stock_quantity || 10}
              imageUrl={product.image_url}
              initiallySubscribed={product.isSubscribed}
              className="w-full"
            />
          </div>

          {/* Свойства товара */}
          {properties.length > 0 && (
            <div className="bg-white dark:bg-gray-800/60 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm space-y-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200">О товаре</h3>
              <div className="space-y-3">
                {properties.map((prop) => (
                  <div key={prop.key} className="flex justify-between items-start gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {prop.label}:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-200 text-right">
                      {prop.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Описание */}
          {product.description && (
            <div className="bg-white dark:bg-gray-800/60 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm space-y-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200">Описание</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Отзывы */}
          <div className="bg-white dark:bg-gray-800/60 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
            {showReviewForm ? (
              <TgReviewForm
                productId={product.id}
                productName={product.name}
                onSuccess={handleReviewSuccess}
                onCancel={handleReviewCancel}
              />
            ) : (
              <TgReviewsList
                key={reviewsKey}
                productId={product.id}
                onReviewCreate={handleReviewFormShow}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 