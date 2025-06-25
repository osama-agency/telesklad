"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import algoliasearch from 'algoliasearch/lite';
import { 
  InstantSearch, 
  SearchBox, 
  Hits, 
  Configure,
  useSearchBox,
  useHits,
  useInstantSearch
} from 'react-instantsearch';
import { IconComponent } from '@/components/webapp/IconComponent';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';
import Link from 'next/link';

// Algolia клиент с fallback
const searchClient = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID 
  ? algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
      process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ''
    )
  : null;

const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PRODUCTS || 'nextadmin_products';

interface Product {
  objectID: string;
  id: number;
  name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  image_url?: string;
  category_name?: string;
}

// Кастомный SearchBox с современным дизайном
function CustomSearchBox({ onFocus, onBlur }: { onFocus: () => void; onBlur: () => void }) {
  const { query, refine, clear } = useSearchBox();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { impactLight } = useTelegramHaptic();

  const handleClear = () => {
    clear();
    onBlur();
    impactLight();
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
  };

  const handleBlur = () => {
    // Небольшая задержка для обработки кликов по результатам
    setTimeout(() => {
      setIsFocused(false);
      if (!query) onBlur();
    }, 150);
  };

  return (
    <div className={`algolia-search-box ${isFocused ? 'focused' : ''}`}>
      <div className="search-icon-wrapper">
        <IconComponent name="search" size={20} />
      </div>
      
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          refine(e.target.value);
          if (e.target.value.length >= 2) {
            onFocus();
          } else {
            onBlur();
          }
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Поиск лекарств и витаминов..."
        className="search-input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="clear-button"
          aria-label="Очистить поиск"
        >
          <IconComponent name="close" size={18} />
        </button>
      )}
    </div>
  );
}

