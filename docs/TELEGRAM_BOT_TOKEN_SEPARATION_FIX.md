# Исправление разделения ролей Telegram ботов

## Проблема

В `TelegramBotWorker` была критическая ошибка - использовался неправильный токен для клиентских сообщений:

```typescript
// НЕПРАВИЛЬНО: использовался токен для админа/курьера
const token = await TelegramTokenService.getTelegramBotToken(); // @telesklad_bot
```

Это приводило к тому, что клиенты получали сообщения от **@telesklad_bot** вместо **@strattera_test_bot**.

## Исправление

### 1. Изменен токен в TelegramBotWorker

```typescript
// ПРАВИЛЬНО: используется токен для клиентов
const token = await TelegramTokenService.getWebappBotToken(); // @strattera_test_bot
```

**Файл**: `src/lib/services/TelegramBotWorker.ts`, строка 86

### 2. Четкое разделение ролей

- **@telesklad_bot** (TELESKLAD_BOT_TOKEN) - только для:
  - Административных уведомлений
  - Уведомлений курьера
  - Внутренних операций системы

- **@strattera_test_bot** (WEBAPP_TELEGRAM_BOT_TOKEN) - только для:
  - Клиентских приветственных сообщений
  - Взаимодействия с пользователями
  - WebApp функций

## Результат

Теперь клиенты будут получать:
1. ✅ Сообщения от **@strattera_test_bot**
2. ✅ Приветственные сообщения **с кнопками**
3. ✅ Правильную маршрутизацию webhook'ов

## Проверка

После исправления в логах должно быть:
```
🔑 Using webapp_telegram_bot_token (@strattera_test_bot) from database
✅ TelegramBotWorker initialized in webhook mode
✅ Welcome message sent to {chatId}
```

А НЕ:
```
🔑 Using TELESKLAD_BOT_TOKEN from environment variables
```

## Команды для тестирования

```bash
# 1. Остановить все процессы
pkill -f "next dev"

# 2. Запустить на правильном порту
PORT=3000 npm run dev

# 3. Протестировать в @strattera_test_bot
# Отправить любое сообщение и проверить наличие кнопок
```

## Дата исправления

24 января 2025 