"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoryFilterHorizontalProps {
  onCategoryChange: (categoryId: string | null) => void;
  selectedCategory?: string | null;
}

export default function CategoryFilterHorizontal({ onCategoryChange, selectedCategory }: CategoryFilterHorizontalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Haptic feedback for Telegram WebApp
  const triggerHapticFeedback = (type: 'light' | 'medium' = 'light') => {
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        if (type === 'light') {
          tg.HapticFeedback.selectionChanged();
        } else {
          tg.HapticFeedback.impactOccurred('medium');
        }
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Scroll to selected category when it changes
    if (selectedCategory && scrollContainerRef.current) {
      const selectedButton = scrollContainerRef.current.querySelector(`[data-category-id="${selectedCategory}"]`);
      if (selectedButton) {
        selectedButton.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/webapp/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    triggerHapticFeedback('medium');
    onCategoryChange(categoryId);
  };

  if (loading) {
    return (
      <div className="bg-[#F6F9FC] dark:bg-transparent border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 pt-2.5 pb-2">
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-10 w-28 bg-[#F1F1F1] dark:bg-black/20 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="category-filter-wrapper bg-[#F6F9FC] dark:bg-transparent border-b border-gray-200 dark:border-gray-700">
      {/* Scrollable container */}
            <div 
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-hidden pt-2.5 pb-2 category-filter-scroll"
      >
        <div className="flex gap-2.5 w-max" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
            {/* All Categories Button */}
            <button
              onClick={() => handleCategorySelect(null)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                ${!selectedCategory 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/25 scale-105' 
                  : 'bg-[#F1F1F1] dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-black/30 backdrop-blur-sm'
                }
              `}
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="whitespace-nowrap">Все</span>
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-semibold
                ${!selectedCategory 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400'
                }
              `}>
                {totalCount}
              </span>
            </button>

            {/* Category Buttons */}
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  data-category-id={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                    ${isSelected 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/25 scale-105' 
                      : 'bg-[#F1F1F1] dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-black/30 backdrop-blur-sm'
                    }
                  `}
                >
                  <span className="whitespace-nowrap">{category.name}</span>
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-semibold
                    ${isSelected 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400'
                    }
                  `}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
    </div>
  );
} 