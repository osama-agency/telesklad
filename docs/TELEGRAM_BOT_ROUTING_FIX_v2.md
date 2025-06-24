# Исправление маршрутизации Telegram ботов в development среде

**Дата:** 24.06.2025  
**Статус:** ✅ Исправлено  

## Проблема

При оформлении заказов в development среде уведомления отправлялись через основной бот `@telesklad_bot` вместо тестового бота `@strattera_test_bot`, что создавало путаницу в процессе разработки.

### Симптомы
- Заказы, оформленные через https://strattera.ngrok.app/webapp приходили в @telesklad_bot
- В логах отображалось: `🔑 Using TELESKLAD_BOT_TOKEN from environment variables`
- NODE_ENV был установлен в "development", но не учитывался при выборе токена

## Корневая причина

1. **TelegramService** всегда использовал `TelegramTokenService.getTelegramBotToken()`, который возвращает токен основного бота
2. **AdminTelegramService** использовал хардкодированный токен основного бота
3. Отсутствовала логика выбора токена в зависимости от NODE_ENV

## Исправления

### 1. TelegramService.ts
```typescript
private async botReady(): Promise<boolean> {
  // В development среде используем тестовый бот для клиентских уведомлений
  if (process.env.NODE_ENV === 'development') {
    this.bot_token = await TelegramTokenService.getWebappBotToken();
    console.log('🔑 Using WEBAPP_TELEGRAM_BOT_TOKEN (@strattera_test_bot) for development');
  } else {
    this.bot_token = await TelegramTokenService.getTelegramBotToken();
    console.log('🔑 Using TELESKLAD_BOT_TOKEN (@telesklad_bot) for production');
  }
  // ... остальная логика
}
```

### 2. AdminTelegramService.ts
```typescript
// Получаем токен в зависимости от окружения
let botToken: string | null;
if (process.env.NODE_ENV === 'development') {
  botToken = await TelegramTokenService.getWebappBotToken();
  console.log('🔑 AdminTelegramService using WEBAPP_TELEGRAM_BOT_TOKEN (@strattera_test_bot) for development');
} else {
  botToken = await TelegramTokenService.getTelegramBotToken();
  console.log('🔑 AdminTelegramService using TELESKLAD_BOT_TOKEN (@telesklad_bot) for production');
}
```

## Переменные окружения

### Development (.env)
```bash
NODE_ENV="development"
WEBAPP_TELEGRAM_BOT_TOKEN="7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg"  # @strattera_test_bot
TELESKLAD_BOT_TOKEN="7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4"      # @telesklad_bot
```

### Production
```bash
NODE_ENV="production"
TELESKLAD_BOT_TOKEN="7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4"      # @telesklad_bot (основной)
```

## Логика маршрутизации

| Окружение | Клиентские уведомления | Админские уведомления | Описание |
|-----------|------------------------|----------------------|----------|
| Development | @strattera_test_bot | @strattera_test_bot | Все тестируется в изолированном боте |
| Production | @telesklad_bot | @telesklad_bot | Все работает через основной бот |

## Тестирование

1. Убедиться что NODE_ENV="development"
2. Оформить заказ через https://strattera.ngrok.app/webapp
3. Проверить логи:
   ```
   🔑 Using WEBAPP_TELEGRAM_BOT_TOKEN (@strattera_test_bot) for development
   ✅ Message sent to 125861752, ID: X
   ```
4. Уведомление должно прийти в @strattera_test_bot

## Связанные файлы

- `src/lib/services/TelegramService.ts` - основной сервис для клиентских уведомлений
- `src/lib/services/AdminTelegramService.ts` - сервис для админских уведомлений  
- `src/lib/services/ReportService.ts` - использует оба сервиса для отправки уведомлений
- `src/lib/services/telegram-token.service.ts` - централизованное управление токенами

## Команды для проверки

```bash
# Проверить статус токенов
npm run telegram:status

# Переключить на тестовый бот (в development автоматически)
npm run telegram:switch:test

# Переключить на основной бот
npm run telegram:switch:prod
```

## Результат

✅ В development среде все уведомления (клиентские и админские) отправляются через @strattera_test_bot  
✅ В production среде все уведомления отправляются через @telesklad_bot  
✅ Полная изоляция development и production окружений  
✅ Логи четко показывают какой бот используется 