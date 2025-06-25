# Добавление поиска в header каталога

## Выполненные изменения

### 1. Обновлен компонент ProductCatalog.tsx
Добавлен header с поиском Algolia в каталог товаров:

**Файл:** `src/app/webapp/_components/ProductCatalog.tsx`

```tsx
// Добавлен импорт
import { AlgoliaModernSearch } from './AlgoliaModernSearch';

// Добавлен header в return
return (
  <div className="product-catalog">
    {/* Header with Search */}
    <header className="catalog-header">
      <div className="container-adaptive py-3">
        <AlgoliaModernSearch />
      </div>
    </header>

    {/* Category Navigation */}
    {categories.length > 0 && (
      <CategoryNavigation 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
    )}
    
    {/* Products Grid */}
    {/* ... остальной код */}
  </div>
);
```

### 2. Добавлены стили для header каталога
В файл `src/styles/webapp.scss` добавлены стили:

```scss
/* Container Adaptive - адаптивный контейнер */
.container-adaptive {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding-left: clamp(16px, 4vw, 20px);
  padding-right: clamp(16px, 4vw, 20px);
}

/* Catalog Header - для страницы каталога с поиском */
.catalog-header {
  background-color: white;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: clamp(16px, 4vw, 20px);
  position: sticky;
  top: 0;
  z-index: 100;
  
  /* Safe area для notch */
  padding-top: max(env(safe-area-inset-top), 0);
}
```

## Используемые компоненты

### AlgoliaModernSearch
- Современный компонент поиска с интеграцией Algolia
- Поддерживает fallback на обычный поиск, если Algolia не настроена
- Включает автодополнение и мгновенные результаты
- Адаптивный дизайн для мобильных устройств

### Стили поиска
- Используются готовые стили из `algolia-modern-search-light.scss`
- Поддерживают тему сайта (зеленые цвета #48C928)
- Адаптивный дизайн с clamp() функциями
- Современные анимации и переходы

## Особенности реализации

### 1. Sticky позиционирование
Header закреплен сверху при скролле для удобства поиска

### 2. Safe area support
Поддержка iPhone с notch - автоматический отступ сверху

### 3. Адаптивные отступы
Использование clamp() для плавной адаптации на всех устройствах

### 4. Z-index управление
Правильное наслоение элементов (header: z-index: 100)

## Интеграция с Algolia

### Переменные окружения
Поиск автоматически использует настроенные переменные:
- `NEXT_PUBLIC_ALGOLIA_APP_ID`
- `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`  
- `NEXT_PUBLIC_ALGOLIA_INDEX_PRODUCTS`

### Fallback режим
Если Algolia не настроена, автоматически переключается на обычный поиск через API `/api/webapp/products/search`

## Результат

- ✅ Поиск добавлен в header каталога
- ✅ Использует фирменные цвета сайта (#48C928)
- ✅ Полная интеграция с настроенной Algolia
- ✅ Адаптивный дизайн для всех устройств
- ✅ Sticky позиционирование для удобства
- ✅ Поддержка iPhone с notch
- ✅ Fallback на обычный поиск

## Затронутые файлы

1. `src/app/webapp/_components/ProductCatalog.tsx` - добавлен header с поиском
2. `src/styles/webapp.scss` - добавлены стили для header и контейнера
3. Используются существующие:
   - `src/app/webapp/_components/AlgoliaModernSearch.tsx`
   - `src/styles/algolia-modern-search-light.scss`
   - `src/styles/webapp-algolia.scss`