"use client";

import { type PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import "@/styles/webapp.scss";
import { IconComponent } from "@/components/webapp/IconComponent";
import { CartSummary } from "./_components/CartSummary";
import { BottomNavigation } from "./_components/BottomNavigation";
import { SearchComponent } from "./_components/SearchComponent";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { FavoritesProvider, useFavorites } from "@/context/FavoritesContext";
import { TelegramBackButton } from "./_components/TelegramBackButton";

function WebappLayoutInner({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { hasFavorites } = useFavorites();
  
  // Определяем класс страницы на основе пути
  const getPageClass = () => {
    if (pathname === "/webapp") return "catalog-page";
    if (pathname.startsWith("/webapp/favorites")) return "favorites-page";
    if (pathname.startsWith("/webapp/cart")) return "cart-page";
    if (pathname.startsWith("/webapp/profile")) return "profile-page";
    if (pathname.startsWith("/webapp/support")) return "support-page";
    return "";
  };

  // Определяем нужно ли показывать нижнее меню (скрываем на странице корзины)
  const shouldShowBottomNavigation = !pathname.startsWith("/webapp/cart");
  
  // Определяем нужно ли показывать поиск
  const shouldShowSearch = pathname === "/webapp" || 
    (pathname.startsWith("/webapp/favorites") && hasFavorites);
  
  console.log('🔍 Layout search logic:', { 
    pathname, 
    hasFavorites, 
    shouldShowSearch 
  });

  return (
    <>
      {/* Telegram WebApp SDK */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('📱 Telegram WebApp script loaded');
          if (window.Telegram?.WebApp) {
            console.log('✅ Telegram WebApp available:', (window.Telegram.WebApp as any).version || 'unknown');
          } else {
            console.error('❌ Telegram WebApp not found after script load');
          }
        }}
        onError={(e) => {
          console.error('❌ Failed to load Telegram WebApp script:', e);
        }}
      />
      
      <>
        {/* Глобальная кнопка "Назад" от Telegram SDK */}
        <TelegramBackButton />
        
        <div className={`webapp-container ${getPageClass()}`} style={{
          minHeight: '100vh',
          backgroundColor: '#f9f9f9'
        }}>
          {/* Header точно как в Rails */}
          <header className="webapp-header">
            <div className="container-adaptive py-3">
              {shouldShowSearch && <SearchComponent />}
            </div>
          </header>

          {/* Main content - точно как в Rails с отступами */}
          <main className="container-adaptive">
            {children}
          </main>

          {/* Cart Summary - глобально для всех страниц */}
          <CartSummary />

          {/* Fixed bottom navigation - скрываем на странице корзины */}
          {shouldShowBottomNavigation && <BottomNavigation />}
        </div>
      </>
    </>
  );
}

export default function WebappLayout({ children }: PropsWithChildren) {
  return (
    <TelegramAuthProvider>
      <FavoritesProvider>
        <WebappLayoutInner>{children}</WebappLayoutInner>
      </FavoritesProvider>
    </TelegramAuthProvider>
  );
}