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
    
          // Telegram Web App initialization with modern UX/UI 2025
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp as any;
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#FFFFFF');
        tg.setBackgroundColor('#F9FAFB'); // Современный светлый фон
        
        // Включаем современные возможности Telegram WebApp (если доступны)
        try {
          if (tg.enableClosingConfirmation) {
            tg.enableClosingConfirmation();
          }
          if (tg.disableVerticalSwipes) {
            tg.disableVerticalSwipes();
          }
        } catch (e) {
          console.log('Some Telegram WebApp features not available:', e);
        }
      }
  }, []);

  // Modern loading state with glassmorphism
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-100">
        <div className="backdrop-blur-sm bg-white/80 min-h-screen">
          <SkeletonLoading type="catalog" />
        </div>
      </div>
    );
  }

  // ВРЕМЕННО ОТКЛЮЧЕНО ДЛЯ ТЕСТИРОВАНИЯ
  // Показываем ошибку если пользователь не аутентифицирован
  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen bg-[#F9F9F9] px-4 py-6">
  //       <div className="flex flex-col items-center justify-center space-y-2">
  //         <div className="flex justify-center text-red-500 mb-6">
  //           <svg className="pointer-events-none" style={{ fill: "currentColor", width: 40, height: 40 }}>
  //             <circle cx="20" cy="20" r="18" />
  //           </svg>
  //         </div>
  //         <div className="text-xl font-semibold text-center">Ошибка аутентификации</div>
  //         <div className="text-center text-sm text-gray-500">
  //           Пожалуйста, запустите приложение из Telegram
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-gray-100">
      {/* Modern glassmorphism container */}
      <div className="backdrop-blur-sm bg-white/60 min-h-screen">
        {/* Product Catalog with modern spacing and animations */}
        <div className="mx-auto max-w-md">
          <Suspense fallback={
            <div className="min-h-screen animate-pulse">
              <SkeletonLoading type="catalog" />
            </div>
          }>
            <ProductCatalog />
          </Suspense>
        </div>
      </div>
    </main>
  );
} 