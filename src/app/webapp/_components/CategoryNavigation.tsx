"use client";

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
  return (
    <nav role="navigation" aria-label="Категории товаров">
      <ul className="catalog-nav">
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