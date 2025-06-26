"use client";

import React, { useState, useEffect, useRef } from 'react';
import { webAppFetch } from '@/lib/utils/webapp-fetch';

interface Category {
  id: number;
  name: string;
}

interface CategoryFilterProps {
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Загрузка категорий
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await webAppFetch('/api/webapp/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Haptic feedback при выборе категории
  const handleCategorySelect = (categoryId: number | null) => {
    // Telegram haptic feedback
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    onSelectCategory(categoryId);
  };

  if (loading) {
    return (
      <div className="category-filter">
        <div className="category-filter-list">
          {/* Skeleton для загрузки */}
          {[...Array(4)].map((_, index) => (
            <div key={index} className="category-filter-item skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="category-filter">
      <div className="category-filter-list" ref={scrollRef}>
        {/* Кнопка "Все товары" */}
        <button
          onClick={() => handleCategorySelect(null)}
          className={`category-filter-item ${selectedCategory === null ? 'active' : ''}`}
          type="button"
        >
          Все товары
        </button>

        {/* Кнопки категорий */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`category-filter-item ${selectedCategory === category.id ? 'active' : ''}`}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
} 