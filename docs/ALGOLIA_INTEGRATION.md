# Интеграция Algolia React InstantSearch

Данный документ описывает интеграцию Algolia React InstantSearch в проект NEXTADMIN для мгновенного поиска товаров в Telegram WebApp.

## 🚀 Обзор

Algolia InstantSearch обеспечивает:
- **Мгновенный поиск** товаров с автодополнением
- **Фасетная фильтрация** по категориям и атрибутам
- **Релевантная сортировка** результатов
- **Отказоустойчивость** с fallback на стандартный поиск
- **Оптимизированную производительность** для мобильных устройств

## 📦 Установленные пакеты

```bash
npm install algoliasearch react-instantsearch @algolia/autocomplete-js
```

## 🛠 Настройка переменных окружения

Добавьте в ваш `.env.local`:

```bash
# Algolia Search Configuration
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_algolia_search_key
NEXT_PUBLIC_ALGOLIA_INDEX_PRODUCTS=nextadmin_products

# Algolia Admin API Key (только для синхронизации, не публичный!)
ALGOLIA_ADMIN_API_KEY=your_algolia_admin_api_key
```

### Получение API ключей

1. Зарегистрируйтесь на [algolia.com](https://www.algolia.com/)
2. Создайте новое приложение
3. Перейдите в **API Keys** в панели управления
4. Скопируйте:
   - **Application ID** → `NEXT_PUBLIC_ALGOLIA_APP_ID`
   - **Search-Only API Key** → `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`
   - **Admin API Key** → `ALGOLIA_ADMIN_API_KEY` (не публичный!)

## 🔧 Архитектура решения

### Компоненты

1. **AlgoliaService** (`src/lib/services/algolia.service.ts`)
   - Конфигурация клиента Algolia
   - Методы синхронизации данных
   - Fallback поиск

2. **AlgoliaSearchComponent** (`src/app/webapp/_components/AlgoliaSearchComponent.tsx`)
   - Компонент поиска для хедера
   - Автодополнение с результатами
   - Интеграция с навигацией

3. **AlgoliaSearchPage** (`src/app/webapp/_components/AlgoliaSearchPage.tsx`)
   - Полнофункциональная страница поиска
   - Фильтры и фасеты
   - Статистика результатов

### API Endpoints

- `GET/POST /api/algolia/sync` - Синхронизация товаров с Algolia

### Стили

- `src/styles/webapp-algolia.scss` - Стили для Algolia компонентов

## 📊 Структура данных в Algolia

Каждый товар в индексе имеет следующие поля:

```typescript
interface AlgoliaProduct {
  objectID: string;        // ID товара как строка
  id: number;             // Числовой ID товара
  name: string;           // Название товара
  price: number;          // Цена
  old_price?: number;     // Старая цена (опционально)
  stock_quantity: number; // Количество в наличии
  image_url?: string;     // URL изображения
  category_name?: string; // Название категории
  category_id?: number;   // ID категории
  ancestry?: string;      // Путь в иерархии категорий
  show_in_webapp: boolean; // Показывать в WebApp
  description?: string;   // Описание товара
  is_in_stock: boolean;   // Есть ли в наличии
}
```

## 🔄 Синхронизация данных

### Первоначальная синхронизация

```bash
# Через API endpoint
curl -X POST http://localhost:3000/api/algolia/sync

# Через скрипт
npm run algolia:sync
```

### Автоматическая синхронизация

При обновлении товаров в админке можно добавить хуки для автоматической синхронизации:

```typescript
// Пример в API обновления товара
await AlgoliaService.saveProduct(updatedProduct);
```

## 🎨 Кастомизация

### Настройка поисковых атрибутов

В индексе Algolia настройте searchable attributes:
1. `name` (ordered)
2. `description` (unordered)
3. `category_name` (unordered)

### Настройка фасетов

Добавьте следующие атрибуты как facets:
- `category_name`
- `is_in_stock`
- `price` (numeric)

### Настройка ранжирования

Рекомендуемая настройка ranking criteria:
1. `typo`
2. `geo`
3. `words`
4. `filters`
5. `proximity`
6. `attribute`
7. `exact`
8. `custom`

## 📱 Особенности для Telegram WebApp

### Haptic Feedback

Компоненты поддерживают тактильную обратную связь:

```typescript
if ('vibrate' in navigator) {
  navigator.vibrate(50);
}
```

### Адаптивность

Все компоненты адаптированы для мобильных устройств с учетом ограничений Telegram WebApp.

## 🔍 Использование компонентов

### В хедере (автодополнение)

```tsx
import { AlgoliaSearchComponent } from './_components/AlgoliaSearchComponent';

{process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ? (
  <AlgoliaSearchComponent />
) : (
  <SearchComponent />
)}
```

### Полная страница поиска

```tsx
import { AlgoliaSearchPage } from './_components/AlgoliaSearchPage';

<AlgoliaSearchPage initialQuery={query} />
```

## 🚨 Обработка ошибок

### Fallback на стандартный поиск

Если Algolia недоступен, система автоматически переключается на стандартный поиск:

```tsx
const hasAlgolia = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID && 
                   process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;

if (hasAlgolia) {
  return <AlgoliaSearchComponent />;
} else {
  return <SearchComponent />;
}
```

### Мониторинг

- Логи синхронизации в консоли браузера
- API endpoint для проверки статуса: `GET /api/algolia/sync`

## 🔧 Команды разработки

```bash
# Проверить статус синхронизации
curl -X GET http://localhost:3000/api/algolia/sync

# Запустить синхронизацию
curl -X POST http://localhost:3000/api/algolia/sync

# Синхронизация через скрипт
npm run algolia:sync
```

## 📈 Преимущества

1. **Скорость**: Поиск выполняется мгновенно
2. **Релевантность**: Улучшенные алгоритмы ранжирования
3. **UX**: Автодополнение и фильтры
4. **Масштабируемость**: Algolia обрабатывает миллионы запросов
5. **Аналитика**: Встроенная аналитика поисковых запросов
6. **Отказоустойчивость**: Fallback на стандартный поиск

## 🔮 Возможности расширения

1. **Персонализация**: Настройка результатов для каждого пользователя
2. **A/B тестирование**: Тестирование различных алгоритмов поиска
3. **Автодополнение**: Продвинутое автодополнение с категориями
4. **Поиск по изображениям**: Visual search (требует дополнительной настройки)
5. **Голосовой поиск**: Интеграция с Web Speech API

## 📞 Поддержка

При возникновении проблем:

1. Проверьте переменные окружения
2. Убедитесь в правильности API ключей
3. Проверьте логи синхронизации
4. Используйте fallback на стандартный поиск

---

**Примечание**: Algolia предоставляет бесплатный план с ограничениями. Для продакшн использования рассмотрите переход на платный план. 