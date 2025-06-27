import { ReactNode } from 'react';
import { catalogStyles } from '../utils/catalogStyles';

interface CatalogGridProps {
  children: ReactNode;
}

export default function CatalogGrid({ children }: CatalogGridProps) {
  return (
    <div className="product-catalog min-h-[200px] relative w-full overflow-visible px-1">
      <div className={catalogStyles.grid.base}>
        {children}
      </div>
    </div>
  );
} 