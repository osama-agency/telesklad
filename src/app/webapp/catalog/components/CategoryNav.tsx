import { catalogStyles, cn } from '../utils/catalogStyles';

const categories = [
  'Все товары',
  'СДВГ',
  'Для похудения',
  'Противозачаточные',
  'Другое',
];

interface CategoryNavProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export default function CategoryNav({ activeCategory = 'Все товары', onCategoryChange }: CategoryNavProps) {
  return (
    <nav className={catalogStyles.categoryNav.wrapper}>
      <div className={catalogStyles.categoryNav.list}>
        {categories.map((category) => (
            <button
            key={category}
              className={cn(
                catalogStyles.categoryNav.button,
                activeCategory === category && catalogStyles.categoryNav.activeButton
              )}
              onClick={() => onCategoryChange?.(category)}
            >
              {category}
            </button>
        ))}
      </div>
    </nav>
  );
}