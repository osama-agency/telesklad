# Система заказов с синхронизацией внешнего API

## Обзор

Реализована полнофункциональная система управления заказами с автоматической синхронизацией из внешнего API Strattera. Система включает базу данных, API endpoints, интерфейс управления и автоматическую синхронизацию каждые 5 минут.

## Архитектура

### 1. База данных (PostgreSQL + Prisma)

#### Модель Order
```prisma
model Order {
  id              String      @id @default(cuid())
  externalId      String      @unique
  customerName    String?
  customerEmail   String?
  customerPhone   String?
  status          String
  total           Decimal     @db.Decimal(10,2)
  currency        String      @default("RUB")
  orderDate       DateTime
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  bankCard        String?
  bonus           Decimal     @default(0) @db.Decimal(10,2)
  customerCity    String?
  deliveryCost    Decimal     @default(0) @db.Decimal(10,2)
  paidAt          DateTime?
  shippedAt       DateTime?
  customerAddress String?
  items           OrderItem[]
}
```

#### Модель OrderItem
```prisma
model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  productId String?
  name      String
  quantity  Int
  price     Decimal  @db.Decimal(10,2)
  total     Decimal  @db.Decimal(10,2)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
}
```

### 2. API Endpoints

#### GET /api/orders
Получение списка заказов с фильтрацией и пагинацией
- Поддержка поиска по клиенту, email, телефону, номеру заказа
- Фильтрация по статусу, городу, валюте, оплате, доставке
- Интеграция с DateRangeContext для фильтрации по дате
- Сортировка по дате, сумме, клиенту, статусу
- Пагинация с настраиваемым размером страницы
- Статистика: общая выручка, средний чек, количество заказов

#### POST /api/orders
Создание нового заказа (для тестирования)

#### GET /api/orders/sync
Получение статуса синхронизации
- Общее количество заказов
- Время последней синхронизации
- Статус готовности системы

#### POST /api/orders/sync
Запуск ручной синхронизации
- Загрузка данных из внешнего API
- Создание/обновление заказов по externalId
- Специальная логика для paidAt (автозаполнение для заказов до 2 января 2025)
- Обработка товаров в заказах
- Статистика результатов синхронизации

### 3. Внешний API Integration

#### Конфигурация
- URL: `https://strattera.tgapp.online/api/v1/orders`
- Авторизация: `Authorization: 8cM9wVBrY3p56k4L1VBpIBwOsw` (без Bearer)

#### Логика синхронизации
1. Запрос всех заказов из внешнего API
2. Для каждого заказа:
   - Проверка существования по `externalId`
   - Создание нового или обновление существующего
   - Специальная обработка `paidAt`: если null и дата заказа до 2 января 2025, то устанавливается `createdAt`
   - Удаление и пересоздание товаров в заказе
3. Возврат статистики: обработано, создано, обновлено, ошибки

### 4. Автоматическая синхронизация

#### OrderSyncService (`src/lib/orderSync.ts`)
- Singleton сервис для управления автоматической синхронизацией
- Интервал: 5 минут (300,000 мс)
- Запуск только в production режиме
- Предотвращение дублирования синхронизации
- Логирование результатов

#### Методы
- `startAutoSync()` - запуск автоматической синхронизации
- `stopAutoSync()` - остановка автоматической синхронизации
- `syncOrders()` - ручной запуск синхронизации
- `getStatus()` - получение статуса сервиса

### 5. React Components

#### SyncManager (`src/components/Orders/SyncManager.tsx`)
Компонент управления синхронизацией:
- Кнопка ручной синхронизации с индикатором загрузки
- Статистика: общее количество заказов, время последней синхронизации, статус готовности
- Результаты последней синхронизации: обработано, создано, обновлено, товаров
- Отображение ошибок синхронизации
- Информационный блок об автоматической синхронизации

#### OrdersPage (`src/app/(site)/orders/page.tsx`)
Главная страница заказов:
- Интеграция с `useOrders` хуком
- Компонент `SyncManager` в верхней части
- Статистические карточки: всего заказов, общая выручка, средний чек, доставка
- Фильтры: статус, поиск по клиенту/номеру
- Таблица с данными заказов и товаров
- Skeleton loading состояния
- Пагинация с информацией о диапазоне

### 6. Custom Hooks

