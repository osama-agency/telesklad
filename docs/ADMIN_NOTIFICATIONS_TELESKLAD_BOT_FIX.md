# Исправление маршрутизации админских уведомлений в @telesklad_bot

## Проблема
Админские уведомления о проверке оплаты (кнопка "Оплата пришла") отправлялись в @strattera_test_bot вместо @telesklad_bot.

## Причина
В `AdminTelegramService.ts` была логика выбора бота в зависимости от `NODE_ENV`:
- В development использовался @strattera_test_bot
- В production использовался @telesklad_bot

Но согласно архитектуре проекта, админские уведомления ВСЕГДА должны идти в @telesklad_bot.

## Исправление

### 1. AdminTelegramService.ts
```typescript
// БЫЛО:
if (process.env.NODE_ENV === 'development') {
  botToken = await TelegramTokenService.getWebappBotToken();
  console.log('🔑 AdminTelegramService using WEBAPP_TELEGRAM_BOT_TOKEN (@strattera_test_bot) for development');
} else {
  botToken = await TelegramTokenService.getTelegramBotToken();
  console.log('🔑 AdminTelegramService using TELESKLAD_BOT_TOKEN (@telesklad_bot) for production');
}

// СТАЛО:
// Админские уведомления ВСЕГДА идут в @telesklad_bot
const botToken = await TelegramTokenService.getTelegramBotToken();
console.log('🔑 AdminTelegramService using TELESKLAD_BOT_TOKEN (@telesklad_bot) for admin notifications');
```

### 2. telesklad-webhook/route.ts
Убрана неправильная проверка ID пользователя:
```typescript
// БЫЛО:
if (update?.message?.from?.id !== TELESKLAD_BOT_ID && 
    update?.callback_query?.from?.id !== TELESKLAD_BOT_ID) {
  return NextResponse.json({ ok: false, error: 'Wrong bot ID' }, { status: 403 });
}

// СТАЛО:
// Убрана проверка - webhook должен принимать сообщения от любых пользователей
```

### 3. test-telegram-notifications/route.ts
Исправлены ошибки:
- Правильный импорт prisma: `@/libs/prismaDb`
- Конвертация Decimal в number для совместимости с ReportService
- Исправлена сериализация BigInt в JSON ответе

## Результат

Теперь при нажатии "Я оплатил" в Telegram WebApp:

1. **Клиент получает уведомление** в @strattera_test_bot:
   ```
   ⏳ Идет проверка вашего перевода в нашей системе.
   
   Пожалуйста, ожидайте - как только мы подтвердим оплату, вы получите уведомление здесь.
   
   Примерное время ожидания: от 5 до 30 минут.
   ```

2. **Админ получает уведомление** в @telesklad_bot:
   ```
   ‼️‼️Development‼️‼️
   
   Надо проверить оплату по заказу №24522
   
   Итого отправил клиент: 5700₽
   
   Банк: ВТБ БАНК — Гульнара С. — +79046092695
   
   📄 Состав заказа:
   • Atominex 18 mg — 1шт. — 5200₽,
   • Доставка — услуга — 500₽
   
   📍 Адрес: [адрес]
   👤 ФИО: [ФИО]
   📱 Телефон: [телефон]
   
   [Кнопка: "Оплата пришла"]
   ```

## Архитектура ботов

- **@strattera_test_bot** - для клиентских уведомлений в development
- **@telesklad_bot** - для админских уведомлений (всегда)

## Тестирование

Команда для тестирования:
```bash
curl -X POST http://localhost:3000/api/test-telegram-notifications
```

Проверить webhook статус:
```bash
curl "https://api.telegram.org/bot7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4/getWebhookInfo"
```

## Статус
✅ **ИСПРАВЛЕНО** - Админские уведомления теперь корректно отправляются в @telesklad_bot 