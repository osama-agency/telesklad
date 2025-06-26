"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { IconComponent } from "@/components/webapp/IconComponent";
import { Badge } from "@/components/ui/badge";

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

interface ModernSearchDialogProps {
  onProductSelect?: (product: Product) => void;
}

export function ModernSearchDialog({ onProductSelect }: ModernSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  // Загружаем недавние поиски из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('webapp-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse recent searches');
      }
    }
  }, []);

  // Сохраняем недавние поиски
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (searchQuery.length < 2) return;
    
    const updated = [searchQuery, ...recentSearches.filter(q => q !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('webapp-recent-searches', JSON.stringify(updated));
  }, [recentSearches]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/webapp/products/search?q=${encodeURIComponent(query)}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          const products = data.products || data || [];
          setResults(products);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleProductSelect = useCallback((product: Product) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    saveRecentSearch(query);
    setOpen(false);
    setQuery("");
    onProductSelect?.(product);
    router.push(`/webapp/products/${product.id}`);
  }, [query, saveRecentSearch, onProductSelect, router]);

  const handleSearchAll = useCallback(() => {
    if (query.trim()) {
      saveRecentSearch(query);
      setOpen(false);
      router.push(`/webapp/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, saveRecentSearch, router]);

  const handleRecentSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('webapp-recent-searches');
  }, []);

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity > 10) return { text: "В наличии", variant: "default" as const };
    if (quantity > 0) return { text: "Мало", variant: "secondary" as const };
    return { text: "Нет в наличии", variant: "destructive" as const };
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="modern-search-trigger"
        type="button"
        aria-label="Открыть поиск (Ctrl+K)"
      >
        <div className="modern-search-trigger-content">
          <IconComponent name="search" size={16} />
          <span className="modern-search-trigger-text">Поиск товаров...</span>
          <div className="modern-search-trigger-shortcut">
            <span>⌘K</span>
          </div>
        </div>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Поиск лекарств, витаминов, препаратов..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {!query && recentSearches.length > 0 && (
            <>
              <CommandGroup heading="Недавние поиски">
                {recentSearches.map((search, index) => (
                  <CommandItem
                    key={index}
                    value={search}
                    onSelect={() => handleRecentSearch(search)}
                  >
                    <IconComponent name="clock" size={16} />
                    <span>{search}</span>
                  </CommandItem>
                ))}
                <CommandItem onSelect={clearRecentSearches} className="text-red-500">
                  <IconComponent name="trash" size={16} />
                  <span>Очистить историю</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {isLoading && (
            <CommandGroup>
              <div className="modern-search-loading">
                <div className="modern-search-spinner"></div>
                <span>Поиск...</span>
              </div>
            </CommandGroup>
          )}

          {!isLoading && query && results.length > 0 && (
            <>
              <CommandGroup heading={`Найдено товаров: ${results.length}`}>
                {results.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity);
                  return (
                    <CommandItem
                      key={product.id}
                      value={product.name}
                      onSelect={() => handleProductSelect(product)}
                      className="modern-search-item"
                    >
                      <div className="modern-search-item-image">
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
                            <IconComponent name="image" size={20} />
                          </div>
                        )}
                      </div>
                      
                      <div className="modern-search-item-content">
                        <div className="modern-search-item-header">
                          <span className="modern-search-item-name">{product.name}</span>
                          <Badge variant={stockStatus.variant} className="modern-search-item-badge">
                            {stockStatus.text}
                          </Badge>
                        </div>
                        
                        {product.category_name && (
                          <div className="modern-search-item-category">
                            <IconComponent name="tag" size={12} />
                            {product.category_name}
                          </div>
                        )}
                        
                        <div className="modern-search-item-price">
                          <span className="price-current">{formatPrice(product.price)}₽</span>
                          {product.old_price && (
                            <span className="price-old">{formatPrice(product.old_price)}₽</span>
                          )}
                        </div>
                      </div>
                      
                      <IconComponent name="arrow-right" size={16} className="modern-search-item-arrow" />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              
              {query.length >= 2 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem onSelect={handleSearchAll} className="modern-search-view-all">
                      <IconComponent name="search" size={16} />
                      <div className="modern-search-view-all-content">
                        <span className="modern-search-view-all-action">Посмотреть все результаты</span>
                        <span className="modern-search-view-all-query">для "{query}"</span>
                      </div>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </>
          )}

          {!isLoading && query && results.length === 0 && (
            <CommandEmpty>
              <div className="modern-search-empty">
                <IconComponent name="search-x" size={48} />
                <div className="modern-search-empty-title">Ничего не найдено</div>
                <div className="modern-search-empty-subtitle">
                  Попробуйте изменить поисковый запрос
                </div>
                {query.length >= 2 && (
                  <button
                    onClick={handleSearchAll}
                    className="modern-search-empty-button"
                  >
                    Искать на полной странице
                  </button>
                )}
              </div>
            </CommandEmpty>
          )}

          {!query && recentSearches.length === 0 && (
            <CommandGroup heading="Популярные категории">
              <CommandItem onSelect={() => handleRecentSearch("атомоксетин")}>
                <IconComponent name="pill" size={16} />
                <span>Атомоксетин</span>
              </CommandItem>
              <CommandItem onSelect={() => handleRecentSearch("витамины")}>
                <IconComponent name="heart" size={16} />
                <span>Витамины</span>
              </CommandItem>
              <CommandItem onSelect={() => handleRecentSearch("ноотропы")}>
                <IconComponent name="brain" size={16} />
                <span>Ноотропы</span>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>


    </>
  );
} 