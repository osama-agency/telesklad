# Быстрый старт: Система учета валют и средней закупочной цены

## 1. Первоначальная настройка

### Запуск миграции базы данных
```bash
# Миграция уже выполнена, но если нужно повторить:
npx prisma migrate deploy
```

### Инициализация курсов валют
```bash
# Запустить скрипт миграции для установки начальных средних цен
npx ts-node scripts/migrate-avg-prices.ts
```

## 2. Запуск cron-задач

В главном файле приложения (например, в `app/layout.tsx` или отдельном серверном компоненте):

```typescript
// Добавить в серверный компонент
import { initializeCronJobs } from '@/lib/cron/init-cron';

// Инициализация при старте
if (typeof window === 'undefined') {
  initializeCronJobs();
}
```

## 3. Ручное обновление курсов

### Через API
```bash
curl -X POST http://localhost:3000/api/rates/update \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-auth-cookie>"
```

### Через код
```typescript
import { updateExchangeRatesManually } from '@/lib/cron/exchange-rate-cron';

const result = await updateExchangeRatesManually();
console.log('Курс обновлен:', result);
```

## 4. Работа с закупками

### Создание закупки в турецких лирах
```typescript
const response = await fetch('/api/purchases', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [
      {
        productId: 1,
        productName: 'Товар 1',
        quantity: 100,
        costPrice: 50, // в TRY
        total: 5000
      }
    ],
    totalAmount: 5000,
    currency: 'TRY', // Важно указать валюту!
    isUrgent: false
  })
});
```

## 5. Получение аналитики по прибыли

### Прибыль по заказам за период
```typescript
const response = await fetch('/api/orders/profit?from=2025-06-01&to=2025-06-30');
const data = await response.json();

console.log('Общая прибыль:', data.stats.totalProfit);
console.log('Средняя маржа:', data.stats.avgProfitMargin + '%');
```

## 6. Мониторинг

### Проверка текущего курса
```bash
curl "http://localhost:3000/api/rates/latest?currency=TRY"
```

### Просмотр логов cron-задач
В консоли сервера будут сообщения:
- `Starting daily exchange rate update...`
- `Successfully updated TRY rate: 3.2456 RUB`

## 7. Тестирование

```bash
# Запуск всех тестов
npm test

# Только тесты расчета средней цены
npm test -- exchange-rate.service.test.ts

# Интеграционные тесты
npm test -- purchase-integration.test.ts
```

## Важные моменты

1. **Курсы обновляются ежедневно в 10:00 МСК** автоматически
2. **Буфер 5%** добавляется к курсу автоматически
3. **Средняя цена обновляется** при каждой закупке
4. **Прибыль рассчитывается** на основе средней закупочной цены

## Troubleshooting

### Ошибка "No exchange rate found"
- Запустите ручное обновление курсов через API
- Проверьте доступность https://www.cbr-xml-daily.ru/daily_json.js

### Неправильный расчет средней цены
- Проверьте, что указана правильная валюта в закупке
- Убедитесь, что курс валюты актуален

### Cron-задачи не запускаются
- Проверьте, что вызвана функция `initializeCronJobs()`
- Убедитесь, что процесс Node.js не перезапускается слишком часто 