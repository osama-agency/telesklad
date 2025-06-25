"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { 
  InstantSearch, 
  SearchBox, 
  Hits, 
  Configure, 
  Stats,
  ClearRefinements,
  RefinementList,
  CurrentRefinements
} from 'react-instantsearch';
import { searchClient, ALGOLIA_INDEXES, AlgoliaProduct } from '@/lib/services/algolia.service';
import { IconComponent } from "@/components/webapp/IconComponent";

interface AlgoliaSearchPageProps {
  initialQuery?: string;
}

// Компонент для отображения товара в результатах поиска
function ProductHit({ hit }: { hit: AlgoliaProduct }) {
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
    <div className="product-card" onClick={handleProductClick}>
      <div className="product-image-wrapper">
        {hit.image_url ? (
          <img 
            src={hit.image_url} 
            alt={hit.name}
            className="product-image"
            loading="lazy"
          />
        ) : (
          <div className="product-image-placeholder">
            <IconComponent name="image" size={32} />
          </div>
        )}
        
        {/* Показываем статус наличия */}
        {hit.is_in_stock ? (
          <div className="stock-indicator in-stock">В наличии</div>
        ) : (
          <div className="stock-indicator out-of-stock">Нет в наличии</div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{hit.name}</h3>
        
        {hit.category_name && (
          <div className="product-category">{hit.category_name}</div>
        )}
        
        <div className="product-pricing">
          <span className="current-price">{hit.price}₽</span>
          {hit.old_price && hit.old_price > hit.price && (
            <span className="old-price">{hit.old_price}₽</span>
          )}
        </div>
        
        {/* Показываем количество в наличии */}
        <div className="stock-info">
          Осталось: {hit.stock_quantity} шт.
        </div>
      </div>
    </div>
  );
}

// Кастомный компонент статистики
function SearchStats() {
  return (
    <Stats
      classNames={{
        root: 'search-stats'
      }}
      translations={{
        rootElementText: ({ nbHits, processingTimeMS }) => {
          if (nbHits === 0) return "Ничего не найдено";
          const hitsText = nbHits === 1 ? 'товар' : nbHits < 5 ? 'товара' : 'товаров';
          return `Найдено ${nbHits} ${hitsText} за ${processingTimeMS}мс`;
        }
      }}
    />
  );
}

// Компонент "Ничего не найдено"
function NoResults() {
  const router = useRouter();
  
  return (
    <div className="search-no-results-page">
      <div className="search-no-results-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h2 className="search-no-results-title">Ничего не найдено</h2>
      <p className="search-no-results-subtitle">
        Попробуйте изменить поисковый запрос или воспользуйтесь категориями
      </p>
      <button 
        onClick={() => router.push('/webapp')}
        className="search-back-button"
      >
        Вернуться к каталогу
      </button>
    </div>
  );
}

// Кастомный компонент результатов с обработкой пустых результатов
function SearchResults() {
  return (
    <Hits
      hitComponent={ProductHit}
      classNames={{
        root: 'search-results-grid',
        list: 'products-grid',
        item: 'product-grid-item'
      }}
    />
  );
}

export function AlgoliaSearchPage({ initialQuery = "" }: AlgoliaSearchPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || initialQuery;

  // Set document title
  useEffect(() => {
    document.title = query ? `Поиск: ${query}` : "Поиск товаров";
    
    // Telegram Web App initialization
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#FFFFFF');
      tg.setBackgroundColor('#f9f9f9');
    }
  }, [query]);

  return (
    <div className="webapp-container search-page">
      <InstantSearch 
        searchClient={searchClient} 
        indexName={ALGOLIA_INDEXES.PRODUCTS}
        initialUiState={{
          [ALGOLIA_INDEXES.PRODUCTS]: {
            query: query
          }
        }}
      >
        {/* Конфигурация поиска */}
        <Configure 
          hitsPerPage={20}
          filters="show_in_webapp:true"
        />

        {/* Заголовок страницы поиска */}
        <div className="search-header-section">
          <div className="search-query-info">
            <h1>Результаты поиска</h1>
            {query && (
              <p className="search-query">&ldquo;{query}&rdquo;</p>
            )}
            <SearchStats />
          </div>
        </div>

        {/* Поисковое поле */}
        <div className="search-input-section">
          <SearchBox
            placeholder="Поиск товаров..."
            classNames={{
              root: 'search-box-wrapper',
              form: 'search-form',
              input: 'search-input',
              submit: 'search-submit-btn',
              reset: 'search-reset-btn',
              submitIcon: 'search-submit-icon',
              resetIcon: 'search-reset-icon'
            }}
            autoFocus={!query}
          />
        </div>

        {/* Фильтры и текущие рефайнменты */}
        <div className="search-filters-section">
          <CurrentRefinements
            classNames={{
              root: 'current-refinements',
              list: 'current-refinements-list',
              item: 'current-refinement-item',
              label: 'current-refinement-label',
              category: 'current-refinement-category',
              categoryLabel: 'current-refinement-category-label',
              delete: 'current-refinement-delete'
            }}
          />
          
          <div className="refinement-controls">
            <RefinementList
              attribute="category_name"
              classNames={{
                root: 'refinement-list',
                list: 'refinement-items',
                item: 'refinement-item',
                selectedItem: 'refinement-item--selected',
                label: 'refinement-label',
                checkbox: 'refinement-checkbox',
                labelText: 'refinement-text',
                count: 'refinement-count'
              }}
              limit={10}
              translations={{
                showMoreButtonText: ({ isShowingMore }) =>
                  isShowingMore ? 'Показать меньше' : 'Показать больше'
              }}
            />
            
            <ClearRefinements
              classNames={{
                root: 'clear-refinements',
                button: 'clear-refinements-button',
                disabledButton: 'clear-refinements-button--disabled'
              }}
              translations={{
                resetButtonText: 'Сбросить фильтры'
              }}
            />
          </div>
        </div>

        {/* Результаты поиска */}
        <div className="search-content-section">
          <SearchResults />
        </div>

      </InstantSearch>
    </div>
  );
}

export default AlgoliaSearchPage; 