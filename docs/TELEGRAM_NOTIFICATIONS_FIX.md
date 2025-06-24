# Исправление проблемы с уведомлениями Telegram

## Проблема

После нажатия кнопки "Я оплатил" в Telegram Web App не приходили уведомления ни клиенту, ни админу в @telesklad_bot.

## Диагностика

Проведен полный анализ системы уведомлений:

### 1. Проверка API создания заказов
- ✅ API `/api/webapp/orders` работает корректно
- ✅ Заказы создаются в базе данных
- ✅ Вызов `ReportService.handleOrderStatusChange` присутствует

### 2. Проверка webhook'а
- ❌ **ПРОБЛЕМА**: Webhook endpoint `/api/telegram/webapp-webhook` был заблокирован middleware
- ❌ **ПРОБЛЕМА**: Webhook возвращал 307 Temporary Redirect вместо обработки запроса

### 3. Проверка токенов ботов
- ❌ **ПРОБЛЕМА**: Несоответствие токенов в .env и базе данных
- В .env: `7819892502:AAFqGnQ7j-ZXJnJmhHrn7RyTJfNHuaWjNUY`
- В БД: `7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg` (правильный)

### 4. Проверка сервисов уведомлений
- ✅ `TelegramService` работает корректно
- ✅ `AdminTelegramService` работает корректно
- ✅ `ReportService` работает корректно

## Исправления

### 1. Исправление middleware
Добавлено исключение для webhook endpoint в `src/middleware.ts`:

```typescript
// Публичные маршруты, доступные без авторизации
const publicPaths = [
  // ... другие маршруты
  '/api/telegram/webhook',
  '/api/telegram/webapp-webhook',  // ← ДОБАВЛЕНО
  // ... остальные маршруты
];

// Также обновлен matcher
"/((?!_next/static|_next/image|favicon.ico|public|uploads|webapp|api/webapp|api/telegram).*)"
//                                                                    ^^^^^^^^^^^^^ ДОБАВЛЕНО
```

### 2. Переустановка webhook
Webhook переустановлен с правильным токеном:

```bash
curl -X POST "https://api.telegram.org/bot7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://strattera.ngrok.app/api/telegram/webapp-webhook",
    "allowed_updates": ["message", "callback_query"]
  }'
```

## Результат

✅ **Проблема решена!**

- Webhook endpoint теперь доступен и обрабатывает запросы
- Callback "i_paid" корректно обрабатывается в `TelegramBotWorker`
- Статус заказа изменяется с "unpaid" на "paid"
- `ReportService` отправляет уведомления клиенту и админу

## Тестирование

Процесс протестирован:

1. **Создание заказа**: ✅ Работает
2. **Callback "i_paid"**: ✅ Обрабатывается
3. **Изменение статуса**: ✅ unpaid → paid
4. **Отправка уведомлений**: ✅ Работает

## Команды для проверки

```bash
# Проверка webhook
curl -s "https://api.telegram.org/bot7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg/getWebhookInfo"

# Проверка endpoint
curl -s "https://strattera.ngrok.app/api/telegram/webapp-webhook"

# Создание тестового заказа
curl -X POST "http://localhost:3000/api/webapp/orders" \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Init-Data: user=%7B%22id%22%3A125861752%2C%22first_name%22%3A%22Eldar%22%2C%22username%22%3A%22eldarshamukhamedov%22%7D" \
  -d '{"cart_items": [{"product_id": 27, "quantity": 1, "price": 5200}]}'
```

## Важные детали

1. **Токены ботов**: В development режиме `TelegramTokenService` использует токен из базы данных, не из .env
2. **Middleware**: Все Telegram API endpoints должны быть исключены из аутентификации
3. **Webhook URL**: Должен точно соответствовать endpoint в коде (`/api/telegram/webapp-webhook`)
4. **ngrok**: Домен `strattera.ngrok.app` должен быть активен для получения webhook'ов

## Связанные файлы

- `src/middleware.ts` - исключения для webhook endpoints
- `src/app/api/telegram/webapp-webhook/route.ts` - обработка webhook'ов
- `src/lib/services/TelegramBotWorker.ts` - обработка callback'ов
- `src/lib/services/ReportService.ts` - отправка уведомлений
- `src/lib/services/telegram-token.service.ts` - управление токенами 