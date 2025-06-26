# Header отображается только на страницах каталога

## Описание изменения

Реализована конфигурационная система для отображения header с поиском, избранным и профилем только на страницах каталога.

**ВАЖНО**: Изменения применены ко всем компонентам header:
- `Header.tsx` - основной используемый компонент
- `TelegramHeader.tsx` - альтернативный компонент (включается через NEXT_PUBLIC_ENABLE_TELEGRAM_DESIGN=true)
- `TelegramDesignHeader.tsx` - экспериментальный компонент (не используется в layout)

## Что изменилось

### 1. Добавлена конфигурация страниц каталога

```typescript
const CATALOG_PAGES = [
  '/webapp',              // Главная страница каталога
  '/webapp/search'        // Страница поиска
];
```

### 2. Логика проверки отображения header

```typescript
// Проверяем, нужно ли показывать header
const shouldShowHeader = CATALOG_PAGES.some(page => 
  page.endsWith('/') ? pathname.startsWith(page) : pathname === page
);

if (!shouldShowHeader) {
  return null;
}
```

### 3. Где теперь показывается header

- ✅ `/webapp` - главная страница каталога
- ✅ `/webapp/search` - страница поиска
- ❌ `/webapp/products/[id]` - страницы товаров
- ❌ `/webapp/cart` - корзина
- ❌ `/webapp/favorites` - избранное
- ❌ `/webapp/profile` - профиль
- ❌ `/webapp/orders` - заказы
- ❌ `/webapp/support` - поддержка
- ❌ Любые другие страницы

## Преимущества решения

1. **Гибкость** - легко добавить новые страницы в массив `CATALOG_PAGES`
2. **Читаемость** - явно видно, где показывается header
3. **Производительность** - проверка выполняется эффективно через `Array.some()`
4. **Масштабируемость** - можно легко расширить логику проверки

## Как добавить новую страницу

Чтобы показывать header на новой странице, просто добавьте путь в массив:

```typescript
const CATALOG_PAGES = [
  '/webapp',
  '/webapp/search',
  '/webapp/new-page'     // Новая страница
];
```

## Технические детали

- Исправлены TypeScript ошибки с типами Telegram WebApp через `as any`
- Убраны неподдерживаемые пропсы из компонента `AlgoliaModernSearch`
- Сохранена вся функциональность header (поиск, избранное, профиль)

## Дата изменения

2025-01-05 

## Изменение от 28 января 2025

### Задача
Скрыть header с поиском и иконками профиля/избранного на страницах карточек товаров.

### Решение
Обновлена конфигурация массива `CATALOG_PAGES` во всех header компонентах, удалив путь `/webapp/products/`.

### Измененные файлы:

1. **src/app/webapp/_components/Header.tsx**
   ```typescript
   const CATALOG_PAGES = [
     '/webapp',              // Главная страница каталога
     '/webapp/search'        // Страница поиска
   ];
   ```

2. **src/app/webapp/_components/TelegramHeader.tsx**
   ```typescript
   const CATALOG_PAGES = [
     '/webapp',              // Главная страница каталога
     '/webapp/search'        // Страница поиска
   ];
   ```

3. **src/app/webapp/_components/TelegramDesignHeader.tsx**
   ```typescript
   const CATALOG_PAGES = [
     '/webapp',              // Главная страница каталога
     '/webapp/search'        // Страница поиска
   ];
   ```

### Результат
- Header теперь отображается только на главной странице каталога (`/webapp`) и странице поиска (`/webapp/search`)
- На страницах товаров (`/webapp/products/*`) header больше не показывается
- Улучшен UX на странице товара - больше места для контента

### Архитектура
Проект использует `HeaderProvider`, который выбирает между `Header` и `TelegramHeader` компонентами на основе переменной окружения `NEXT_PUBLIC_ENABLE_TELEGRAM_DESIGN`.

## Изменения от 11 декабря 2024

На страницах где header отсутствует (кроме каталога), добавлен TelegramBackButton - нативная кнопка "Назад" от Telegram SDK.

### Логика TelegramBackButton:
- Показывается автоматически на всех страницах, кроме:
  - Главной страницы каталога `/webapp`
  - Страниц поиска `/webapp/search*`
- Использует нативный Telegram BackButton API
- Корректно обрабатывает навигацию с учетом истории браузера

### Добавлена конфигурация для определения страниц с header:

```typescript
// В TelegramBackButton.tsx
const PAGES_WITH_HEADER = [
  '/webapp',              // Главная страница каталога
  '/webapp/search'        // Страница поиска
];
```

### Результат:
- На страницах с header (каталог, поиск) - кнопка "Назад" скрыта
- На всех остальных страницах - показывается нативная кнопка Telegram
- Улучшен UX навигации в Telegram WebApp 