#### useOrders (`src/hooks/useOrders.ts`)
Хук для работы с заказами:
- Автоматическая загрузка данных с интеграцией DateRangeContext
- Методы фильтрации: `searchOrders`, `filterByStatus`, `updateFilters`
- Синхронизация: `syncOrders`, `getSyncStatus`
- Управление состоянием: loading, error, pagination, stats
- Автоматическое обновление при изменении фильтров или даты

#### useOrder (`src/hooks/useOrders.ts`)
Хук для получения одного заказа по ID

#### useOrderStats (`src/hooks/useOrders.ts`)
Хук для получения статистики заказов с учетом выбранного диапазона дат

### 7. TypeScript Types (`src/types/order.ts`)

#### Основные интерфейсы
- `Order` - модель заказа
- `OrderItem` - товар в заказе
- `ExternalOrder` / `ExternalOrderItem` - данные из внешнего API
- `SyncResult` - результат синхронизации
- `OrderFilters` - фильтры для поиска заказов
- `OrderStats` - статистика заказов

#### Константы
- `ORDER_STATUSES` - доступные статусы заказов
- `SyncConfig` - конфигурация синхронизации

## Особенности реализации

### 1. Обработка Decimal типов
Prisma использует Decimal тип для денежных значений. В компонентах реализована универсальная функция `formatCurrency`, которая корректно обрабатывает:
- Числа (number)
- Строки (string)
- Prisma Decimal объекты (с методом toNumber())

### 2. Интеграция с DateRangeContext
Все API endpoints поддерживают параметры `from` и `to` для фильтрации по дате заказа. Фронтенд автоматически передает выбранный диапазон дат из глобального контекста.

### 3. Статусы заказов
Система поддерживает следующие статусы:
- `pending` - Ожидает
- `processing` - В обработке
- `shipped` - Отправлен
- `delivered` - Доставлен
- `cancelled` - Отменён
- `refunded` - Возврат

### 4. Безопасность
- Все API endpoints защищены NextAuth авторизацией
- Валидация входных данных
- Безопасная обработка ошибок без раскрытия внутренней информации

## Использование

### Запуск синхронизации

```typescript
// Ручная синхронизация
const { syncOrders } = useOrders();
const result = await syncOrders();

// Через API
const response = await fetch('/api/orders/sync', { method: 'POST' });
const result = await response.json();
```

### Получение заказов с фильтрами

```typescript
const { orders, loading, error } = useOrders({
  initialFilters: {
    status: 'processing',
    search: 'Иван',
  },
  page: 1,
  limit: 25,
  sortBy: 'orderDate',
  sortOrder: 'desc',
});
```

### API запрос

```javascript
// Получение заказов за период с фильтрами
const params = new URLSearchParams({
  from: '2025-01-01T00:00:00.000Z',
  to: '2025-01-07T23:59:59.999Z',
  status: 'processing',
  search: 'Иван Петров',
  page: '1',
  limit: '25',
  sortBy: 'orderDate',
  sortOrder: 'desc',
});

const response = await fetch(`/api/orders?${params}`);
const data = await response.json();
```

## Мониторинг и отладка

### Логирование
Все операции синхронизации логируются в консоль:
- Количество обработанных заказов
- Статистика создания/обновления
- Ошибки обработки отдельных заказов
- Время выполнения операций

### Компонент SyncManager
Предоставляет визуальный интерфейс для:
- Просмотра статуса синхронизации
- Ручного запуска синхронизации
- Мониторинга ошибок
- Просмотра статистики последней синхронизации

## Развертывание

### Production
1. Убедитесь, что переменная `NODE_ENV=production`
2. Автоматическая синхронизация запустится автоматически каждые 5 минут
3. Мониторьте логи для отслеживания работы синхронизации

### Development
1. Автоматическая синхронизация отключена
2. Используйте кнопку "Синхронизировать" в интерфейсе для тестирования
3. Все операции доступны через API endpoints

## Производительность

- Синхронизация работает асинхронно и не блокирует интерфейс
- Пагинация для больших наборов данных
- Эффективные индексы в базе данных
- Skeleton loading для лучшего UX
- Debounce поиска с задержкой 500ms

## Масштабирование

- Возможность настройки интервала синхронизации через конфигурацию
- Поддержка batch обработки для больших объемов данных
- Готовность к горизонтальному масштабированию (один экземпляр синхронизации)
- Возможность добавления очередей для обработки данных 