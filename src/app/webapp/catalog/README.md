# Catalog Page - Tailwind Migration

## Архитектура

Страница каталога мигрирована с SCSS на Tailwind CSS с сохранением оригинального дизайна и улучшенной масштабируемостью.

### Структура компонентов

```
catalog/
├── utils/
│   └── catalogStyles.ts    # Централизованные стили и утилиты
├── components/            # UI компоненты
├── layout/               # Компоненты разметки
└── page.tsx             # Главная страница
```

## Использование стилей

### 1. Импорт утилит

```typescript
import { catalogStyles, cn } from '../utils/catalogStyles';
```

### 2. Применение стилей

```tsx
// Простое использование
<div className={catalogStyles.card.base}>

// Композиция стилей
<div className={cn(
  catalogStyles.card.base,
  'custom-class',
  isActive && 'active-class'
)}>
```

### 3. Доступные стили

- **container** - основной контейнер страницы
- **grid** - стили для сетки товаров
- **card** - стили карточки товара
- **emptyState** - состояние "нет товаров"
- **errorState** - состояние ошибки
- **skeleton** - стили загрузки
- **categoryNav** - навигация по категориям
- **search** - стили поиска
- **pullRefresh** - pull-to-refresh индикатор

## Кастомизация

### Цвета

Все цвета определены в `tailwind.config.ts`:

```javascript
catalog: {
  primary: '#48C928',
  'primary-hover': '#3AA120',
  error: '#ef4444',
  'text-gray': '#6B7280',
  'text-light': '#9CA3AF',
}
```

### Анимации

- `animate-catalog-appear` - анимация появления товаров
- `animate-shimmer` - анимация загрузки

### Радиусы

- `rounded-catalog-button` - радиус кнопок (14px)
- `rounded-catalog-card` - радиус карточек (12px)
- `rounded-catalog-tag` - радиус тегов (16px)

## Примеры компонентов

### ProductCard

```tsx
<ProductCard 
  product={productData} 
  index={0} // для анимации
/>
```

### EmptyState

```tsx
<div className={catalogStyles.emptyState.wrapper}>
  <div className={catalogStyles.emptyState.content}>
    <div className={catalogStyles.emptyState.icon}>📦</div>
    <h3 className={catalogStyles.emptyState.title}>Нет товаров</h3>
  </div>
</div>
```

### Skeleton Loading

```tsx
<div className={catalogStyles.grid.skeleton}>
  {[...Array(8)].map((_, i) => (
    <ProductCardSkeleton key={i} />
  ))}
</div>
```

## Responsive Design

Сетка автоматически адаптируется:
- Mobile: 2 колонки
- Tablet: 3 колонки
- Desktop: 4 колонки

## Производительность

- Все стили скомпилированы в CSS во время сборки
- Минимальный JavaScript для интерактивности
- Оптимизированные анимации через CSS transforms