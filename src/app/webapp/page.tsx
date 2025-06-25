"use client";

import { Suspense, useEffect } from "react";
import { ProductCatalog } from "./_components/ProductCatalog";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import SkeletonLoading from "./_components/SkeletonLoading";

export default function WebappHomePage() {
  const { user, isLoading, isAuthenticated } = useTelegramAuth();

  // Set document title for Telegram Web App
  useEffect(() => {
    document.title = "Каталог товаров";
    
    // Telegram Web App initialization
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#FFFFFF');
      tg.setBackgroundColor('#f9f9f9');
    }
  }, []);

  // Показываем загрузку пока идет аутентификация
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <SkeletonLoading type="catalog" />
      </div>
    );
  }

  // Показываем ошибку если пользователь не аутентифицирован
  if (!isAuthenticated) {
    return (
      <div className="no-items-wrapper">
        <div className="w-full">
          <div className="flex justify-center text-red-500 w-full mb-1">
            <svg className="pointer-events-none" style={{ fill: "currentColor", width: 40, height: 40 }}>
              <circle cx="20" cy="20" r="18" />
            </svg>
          </div>
          <div className="no-items-title">Ошибка аутентификации</div>
          <div className="text-center text-sm text-gray-500 mt-2">
            Пожалуйста, запустите приложение из Telegram
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="container-adaptive">
        {/* Product Catalog - показываем всегда, как в старом Rails приложении */}
        <Suspense fallback={
          <div className="min-h-screen bg-[#F8F9FA]">
            <SkeletonLoading type="catalog" />
          </div>
        }>
          <ProductCatalog showSearch={true} />
        </Suspense>
      </main>
    </>
  );
} 