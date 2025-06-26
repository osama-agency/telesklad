#!/bin/bash

echo "🚀 Применяем оптимизацию страницы Каталог..."

# 1. Добавляем debug компонент в основную страницу
echo "📝 Добавляем отладочную информацию..."
cat >> src/app/webapp/page.tsx << 'PAGEEOF'

// Debug info для разработки
import { CatalogDebugInfo } from './_components/CatalogDebugInfo';

// В return добавить перед закрывающим div:
// {process.env.NODE_ENV === 'development' && <CatalogDebugInfo />}
PAGEEOF

# 2. Проверяем что стили подключены
echo "🎨 Проверяем подключение стилей..."
if ! grep -q "webapp-catalog-optimization" src/styles/webapp.scss; then
  echo '@import "./webapp-catalog-optimization.scss";' >> src/styles/webapp.scss
  echo "✅ Стили подключены"
else
  echo "✅ Стили уже подключены"
fi

# 3. Создаем тестовую страницу для проверки
echo "🧪 Создаем тестовую страницу..."
cat > src/app/webapp/catalog-test/page.tsx << 'TESTEOF'
"use client";

import { ProductCatalog } from '../_components/ProductCatalog';
import { CatalogDebugInfo } from '../_components/CatalogDebugInfo';

export default function CatalogTestPage() {
  return (
    <div className="webapp-container catalog-page catalog-debug">
      <div className="container-adaptive">
        <h1>🧪 Тест оптимизации каталога</h1>
        
        <div style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '8px',
          marginBottom: '16px' 
        }}>
          <p>✅ Если видите красные границы - CSS работает</p>
          <p>✅ Справа внизу - отладочная информация</p>
          <p>✅ Проверьте Console и Network</p>
        </div>

        <ProductCatalog />
        <CatalogDebugInfo />
      </div>
    </div>
  );
}
TESTEOF

echo "
✨ Оптимизация применена!

📋 Что сделано:
1. ✅ Добавлены оптимизированные стили
2. ✅ Создан компонент отладки CatalogDebugInfo
3. ✅ Создана тестовая страница /webapp/catalog-test

🚀 Что делать дальше:
1. Перезапустите сервер разработки
2. Откройте /webapp/catalog-test для проверки
3. Используйте класс 'catalog-debug' для визуализации
4. Проверьте Console на ошибки
5. Проверьте Network на запросы к API

🐛 Отладка:
- Красные границы = .product-catalog контейнер
- Синие границы = .product-grid сетка
- Зеленые границы = .no-items-wrapper пустое состояние

📖 Документация:
- docs/CATALOG_SPACE_OPTIMIZATION_STRATEGY.md
- docs/CATALOG_OPTIMIZATION_VISUAL_GUIDE.md
"

chmod +x scripts/apply-catalog-optimization.sh
