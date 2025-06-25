# Современный поиск товаров с Algolia для WebApp

## Обзор

Реализован современный, адаптивный поиск товаров с использованием Algolia React InstantSearch, который идеально вписывается в дизайн-систему веб-приложения.

## Ключевые особенности

### 1. Дизайн в стиле приложения
- Использует существующую цветовую схему (зеленый #48C928)
- Скругленные углы и мягкие тени как у карточек товаров
- Адаптивная типографика через `clamp()`
- Плавные анимации и переходы

### 2. UX/UI улучшения
- Мгновенный поиск при вводе (Algolia InstantSearch)
- Haptic feedback для мобильных устройств
- Выпадающий список с превью товаров
- Индикаторы наличия товара
- Отображение цен и скидок
- Кнопка "Показать все" для полных результатов

### 3. Техническая реализация
- **Компонент**: `AlgoliaModernSearch.tsx`
- **Стили**: `algolia-modern-search.scss`
- **Fallback**: Автоматический переход на API поиск если Algolia не настроена
- **Оптимизация**: Debounced поиск, lazy loading изображений

## Компоненты

### AlgoliaModernSearch
Основной компонент с тремя режимами:
1. **Algolia режим** - использует InstantSearch
2. **Fallback режим** - использует API `/api/webapp/products/search`
3. **Автоопределение** - выбирает режим автоматически

### Структура результатов
```typescript
interface Product {
  objectID: string;
  id: number;
  name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  image_url?: string;
  category_name?: string;
}
```

## Стилизация

### Цветовая схема
- Основной зеленый: `#48C928`
- Hover зеленый: `#3AA120`
- Фон поля: `#f5f5f7`
- Текст: `#3D4453`
- Вторичный текст: `#8e8e93`

### Адаптивность
- Мобильные: 1 колонка результатов
- Планшеты: 2 колонки результатов
- Размеры через `clamp()` для плавной адаптации

### Анимации
- Появление dropdown: `dropdownAppear`
- Загрузка: вращающийся spinner
- Hover эффекты с `transform` и `box-shadow`

## Использование

### С Algolia
```bash
# Установите переменные окружения
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_key
NEXT_PUBLIC_ALGOLIA_INDEX_PRODUCTS=nextadmin_products
```

### Без Algolia (Fallback)
Работает автоматически через API поиск по базе данных.

## API Endpoint

`GET /api/webapp/products/search`

Параметры:
- `q` - поисковый запрос
- `limit` - количество результатов (по умолчанию 10)

## Интеграция с Telegram WebApp

- Использует `useTelegramHaptic` для тактильной обратной связи
- Адаптирован под размеры Telegram WebApp
- Поддерживает темную тему (если включена в Telegram)

## Производительность

- Debounced поиск (300ms)
- Lazy loading изображений
- Оптимизированные анимации с `will-change`
- Минимальный re-render через React hooks

## Доступность

- ARIA labels для всех интерактивных элементов
- Keyboard navigation
- Focus management
- Screen reader friendly

## Будущие улучшения

1. Добавить фильтры (категории, цена, наличие)
2. История поиска в localStorage
3. Поисковые подсказки
4. Голосовой поиск
5. Расширенная аналитика через Algolia
