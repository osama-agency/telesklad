"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import usePurchaseCartStore from '@/lib/stores/purchaseCartStore';

export default function FloatingCart() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { items, totalItems, removeItem, updateItemQuantity, clearCart } = usePurchaseCartStore();

  const handleGoToPurchases = () => {
    router.push('/purchases');
  };

  if (totalItems === 0) {
    return null; // Не показываем корзину, если она пустая
  }

  return (
    <>
      {/* Плавающая кнопка корзины */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          
          {/* Счетчик товаров */}
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Боковая панель корзины */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Панель корзины */}
          <div className="absolute right-0 top-0 h-full w-96 bg-white dark:bg-gray-dark shadow-xl">
            <div className="flex flex-col h-full">
              {/* Заголовок */}
              <div className="flex items-center justify-between p-6 border-b border-stroke dark:border-dark-3">
                <h3 className="text-lg font-semibold text-dark dark:text-white">
                  Корзина закупки
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-dark-6 hover:text-dark dark:text-white/60 dark:hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Список товаров */}
              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="text-center text-dark-6 py-8">
                    Корзина пуста
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border border-stroke dark:border-dark-3 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-dark dark:text-white text-sm">
                            {item.name}
                          </h4>
                          {item.brand && (
                            <p className="text-xs text-dark-6">{item.brand}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.purchaseQuantity - 1)}
                            className="w-6 h-6 rounded border border-stroke dark:border-dark-3 flex items-center justify-center text-dark dark:text-white hover:bg-gray-2 dark:hover:bg-dark-3"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-dark dark:text-white">
                            {item.purchaseQuantity}
                          </span>
                          <button
                            onClick={() => updateItemQuantity(item.id, item.purchaseQuantity + 1)}
                            className="w-6 h-6 rounded border border-stroke dark:border-dark-3 flex items-center justify-center text-dark dark:text-white hover:bg-gray-2 dark:hover:bg-dark-3"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red hover:text-red/80 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Футер с действиями */}
              {items.length > 0 && (
                <div className="p-6 border-t border-stroke dark:border-dark-3">
                  <div className="space-y-3">
                    <div className="text-sm text-dark-6">
                      Всего товаров: {totalItems}
                    </div>
                    
                    <button
                      onClick={handleGoToPurchases}
                      className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      Оформить закупку
                    </button>
                    
                    <button
                      onClick={clearCart}
                      className="w-full bg-gray-2 dark:bg-dark-3 text-dark dark:text-white py-2 rounded-lg hover:bg-gray-3 dark:hover:bg-dark-2 transition-colors text-sm"
                    >
                      Очистить корзину
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
