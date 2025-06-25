"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconComponent } from "@/components/webapp/IconComponent";

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  category_name?: string;
  image_url?: string;
  image_url_fallback?: string;
}

interface SearchComponentProps {
  onProductSelect?: (product: Product) => void;
}

// Красивый компонент загрузки
function SearchLoadingSpinner() {
  return (
    <div className="search-loading-spinner">
      <div className="spinner-container">
        <div className="spinner-ring"></div>
        <div className="spinner-text">Поиск...</div>
      </div>
      <style jsx>{`
        .search-loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .spinner-ring {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #48C928;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .spinner-text {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function SearchComponent({ onProductSelect }: SearchComponentProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setHasSearched(true);
      try {
        console.log('🔍 Searching for:', query);
        const response = await fetch(`/api/webapp/products/search?q=${encodeURIComponent(query)}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 Search results:', data);
          
          // Проверяем структуру ответа
          const products = data.products || data || [];
          setResults(products);
          setIsOpen(true);
        } else {
          console.error('Search API error:', response.status);
          setResults([]);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductClick = (product: Product) => {
    // Haptic feedback для мобильных устройств
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Очищаем поиск при переходе к товару
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onProductSelect?.(product);
    
    // Навигация к странице товара
    router.push(`/webapp/products/${product.id}`);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleSearchPageRedirect = () => {
    if (query.trim()) {
      router.push(`/webapp/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="header-search" ref={searchRef}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Поиск товаров..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length > 0 || (hasSearched && query.length >= 2)) {
            setIsOpen(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && query.trim()) {
            handleSearchPageRedirect();
          }
        }}
        className="block w-full pe-7 focus:border-none outline-none"
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'textfield'
        }}
      />
      
      <button 
        type="button" 
        className="block bg-transparent border-none search-icon-button"
        onClick={query ? clearSearch : undefined}
      >
        {isLoading ? (
          <div className="search-loading-icon">
            <div className="spinner-mini"></div>
            <style jsx>{`
              .search-loading-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
              }
              
              .spinner-mini {
                width: 16px;
                height: 16px;
                border: 2px solid #f3f3f3;
                border-top: 2px solid #48C928;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              }
              
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : query ? (
          <IconComponent name="close" size={20} />
        ) : (
          <IconComponent name="search" size={20} />
        )}
      </button>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="search-results-dropdown">
          {isLoading ? (
            <SearchLoadingSpinner />
          ) : results.length > 0 ? (
            <div className="search-results">
              {results.map((product) => (
                <div
                  key={product.id}
                  className="search-result-item"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="search-result-image">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          if (product.image_url_fallback) {
                            (e.target as HTMLImageElement).src = product.image_url_fallback;
                          }
                        }}
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <IconComponent name="image" size={24} />
                      </div>
                    )}
                  </div>
                  
                  <div className="search-result-info">
                    <div className="search-result-name">{product.name}</div>
                    {product.category_name && (
                      <div className="search-result-category">{product.category_name}</div>
                    )}
                    <div className="search-result-price">
                      <span className="price-current">{product.price}₽</span>
                      {product.old_price && (
                        <span className="price-old">{product.old_price}₽</span>
                      )}
                    </div>
                  </div>
                  
                  <IconComponent name="arrow-right" size={16} className="search-result-arrow" />
                </div>
              ))}
              
              {query.length >= 2 && (
                <div className="search-result-footer">
                  <button
                    onClick={handleSearchPageRedirect}
                    className="search-view-all-button"
                    type="button"
                    aria-label={`Посмотреть все результаты для запроса ${query}`}
                  >
                    <div className="search-button-icon">
                      <IconComponent name="search" size={16} />
                    </div>
                    <div className="search-button-text">
                      <span className="search-button-action">Посмотреть все результаты</span>
                      <span className="search-button-query">
                        для "<span className="search-query-highlight">{query}</span>"
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : hasSearched && query.length >= 2 ? (
            <div className="search-no-results">
              <div className="search-no-results-content">
                <IconComponent name="search" size={32} className="search-no-results-icon" />
                <div className="search-no-results-title">Ничего не найдено</div>
                <div className="search-no-results-subtitle">
                  Попробуйте изменить запрос или проверьте правильность написания
                </div>
                {query.length >= 2 && (
                  <button
                    onClick={handleSearchPageRedirect}
                    className="search-try-advanced-button"
                    type="button"
                    aria-label="Перейти к расширенному поиску"
                  >
                    <span className="search-advanced-text">Перейти к расширенному поиску</span>
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
} 