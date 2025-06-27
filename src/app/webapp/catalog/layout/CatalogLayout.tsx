import { ReactNode } from 'react';
import { catalogStyles } from '../utils/catalogStyles';
// Временные заглушки для компонентов
import Breadcrumbs from '../components/Breadcrumbs';
import Filters from '../components/Filters/Filters';
import SortSelector from '../components/SortSelector';

interface CatalogLayoutProps {
  children: ReactNode;
}

export default function CatalogLayout({ children }: CatalogLayoutProps) {
  return (
    <div className={catalogStyles.container}>
      <div className={catalogStyles.contentWrapper}>
        <Breadcrumbs />
        
        {/* Мобильная версия - без боковой панели */}
        <div className="md:hidden">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">Каталог</h1>
            <SortSelector />
          </div>
          
          {children}
        </div>
        
        {/* Десктопная версия - с боковой панелью */}
        <div className="hidden md:flex md:gap-6">
          {/* Боковая панель с фильтрами */}
          <aside className="w-1/4">
            <Filters />
          </aside>
          
          {/* Основной контент */}
          <main className="w-3/4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold">Каталог товаров</h1>
              <SortSelector />
            </div>
            
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 