"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/catalyst/button';
import { Input } from '@/components/catalyst/input';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';
import { useFavorites } from '@/context/FavoritesContext';
import { MiniSearchService, SearchProduct, convertProductToSearchFormat } from '@/lib/services/minisearch.service';
import { useDebounce } from '@/hooks/useDebounce';
import { 
  MagnifyingGlassIcon, 
  HeartIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export function TelegramHeader() {
  const router = useRouter();
  const { impactLight } = useTelegramHaptic();
  const { favoritesCount } = useFavorites();
  
  // Состояние для поиска
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const handleNavigation = (path: string) => {
    impactLight();
    router.push(path);
  };

  // Инициализация MiniSearch
  useEffect(() => {
    const initializeSearch = async () => {
      try {
        const response = await fetch('/api/webapp/products');
        const data = await response.json();
        
        if (data.success && data.products) {
          const searchProducts = data.products.map(convertProductToSearchFormat);
          MiniSearchService.initialize(searchProducts);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('❌ Failed to initialize search:', error);
      }
    };

    initializeSearch();
  }, []);

  // Поиск при изменении запроса
  useEffect(() => {
    if (!isInitialized || !debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = MiniSearchService.search(debouncedQuery, {
        limit: 8,
        inStockOnly: false
      });
      setResults(searchResults);
    } catch (error) {
      console.error('❌ Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, isInitialized]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(value.trim().length > 0);
  };

  const handleProductSelect = (product: SearchProduct) => {
    impactLight();
    setQuery('');
    setShowResults(false);
    router.push(`/webapp/products/${product.id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  // Закрытие результатов при клике вне области поиска
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Основной Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Поле поиска */}
            <div className="flex-1" ref={searchRef}>
              <div className="relative">
                <Input
                  value={query}
                  onChange={handleSearchChange}
                  placeholder="Поиск товаров..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-100 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-sm border-0 hover:bg-gray-50 focus:bg-white focus:shadow-lg"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200 pointer-events-none" />
                
                {/* Результаты поиска */}
                {showResults && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto border-0">
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        Поиск...
                      </div>
                    ) : results.length > 0 ? (
                      <div>
                        {results.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductSelect(product)}
                            className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={product.title}
                                  className="w-10 h-10 object-cover rounded border"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {product.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-semibold text-sm text-green-600">
                                    {formatPrice(product.price)} ₽
                                  </span>
                                  {product.old_price && product.old_price > product.price && (
                                    <span className="text-xs text-gray-400 line-through">
                                      {formatPrice(product.old_price)} ₽
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : query.trim() && (
                      <div className="p-4 text-center text-gray-500">
                        Ничего не найдено
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Избранное */}
              <Button
                plain
                onClick={() => handleNavigation('/webapp/favorites')}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {favoritesCount > 0 ? (
                  <HeartIconSolid className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 text-gray-600" />
                )}
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favoritesCount > 9 ? '9+' : favoritesCount}
                  </span>
                )}
              </Button>



              {/* Профиль */}
              <Button
                plain
                onClick={() => handleNavigation('/webapp/profile')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <UserIcon className="w-6 h-6 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>


    </>
  );
} 