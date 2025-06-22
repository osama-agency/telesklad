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

export default function WebappLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  
  // Определяем класс страницы на основе пути
  const getPageClass = () => {
    if (pathname === "/webapp") return "catalog-page";
    if (pathname.startsWith("/webapp/favorites")) return "favorites-page";
    if (pathname.startsWith("/webapp/cart")) return "cart-page";
    if (pathname.startsWith("/webapp/profile")) return "profile-page";
    return "";
  };

  return (
    <>
      {/* Telegram WebApp SDK */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('📱 Telegram WebApp script loaded');
        }}
        onError={(e) => {
          console.error('❌ Failed to load Telegram WebApp script:', e);
        }}
      />
      
      <div className={`webapp-container ${getPageClass()}`} style={{
        minHeight: '100vh',
        backgroundColor: '#f9f9f9'
      }}>
        {/* Header точно как в Rails */}
        <header className="webapp-header">
          <div className="container-adaptive py-3">
            <SearchComponent />
          </div>
        </header>

        {/* Main content - точно как в Rails с отступами */}
        <main className="container-adaptive">
          {children}
        </main>

        {/* Cart Summary - глобально для всех страниц */}
        <CartSummary />

        {/* Fixed bottom navigation - динамическое с активной страницей */}
        <BottomNavigation />
      </div>
    </>
  );
} 