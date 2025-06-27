"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, FunnelIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoryFilterProps {
  onCategoryChange: (categoryId: string | null) => void;
  selectedCategory?: string | null;
}

export default function CategoryFilter({ onCategoryChange, selectedCategory }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Haptic feedback for Telegram WebApp
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        if (type === 'light') {
          tg.HapticFeedback.selectionChanged();
        } else if (type === 'medium') {
          tg.HapticFeedback.impactOccurred('medium');
        } else {
          tg.HapticFeedback.impactOccurred('heavy');
        }
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
    setIsOpen(false);
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);

  if (loading) {
    return (
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      {/* Filter Button - увеличенные размеры для мобильных */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            triggerHapticFeedback('light');
            setIsOpen(true);
          }}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FunnelIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <div className="text-xs text-gray-500 dark:text-gray-400">Категория</div>
              <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                {selectedCategoryData ? selectedCategoryData.name : 'Все категории'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedCategoryData && (
              <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg">
                {selectedCategoryData.count}
              </span>
            )}
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          </div>
        </button>
      </div>

      {/* Mobile Modal - полноэкранный для удобства */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        
        <div className="fixed inset-0 flex items-end">
          <DialogPanel className="w-full max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-3xl shadow-xl transform transition-all">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Выберите категорию
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="sr-only">Закрыть</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Categories List - увеличенные элементы */}
            <div className="overflow-y-auto pb-safe">
              <div className="px-4 py-3">
                {/* All Categories */}
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`w-full flex items-center justify-between px-4 py-4 mb-2 rounded-xl transition-all ${
                    !selectedCategory
                      ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                      : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      !selectedCategory 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                        Все категории
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {totalCount} товаров
                      </div>
                    </div>
                  </div>
                  {!selectedCategory && (
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  )}
                </button>

                {/* Category Items */}
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`w-full flex items-center justify-between px-4 py-4 mb-2 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                          : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {getCategoryIcon(category.name)}
                        </div>
                        <div className="text-left">
                          <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {category.count} товаров
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckIcon className="w-5 h-5 text-green-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}

// Функция для получения иконки категории
function getCategoryIcon(categoryName: string) {
  switch (categoryName) {
    case 'СДВГ':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case 'Для похудения':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      );
    case 'Противозачаточные':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      );
  }
} 