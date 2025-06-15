# Система учета валют и средней закупочной цены

## Обзор

Реализована полноценная система учета валют и расчета средней закупочной цены (moving average) для аналитики продаж и управления складом.

## Компоненты системы

### 1. База данных

#### Модель ExchangeRate
```prisma
model ExchangeRate {
  id              String   @id @default(cuid())
  currency        String
  rate            Decimal  @db.Decimal(10,4)  // курс к RUB
  rateWithBuffer  Decimal  @db.Decimal(10,4)  // курс × (1+buffer/100)
  bufferPercent   Decimal  @default(5.0) @db.Decimal(5,2)
  source          String   @default("CBR")
  effectiveDate   DateTime
  createdAt       DateTime @default(now())
}
```

#### Обновление модели Product
- Добавлено поле `avgPurchasePriceRub` - средняя закупочная цена в рублях
- Поле обновляется автоматически при каждой новой закупке

### 2. Сервисы

#### ExchangeRateService (`src/lib/services/exchange-rate.service.ts`)
- `fetchCBRRates()` - получение курсов от ЦБ РФ
- `updateExchangeRate()` - сохранение курса в БД
- `updateTRYRate()` - обновление курса турецкой лиры
- `getLatestRate()` - получение актуального курса
- `calculateMovingAverage()` - расчет средней закупочной цены
- `convertToRub()` - конвертация валюты в рубли

### 3. Cron-задачи

#### Ежедневное обновление курсов (`src/lib/cron/exchange-rate-cron.ts`)
- Запускается каждый день в 10:00 по московскому времени
- Автоматически получает курс TRY от ЦБ РФ
- Сохраняет курс с буфером 5%

### 4. API Endpoints

#### GET `/api/rates/latest?currency=TRY`
Получение актуального курса валюты с буфером.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "currency": "TRY",
    "rate": 3.2456,
    "rateWithBuffer": 3.4079,
    "bufferPercent": 5,
    "effectiveDate": "2025-06-15T00:00:00.000Z",
    "source": "CBR"
  }
}
```

#### POST `/api/rates/update`
Ручное обновление курсов валют (требует авторизации).

**Ответ:**
```json
{
  "success": true,
  "message": "Exchange rates updated successfully",
  "data": {
    "currency": "TRY",
    "rate": 3.2456,
    "updatedAt": "2025-06-15T12:00:00.000Z"
  }
}
```

#### POST `/api/purchases`
Создание новой закупки с автоматическим пересчетом средней цены.

**Запрос:**
```json
{
  "items": [
    {
      "productId": 1,
      "productName": "Товар 1",
      "quantity": 100,
      "costPrice": 50,
      "total": 5000
    }
  ],
  "totalAmount": 5000,
  "currency": "TRY",
  "isUrgent": false,
  "expenses": 100
}
```

#### GET `/api/orders/profit`
Расчет прибыли по заказам с учетом средней закупочной цены.

**Параметры запроса:**
- `from` - начальная дата (ISO 8601)
- `to` - конечная дата (ISO 8601)
- `orderId` - ID конкретного заказа (опционально)

**Ответ:**
```json
{
  "orders": [
    {
      "id": "order123",
      "customerName": "Иван Иванов",
      "total": 5000,
      "totalCost": 3500,
      "totalRevenue": 4800,
      "profit": 1300,
      "profitMargin": 27.08,
      "items": [
        {
          "name": "Товар 1",
          "quantity": 10,
          "total": 5000,
          "avgCost": 350,
          "totalCost": 3500,
          "profit": 1500,
          "profitMargin": 30
        }
      ]
    }
  ],
  "stats": {
    "totalRevenue": 48000,
    "totalCost": 35000,
    "totalProfit": 13000,
    "orderCount": 10,
    "avgProfitMargin": 27.08,
    "avgOrderProfit": 1300
  }
}
```

### 5. Расчет средней закупочной цены

При каждой новой закупке:
1. Конвертируем цену из валюты закупки в рубли по актуальному курсу с буфером
2. Рассчитываем новую среднюю цену по формуле:
   ```
   newAvg = (currentStock × currentAvg + newQty × priceRub) / (currentStock + newQty)
   ```
3. Обновляем `avgPurchasePriceRub` и `stock_quantity` в таблице products

### 6. Миграция существующих данных

Скрипт `scripts/migrate-avg-prices.ts`:
- Проверяет наличие курса TRY (загружает при необходимости)
- Для товаров с остатками устанавливает начальную среднюю цену
- Использует `prime_cost` или 70% от цены продажи как базу

**Запуск миграции:**
```bash
npx ts-node scripts/migrate-avg-prices.ts
```

### 7. Тестирование

Юнит-тесты для функции расчета средней цены:
```bash
npm test -- src/lib/services/__tests__/exchange-rate.service.test.ts
```

Тесты покрывают:
- Начальную закупку
- Дополнительные закупки
- Обработку нулевых значений
- Работу с большими числами
- Дробные значения

## Использование

### Инициализация при старте приложения

В главном файле приложения добавьте:
```typescript
import { initializeCronJobs } from '@/lib/cron/init-cron';

// При старте приложения
initializeCronJobs();
```

### Работа с закупками

При создании закупки система автоматически:
1. Получает актуальный курс валюты
2. Конвертирует цены в рубли
3. Обновляет среднюю закупочную цену
4. Увеличивает остатки на складе

### Аналитика прибыли

При продаже товаров прибыль рассчитывается как:
```typescript
profit = salePriceRub - product.avgPurchasePriceRub * quantity
```

## Мониторинг

- Логи обновления курсов в консоли сервера
- История курсов в таблице exchange_rates
- Маркер миграции в exchange_rates с currency='MIGRATION_MARKER'

## Безопасность

- API обновления курсов требует авторизации
- Транзакции при обновлении закупок для атомарности
- Валидация данных на всех уровнях 