"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InstantSearch, SearchBox, Hits, Configure } from 'react-instantsearch';
import { searchClient, ALGOLIA_INDEXES, AlgoliaProduct } from '@/lib/services/algolia.service';
import { IconComponent } from "@/components/webapp/IconComponent";

interface AlgoliaSearchComponentProps {
  onProductSelect?: (product: AlgoliaProduct) => void;
}

// Компонент для отображения товара в результатах поиска
function Hit({ hit }: { hit: AlgoliaProduct }) {
  const router = useRouter();

  const handleProductClick = () => {
    // Haptic feedback для мобильных устройств
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Навигация к странице товара
    router.push(`/webapp/products/${hit.id}`);
  };

  return (
    <div className="search-result-item" onClick={handleProductClick}>
      <div className="search-result-image">
        {hit.image_url ? (
          <img 
            src={hit.image_url} 
            alt={hit.name}
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder">
            <IconComponent name="image" size={24} />
          </div>
        )}
      </div>
      
      <div className="search-result-info">
        <div className="search-result-name">{hit.name}</div>
        {hit.category_name && (
          <div className="search-result-category">{hit.category_name}</div>
        )}
        <div className="search-result-price">
          <span className="price-current">{hit.price}₽</span>
          {hit.old_price && (
            <span className="price-old">{hit.old_price}₽</span>
          )}
        </div>
      </div>
      
      <IconComponent name="arrow-right" size={16} className="search-result-arrow" />
    </div>
  );
}

// Кастомный компонент поискового поля
function CustomSearchBox() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="header-search">
      <input
        ref={inputRef}
        type="text"
        placeholder="Поиск товаров..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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
        {query ? (
          <IconComponent name="close" size={20} />
        ) : (
          <IconComponent name="search" size={20} />
        )}
      </button>
    </div>
  );
}

// Кастомный компонент результатов
function CustomHits() {
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Закрытие dropdown при клике вне области
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef}>
      <Hits 
        hitComponent={Hit}
        classNames={{
          root: 'search-results-dropdown',
          list: 'search-results',
          item: 'search-result-item-wrapper'
        }}
      />
    </div>
  );
}

export function AlgoliaSearchComponent({ onProductSelect }: AlgoliaSearchComponentProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <InstantSearch 
      searchClient={searchClient} 
      indexName={ALGOLIA_INDEXES.PRODUCTS}
    >
      {/* Конфигурация поиска */}
      <Configure 
        hitsPerPage={10}
        filters="show_in_webapp:true AND is_in_stock:true"
      />

      <div className="algolia-search-wrapper">
        {/* Поисковое поле */}
        <SearchBox
          placeholder="Поиск товаров..."
          classNames={{
            root: 'header-search',
            form: 'search-form',
            input: 'block w-full pe-7 focus:border-none outline-none',
            submit: 'search-submit-btn',
            reset: 'search-reset-btn',
            submitIcon: 'search-submit-icon',
            resetIcon: 'search-reset-icon'
          }}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
        />

        {/* Результаты поиска */}
        {isSearchFocused && (
          <div className="search-results-dropdown">
            <Hits 
              hitComponent={Hit}
              classNames={{
                root: 'search-results-root',
                list: 'search-results',
                item: 'search-result-item-wrapper'
              }}
            />
          </div>
        )}
      </div>
    </InstantSearch>
  );
}

// Экспорт дефолтного компонента для совместимости
export default AlgoliaSearchComponent; 