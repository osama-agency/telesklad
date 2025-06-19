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
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative overflow-hidden bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#1A6DFF]/30"
        >
          <div className="relative z-10 flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          
          {/* Анимированный фон */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00C5FF] to-[#1A6DFF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Счетчик товаров */}
          {totalItems > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-7 w-7 flex items-center justify-center font-bold border-2 border-white shadow-lg animate-pulse">
              {totalItems > 99 ? '99+' : totalItems}
            </div>
          )}

          {/* Анимированный пульс */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] animate-ping opacity-20"></div>
        </button>
      </div>

      {/* Боковая панель корзины */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay с анимацией */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Панель корзины */}
          <div className="absolute right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-out">
            <div className="flex flex-col h-full">
              {/* Заголовок */}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#1A6DFF]/5 to-[#00C5FF]/5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1A6DFF] to-[#00C5FF] rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 8H6L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1E293B] dark:text-white">
                        Корзина закупки
                      </h3>
                      <p className="text-sm text-[#64748B] dark:text-gray-400">
                        {totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[#64748B] dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-[#1E293B] dark:hover:text-white transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Декоративная линия */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF]"></div>
              </div>

              {/* Список товаров */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC] dark:bg-gray-900">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#1A6DFF]/10 to-[#00C5FF]/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 8H6L5 9z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-[#1E293B] dark:text-white mb-2">
                      Корзина пуста
                    </h4>
                    <p className="text-[#64748B] dark:text-gray-400">
                      Добавьте товары для создания закупки
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 hover:shadow-lg transition-all duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[#1E293B] dark:text-white text-sm mb-1 truncate">
                              {item.name}
                            </h4>
                            {item.brand && (
                              <p className="text-xs text-[#64748B] dark:text-gray-400 mb-2">{item.brand}</p>
                            )}
                            
                            {/* Количество */}
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => updateItemQuantity(item.id, item.purchaseQuantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center text-[#64748B] dark:text-gray-400 hover:text-[#1A6DFF] hover:bg-[#1A6DFF]/10 transition-all duration-200"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                  </svg>
                                </button>
                                <div className="w-12 h-8 flex items-center justify-center">
                                  <span className="text-sm font-bold text-[#1E293B] dark:text-white">
                                    {item.purchaseQuantity}
                                  </span>
                                </div>
                                <button
                                  onClick={() => updateItemQuantity(item.id, item.purchaseQuantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center text-[#64748B] dark:text-gray-400 hover:text-[#1A6DFF] hover:bg-[#1A6DFF]/10 transition-all duration-200"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16M4 12h16" />
                                  </svg>
                                </button>
                              </div>
                              
                              <span className="text-xs text-[#64748B] dark:text-gray-400 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-lg">
                                шт.
                              </span>
                            </div>
                          </div>
                          
                          {/* Кнопка удаления */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Футер с действиями */}
              {items.length > 0 && (
                <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-4">
                    {/* Статистика */}
                    <div className="bg-gradient-to-r from-[#1A6DFF]/5 to-[#00C5FF]/5 rounded-xl p-4 border border-[#1A6DFF]/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#1A6DFF] to-[#00C5FF] rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">📦</span>
                          </div>
                          <span className="text-sm font-medium text-[#64748B] dark:text-gray-400">
                            Всего товаров:
                          </span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] bg-clip-text text-transparent">
                          {totalItems}
                        </span>
                      </div>
                    </div>
                    
                    {/* Кнопки действий */}
                    <div className="space-y-3">
                      <button
                        onClick={handleGoToPurchases}
                        className="group relative overflow-hidden w-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#1A6DFF]/30"
                      >
                        <span className="relative z-10 flex items-center justify-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span>Оформить закупку</span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#00C5FF] to-[#1A6DFF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                      
                      <button
                        onClick={clearCart}
                        className="w-full bg-gray-100 dark:bg-gray-700 text-[#64748B] dark:text-gray-300 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-[#1E293B] dark:hover:text-white transition-all duration-200 font-medium"
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Очистить корзину</span>
                        </span>
                      </button>
                    </div>
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