// Компонент для отображения результатов
function SearchResults({ onProductClick }: { onProductClick: () => void }) {
  const { hits, results } = useHits<Product>();
  const { status } = useInstantSearch();
  const router = useRouter();
  const { impactLight, impactMedium } = useTelegramHaptic();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleProductClick = (productId: number) => {
    impactMedium();
    onProductClick();
    router.push(`/webapp/products/${productId}`);
  };

  const handleImageError = (objectID: string) => {
    setImageErrors(prev => new Set(prev).add(objectID));
  };

  // Показываем состояние загрузки
  if (status === 'loading' || status === 'stalled') {
    return (
      <div className="search-results-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
        </div>
        <p>Поиск товаров...</p>
      </div>
    );
  }

  // Показываем результаты
  if (hits.length > 0) {
    return (
      <div className="search-results-container">
        <div className="search-results-header">
          <h3>Найдено товаров: {results?.nbHits || 0}</h3>
          {results && results.nbHits > hits.length && (
            <Link 
              href={`/webapp/search?q=${results.query}`}
              className="view-all-link"
              onClick={() => {
                impactLight();
                onProductClick();
              }}
            >
              Показать все
              <IconComponent name="arrow-right" size={16} />
            </Link>
          )}
        </div>
        
        <div className="search-results-grid">
          {hits.map((hit) => (
            <div
              key={hit.objectID}
              className="search-result-card"
              onClick={() => handleProductClick(hit.id)}
            >
              <div className="result-image">
                {hit.image_url && !imageErrors.has(hit.objectID) ? (
                  <img
                    src={hit.image_url}
                    alt={hit.name}
                    onError={() => handleImageError(hit.objectID)}
                    loading="lazy"
                  />
                ) : (
                  <div className="image-placeholder">
                    <IconComponent name="image" size={24} />
                  </div>
                )}
              </div>
              
              <div className="result-content">
                <h4 className="result-name">{hit.name}</h4>
                
                {hit.category_name && (
                  <p className="result-category">
                    <IconComponent name="tag" size={12} />
                    {hit.category_name}
                  </p>
                )}
                
                <div className="result-footer">
                  <div className="result-price">
                    <span className="price-current">{hit.price}₽</span>
                    {hit.old_price && (
                      <span className="price-old">{hit.old_price}₽</span>
                    )}
                  </div>
                  
                  <div className={`stock-badge ${hit.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {hit.stock_quantity > 0 ? 'В наличии' : 'Нет'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Пустые результаты
  if (results?.query && hits.length === 0) {
    return (
      <div className="search-no-results">
        <div className="no-results-icon">
          <IconComponent name="search-x" size={48} />
        </div>
        <h3>Ничего не найдено</h3>
        <p>По запросу «{results.query}» товаров не найдено</p>
        <button
          onClick={() => {
            impactLight();
            router.push('/webapp');
          }}
          className="back-to-catalog"
        >
          Вернуться в каталог
        </button>
      </div>
    );
  }

  return null;
}

// Fallback поиск без Algolia
function FallbackSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { impactLight, impactMedium } = useTelegramHaptic();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне области поиска
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/webapp/products/search?q=${encodeURIComponent(query)}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.products || []);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    impactLight();
    inputRef.current?.focus();
  };

  const handleProductClick = (productId: number) => {
    impactMedium();
    setIsOpen(false);
    setIsFocused(false);
    router.push(`/webapp/products/${productId}`);
  };

  return (
    <div className="algolia-modern-search fallback-mode" ref={searchRef}>
      <div className={`algolia-search-box ${isFocused ? 'focused' : ''}`}>
        <div className="search-icon-wrapper">
          <IconComponent name="search" size={20} />
        </div>
        
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (query.length >= 2) setIsOpen(true);
          }}
          onBlur={() => {
            // Небольшая задержка для обработки кликов по результатам
            setTimeout(() => setIsFocused(false), 150);
          }}
          placeholder="Поиск лекарств и витаминов..."
          className="search-input"
          autoComplete="off"
        />
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="clear-button"
            aria-label="Очистить поиск"
          >
            <IconComponent name="close" size={18} />
          </button>
        )}
      </div>

      {/* Результаты поиска */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="search-dropdown">
          {loading ? (
            <div className="search-results-loading">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
              </div>
              <p>Поиск товаров...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="search-results-container">
              <div className="search-results-header">
                <h3>Найдено: {results.length}</h3>
                {results.length >= 10 && (
                  <Link 
                    href={`/webapp/search?q=${query}`}
                    className="view-all-link"
                    onClick={() => {
                      impactLight();
                      setIsOpen(false);
                      setIsFocused(false);
                    }}
                  >
                    Показать все
                    <IconComponent name="arrow-right" size={16} />
                  </Link>
                )}
              </div>
              
              <div className="search-results-list">
                {results.map((product) => (
                  <div
                    key={product.id}
                    className="search-result-item"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="result-image-small">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <div className="image-placeholder">
                          <IconComponent name="image" size={20} />
                        </div>
                      )}
                    </div>
                    
                    <div className="result-content">
                      <h4 className="result-name">{product.name}</h4>
                      <div className="result-meta">
                        <span className="price-current">{product.price}₽</span>
                        <span className={`stock-status ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {product.stock_quantity > 0 ? '● В наличии' : '○ Нет'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : query.length >= 2 ? (
            <div className="search-no-results">
              <IconComponent name="search-x" size={32} />
              <p>Ничего не найдено</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Основной компонент
export function AlgoliaModernSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне и по ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen]);

  // Если Algolia не настроена, используем fallback
  if (!searchClient) {
    return <FallbackSearch />;
  }

  return (
    <div className="algolia-modern-search" ref={searchRef}>
      <InstantSearch searchClient={searchClient} indexName={indexName}>
        <Configure hitsPerPage={10} />
        
        <div className="search-wrapper">
          <CustomSearchBox 
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
          />
        </div>
        
        {isOpen && (
          <div className="search-dropdown">
            <SearchResults onProductClick={() => setIsOpen(false)} />
          </div>
        )}
      </InstantSearch>
    </div>
  );
}
