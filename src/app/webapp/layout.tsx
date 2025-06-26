"use client";

import { type PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import "@/styles/webapp.scss";
import "@/css/golos.css";
import { IconComponent } from "@/components/webapp/IconComponent";
import { TelegramHeader } from "./_components/TelegramHeader";
import TelegramCartButton from "./_components/TelegramCartButton";

import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { TelegramBackButton } from "./_components/TelegramBackButton";
import { TelegramOutlineRemover } from "./_components/TelegramOutlineRemover";

function WebappLayoutInner({ children }: PropsWithChildren) {
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
        
        {/* Принудительное удаление outline стилей */}
        <TelegramOutlineRemover />
        
        {/* Универсальный Header с поиском и кнопками */}
        <TelegramHeader />
        
        <div className={`webapp-container ${getPageClass()}`} style={{
          minHeight: '100vh',
          backgroundColor: '#f9f9f9'
        }}>
          {/* Main content */}
          {children}

          {/* Telegram Cart Button - показывается когда есть товары в корзине */}
          <TelegramCartButton />
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