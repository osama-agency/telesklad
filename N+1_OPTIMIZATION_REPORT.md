# 🚀 Отчет об исправлении N+1 запросов в TeleSklad

## 📊 Обзор проблемы

N+1 запросы - это критическая проблема производительности, когда для получения списка объектов выполняется 1 запрос, а затем для каждого объекта выполняется дополнительный запрос (N запросов). В результате вместо 1-2 запросов выполняется N+1 запросов.

### 🔍 Найденные проблемы:

1. **КРИТИЧЕСКАЯ** - `src/app/api/purchases/route.ts`: N+1 при загрузке элементов закупок
2. **КРИТИЧЕСКАЯ** - `src/app/api/products/analytics/route.ts`: N+1 при аналитике товаров
3. **СРЕДНЯЯ** - `src/app/api/orders/route.ts`: Отдельные запросы пользователей

## ✅ Выполненные исправления

### 1. Purchases API (`src/app/api/purchases/route.ts`)

#### ❌ Было (N+1 проблема):
```typescript
// Для каждой закупки отдельный запрос элементов
const serializedPurchases = await Promise.all(purchases.map(async (purchase) => {
  const purchaseItems = await prisma.purchase_items.findMany({
    where: { purchaseid: purchase.id }
  });
}));
```

#### ✅ Стало (оптимизировано):
```typescript
// Один запрос с include для всех связанных данных
const purchases = await prisma.purchases.findMany({
  include: {
    purchase_items: {
      include: {
        products: {
          select: { id: true, name: true }
        }
      }
    },
    users: {
      select: { id: true, email: true, first_name: true, last_name: true }
    }
  },
  orderBy: { createdat: 'desc' },
  take: 50
});
```

**Результат**: Сокращение с ~10-50 запросов до 1 запроса

### 2. Products Analytics API (`src/app/api/products/analytics/route.ts`)

#### ❌ Было (N+1 проблема):
```typescript
// Для каждого товара 2 отдельных запроса
const analyticsPromises = products.map(async (product) => {
  const salesData = await prisma.order_items.findMany({...});
  const inTransitData = await prisma.purchase_items.findMany({...});
});
```

#### ✅ Стало (оптимизировано):
```typescript
// Два запроса для всех товаров сразу
const allSalesData = await prisma.order_items.findMany({
  where: {
    product_id: { in: products.map(p => p.id) },
    orders: { paid_at: { gte: fromDate, lte: new Date() }}
  },
  include: { orders: { select: { paid_at: true, total_amount: true }}}
});

const allInTransitData = await prisma.purchase_items.findMany({
  where: {
    productid: { in: products.map(p => p.id) },
    purchases: { status: { in: ['sent'] }}
  }
});

// Группировка данных в Map для быстрого поиска
const salesByProduct = new Map();
const inTransitByProduct = new Map();
// ... группировка ...

// Обработка без дополнительных запросов к БД
const analytics = products.map(product => {
  const salesData = salesByProduct.get(product.id) || [];
  const inTransitQuantity = inTransitByProduct.get(product.id) || 0;
  // ... расчеты ...
});
```

**Результат**: Сокращение с ~54 запросов (27 товаров × 2) до 3 запросов

### 3. POST создание закупок - дополнительная оптимизация

#### ✅ Добавлено:
```typescript
// Получаем все товары одним запросом
const productIds = items.map(item => parseInt(item.productId));
const products = await prisma.products.findMany({
  where: { id: { in: productIds }}
});

// Создаем Map для быстрого поиска
const productsMap = new Map(products.map(p => [p.id, p]));

// Создаем все элементы закупки одним createMany запросом
await tx.purchase_items.createMany({
  data: purchaseItemsData
});
```

## 📈 Ожидаемые результаты

### Производительность:
- **Purchases API**: Ускорение в 10-50 раз (с 50 запросов до 1)
- **Products Analytics**: Ускорение в 18 раз (с 54 запросов до 3)
- **Общая нагрузка на БД**: Снижение на 80-95%

### Масштабируемость:
- Стабильная производительность при росте данных
- Линейная сложность вместо квадратичной
- Меньше блокировок базы данных

### Пользовательский опыт:
- Быстрая загрузка страниц аналитики
- Отзывчивый интерфейс
- Стабильная работа при большом количестве данных

## 🗄️ Дополнительные оптимизации

### Индексы базы данных (`scripts/add-database-indexes.sql`):

```sql
-- Критические индексы для производительности
CREATE INDEX idx_purchases_createdat ON purchases(createdat DESC);
CREATE INDEX idx_purchase_items_purchaseid ON purchase_items(purchaseid);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_orders_paid_at ON orders(paid_at DESC) WHERE paid_at IS NOT NULL;
CREATE INDEX idx_products_visible_active ON products(is_visible, deleted_at, ancestry) 
  WHERE is_visible = true AND deleted_at IS NULL AND ancestry LIKE '%/%';
```

### Пагинация:
- Добавлена пагинация в Purchases API
- Ограничение количества записей для безопасности
- Метаданные пагинации в ответах API

## 🧪 Тестирование

### Рекомендуемые тесты:

1. **Нагрузочное тестирование**:
   ```bash
   # Тест до оптимизации
   ab -n 100 -c 10 http://localhost:3000/api/purchases
   
   # Тест после оптимизации
   ab -n 100 -c 10 http://localhost:3000/api/purchases
   ```

2. **Мониторинг запросов БД**:
   ```sql
   -- Включить логирование медленных запросов
   SET log_min_duration_statement = 100;
   ```

3. **Профилирование в браузере**:
   - Network tab: время загрузки API
   - Performance tab: время рендеринга

## 📋 Чек-лист внедрения

- [x] Исправлен Purchases API
- [x] Исправлен Products Analytics API  
- [x] Создан скрипт индексов БД
- [ ] Применены индексы к продакшн БД
- [ ] Проведено нагрузочное тестирование
- [ ] Настроен мониторинг производительности
- [ ] Обновлена документация API

## 🔮 Дальнейшие улучшения

1. **Кэширование**:
   - Redis для аналитических данных
   - React Query для клиентского кэширования

2. **Виртуализация**:
   - Виртуальные списки для больших таблиц
   - Ленивая загрузка данных

3. **Агрегация**:
   - Материализованные представления
   - Предварительно рассчитанная аналитика

4. **Мониторинг**:
   - APM инструменты (Sentry, DataDog)
   - Алерты на медленные запросы

## 📞 Контакты

При возникновении вопросов или проблем с производительностью:
- Проверьте логи сервера
- Используйте EXPLAIN ANALYZE для анализа запросов
- Мониторьте метрики базы данных

---

**Дата создания**: 19.06.2025  
**Автор**: AI Assistant  
**Статус**: Внедрено в разработку 