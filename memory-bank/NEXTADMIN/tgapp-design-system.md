# TGAPP Design System - Единая дизайн-система

## 🎨 Основная цветовая схема

### Фоновые цвета:
- **Основной фон страниц**: `bg-gray-50 dark:bg-gray-900`
- **Фон карточек**: `bg-white dark:bg-gray-800/60`
- **Фон заголовков/навигации**: `bg-white dark:bg-gray-800`
- **Границы**: `border-gray-100 dark:border-gray-700/50`

### Акцентные цвета:
- **Основной бренд**: `text-webapp-brand dark:text-webapp-brand` (зеленый #20C55E)
- **Текст заголовков**: `text-gray-900 dark:text-gray-200`
- **Текст описаний**: `text-gray-500 dark:text-gray-400`
- **Ошибки**: `text-red-500`

## 📐 Структура страниц

### Базовая структура:
```tsx
<div className="flex flex-col h-full">
  {/* Фиксированный заголовок */}
  <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
    {/* Навигация, поиск, заголовки */}
  </div>

  {/* Основной контент */}
  <div className="flex-1 bg-gray-50 dark:bg-gray-900">
    {/* Контент страницы */}
  </div>
</div>
```

## 🃏 Карточки товаров

### Стили карточек:
```tsx
<div className="group relative bg-white dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-black/20 transition-all duration-300 flex flex-col overflow-hidden backdrop-blur-sm h-full">
```

### Размеры:
- **Высота карточки**: 360px
- **Высота изображения**: 180px
- **Отступы**: `p-4` внутри карточки
- **Расстояние между карточками**: `gap-4`
- **Отступы от краев**: `px-4`

## 🖼️ Изображения

### Контейнер изображений:
```tsx
<div className="relative w-full bg-gray-50 dark:bg-gray-700/30 rounded-lg overflow-hidden" style={{ height: '180px' }}>
```

### Загрузка изображений:
- Используется `Next.js Image` компонент
- `fill` для заполнения контейнера
- `object-contain` для сохранения пропорций
- `unoptimized` для S3 изображений
- `sizes="(max-width: 640px) 50vw, 200px"`

## 📱 Сетка и отступы

### Основная сетка:
- **Товары**: `grid grid-cols-2 gap-4`
- **Отступы страницы**: `px-4`
- **Отступы секций**: `py-3`

### Адаптивность:
- Мобильные: 2 колонки
- Планшеты: 2 колонки (возможно расширение)
- Десктоп: 2 колонки

## 🎯 Кнопки и интерактивные элементы

### Основные кнопки:
- **Зеленые кнопки**: `bg-green-500 hover:bg-green-600 text-white`
- **Кнопки действий**: `bg-webapp-brand` 
- **Закругления**: `rounded-lg` для кнопок, `rounded-xl` для карточек

### Кнопка избранного:
- Позиция: `absolute top-3 right-3 z-10`
- Стили сердечка с анимацией

## 📝 Типографика

### Заголовки товаров:
```tsx
<h3 className="text-sm font-medium text-gray-900 dark:text-gray-200 line-clamp-2 min-h-[2.5rem] leading-tight">
```

### Цены:
```tsx
<p className="text-lg font-bold text-webapp-brand dark:text-webapp-brand">
```

### Описания:
```tsx
<p className="text-gray-500 dark:text-gray-400 text-sm">
```

## 🌙 Темная тема

### Поддержка dark mode:
- Все компоненты имеют `dark:` варианты
- Основа: `dark:bg-gray-900`
- Карточки: `dark:bg-gray-800/60`
- Текст: `dark:text-gray-200`
- Границы: `dark:border-gray-700`

## ⚡ Анимации и переходы

### Стандартные переходы:
- `transition-all duration-300`
- `hover:shadow-md`
- `hover:scale-[1.02]` для интерактивных элементов

### Состояния загрузки:
- `animate-pulse` для скелетонов
- `opacity-0` -> `opacity-100` для изображений

## 📋 Компоненты для переиспользования

### 1. PageContainer
```tsx
<div className="flex flex-col h-full">
  <Header />
  <Content />
</div>
```

### 2. PageHeader
```tsx
<div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
```

### 3. PageContent
```tsx
<div className="flex-1 bg-gray-50 dark:bg-gray-900">
```

### 4. ProductCard
- Стандартная карточка товара с изображением
- Поддержка избранного
- Кнопки действий

## 🔧 Технические детали

### CSS классы для копирования:
```css
/* Основной контейнер страницы */
.tgapp-page-container {
  @apply flex flex-col h-full;
}

/* Заголовок страницы */
.tgapp-page-header {
  @apply px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700;
}

/* Контент страницы */
.tgapp-page-content {
  @apply flex-1 bg-gray-50 dark:bg-gray-900;
}

/* Карточка товара */
.tgapp-product-card {
  @apply group relative bg-white dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-black/20 transition-all duration-300 flex flex-col overflow-hidden backdrop-blur-sm h-full;
}

/* Сетка товаров */
.tgapp-products-grid {
  @apply grid grid-cols-2 gap-4 px-4;
}
```

## 📱 Применение для всех страниц /tgapp

### Обязательные элементы:
1. ✅ Единая структура с фиксированным заголовком
2. ✅ Цветовая схема gray-50/gray-900
3. ✅ Карточки с white/gray-800 фоном
4. ✅ Зеленые акценты для брендинга
5. ✅ Поддержка темной темы
6. ✅ Единые отступы и закругления
7. ✅ Стандартные анимации переходов

### Страницы для применения:
- `/tgapp/catalog` ✅ (уже применено)
- `/tgapp/products/[id]` (детальная страница)
- `/tgapp/cart` (корзина)
- `/tgapp/favorites` (избранное)
- `/tgapp/orders` (заказы)
- `/tgapp/profile` (профиль)
- Любые новые страницы

---

**ВАЖНО**: Этот дизайн-система должна использоваться для ВСЕХ страниц в `/tgapp` для создания единообразного пользовательского опыта. 