"use client";

import React, { useRef, useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  children?: Category[];
}

interface CategoryNavigationProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export function CategoryNavigation({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryNavigationProps) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Debug - отслеживаем рендеринг компонента
  console.log('🔄 CategoryNavigation render:', { 
    categoriesCount: categories.length, 
    selectedCategory,
    timestamp: new Date().toISOString()
  });

  // Проверяем возможность скролла
  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Проверяем при монтировании и изменении размера
  useEffect(() => {
    checkScrollability();
    
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [categories]);

  // Обработчик скролла
  const handleScroll = () => {
    checkScrollability();
  };

  return (
    <nav role="navigation" aria-label="Категории товаров" className="category-navigation-wrapper">
      {/* Левый градиент */}
      {canScrollLeft && (
        <div className="scroll-indicator scroll-indicator-left" aria-hidden="true" />
      )}
      
      {/* Правый градиент */}
      {canScrollRight && (
        <div className="scroll-indicator scroll-indicator-right" aria-hidden="true" />
      )}
      
      <ul 
        ref={scrollRef}
        className="catalog-nav"
        onScroll={handleScroll}
      >
        {/* All categories option */}
        <li>
          <button
            onClick={() => onSelectCategory(null)}
            className={selectedCategory === null ? 'active' : ''}
            aria-pressed={selectedCategory === null}
          >
            Все товары
          </button>
        </li>

        {/* Category options */}
        {categories.map((category) => (
          <li key={category.id}>
            <button
              onClick={() => onSelectCategory(category.id)}
              className={selectedCategory === category.id ? 'active' : ''}
              aria-pressed={selectedCategory === category.id}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
} 