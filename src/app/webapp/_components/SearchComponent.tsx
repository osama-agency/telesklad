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

export function SearchComponent({ onProductSelect }: SearchComponentProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/webapp/products/search?q=${encodeURIComponent(query)}&limit=10`);
        if (response.ok) {
          const products = await response.json();
          setResults(products);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search error:', error);
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
    inputRef.current?.focus();
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
          if (results.length > 0) {
            setIsOpen(true);
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
        className="block bg-transparent border-none"
        onClick={query ? clearSearch : undefined}
      >
        {isLoading ? (
          <div className="simple-spinner" style={{ width: 20, height: 20 }} />
        ) : query ? (
          <IconComponent name="close" size={20} />
        ) : (
          <IconComponent name="search" size={20} />
        )}
      </button>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="search-results-dropdown">
          {results.length > 0 ? (
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
            </div>
          ) : (
            <div className="search-no-results">
              <IconComponent name="search" size={48} className="search-no-results-icon" />
              <div className="search-no-results-title">Ничего не найдено</div>
              <div className="search-no-results-subtitle">
                Попробуйте изменить запрос или проверьте правильность написания
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 