"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/catalyst/button';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';

interface Category {
  id: number;
  name: string;
}

interface CategoriesResponse {
  categories: Category[];
  total: number;
  root_category?: {
    id: number;
    name: string;
  };
}

interface CategoriesMenuProps {
  className?: string;
}

export function CategoriesMenu({ className = '' }: CategoriesMenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [rootCategory, setRootCategory] = useState<Category | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { impactLight } = useTelegramHaptic();
  
  const selectedCategoryId = searchParams.get('category_id') ? 
    parseInt(searchParams.get('category_id')!) : null;

  // Показываем меню только на главной странице
  const shouldShowMenu = pathname === '/webapp';

  useEffect(() => {
    if (!shouldShowMenu) return;
    
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/webapp/categories');
        const data: CategoriesResponse = await response.json();
        
        setCategories(data.categories || []);
        setRootCategory(data.root_category || null);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [shouldShowMenu]);

  const handleCategorySelect = (categoryId: number | null) => {
    impactLight();
    
    const params = new URLSearchParams(searchParams);
    
    if (categoryId === null) {
      params.delete('category_id');
    } else {
      params.set('category_id', categoryId.toString());
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.push(newUrl);
  };

  if (!shouldShowMenu) {
    return null;
  }

  if (loading) {
    return (
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex space-x-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-full w-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 ${className}`}>
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 pb-2 min-w-max">
            {/* Кнопка "Все товары" */}
            {selectedCategoryId === null ? (
              <Button
                color="green"
                onClick={() => handleCategorySelect(null)}
                className="whitespace-nowrap text-sm"
              >
                Все товары
              </Button>
            ) : (
              <Button
                outline
                onClick={() => handleCategorySelect(null)}
                className="whitespace-nowrap text-sm"
              >
                Все товары
              </Button>
            )}

            {/* Кнопки категорий */}
            {categories.map((category) => (
              selectedCategoryId === category.id ? (
                <Button
                  key={category.id}
                  color="green"
                  onClick={() => handleCategorySelect(category.id)}
                  className="whitespace-nowrap text-sm"
                >
                  {category.name}
                </Button>
              ) : (
                <Button
                  key={category.id}
                  outline
                  onClick={() => handleCategorySelect(category.id)}
                  className="whitespace-nowrap text-sm"
                >
                  {category.name}
                </Button>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 