"use client";

import { Suspense, useEffect, useState } from "react";
import { ProductCatalog } from "./_components/ProductCatalog";
import { CartSummary } from "./_components/CartSummary";

export default function WebappHomePage() {
  const [showCartSummary, setShowCartSummary] = useState(false);

  // Функция для показа плашки корзины
  const handleAddToCart = () => {
    setShowCartSummary(true);
  };

  // Функция для скрытия плашки корзины
  const handleHideCartSummary = () => {
    setShowCartSummary(false);
  };

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

  return (
    <>
      {/* Page Title - точно как в Rails */}
      <h1>Каталог</h1>

      {/* Product Catalog */}
      <Suspense fallback={
        <div className="no-items-wrapper">
          <div className="w-full">
            <div className="flex justify-center text-gray-no-active w-full mb-1">
              <svg className="pointer-events-none" style={{ fill: "currentColor", width: 40, height: 40 }}>
                <circle cx="10" cy="10" r="8" />
              </svg>
            </div>
            <div className="no-items-title">Загрузка каталога...</div>
          </div>
        </div>
      }>
        <ProductCatalog onAddToCart={handleAddToCart} />
      </Suspense>

      {/* Cart Summary Notification */}
      <CartSummary 
        isVisible={showCartSummary} 
        onHide={handleHideCartSummary} 
      />
    </>
  );
} 