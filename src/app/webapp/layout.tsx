"use client";

import { type PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import "@/styles/webapp.scss";
import { IconComponent } from "@/components/webapp/IconComponent";
import { CartSummary } from "./_components/CartSummary";
import { BottomNavigation } from "./_components/BottomNavigation";

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
      {/* Стили для устранения пустого пространства */}
      <style jsx global>{`
        html, body {
          height: auto !important;
          min-height: 0 !important;
          background-color: #f9f9f9 !important;
          margin: 0;
          padding: 0;
          overflow-y: auto;
        }
        
        #__next {
          height: auto !important;
          min-height: 0 !important;
        }
      `}</style>
      
      <div className={`webapp-container ${getPageClass()}`}>
      {/* Header точно как в Rails */}
      <header className="webapp-header">
        <div className="container-adaptive py-3">
          <div className="header-search">
            <input 
              type="search" 
              placeholder="Поиск товаров..." 
              className="block w-full pe-7 focus:border-none outline-none"
            />
            <button type="submit" className="block bg-transparent border-none">
              <IconComponent name="search" size={20} />
            </button>
          </div>
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