# Исправление инициализации Grammy Bot

## Проблема
Ошибка "Bot not initialized!" при обработке webhook запросов. Grammy требует вызова `bot.init()` для получения информации о боте перед обработкой обновлений.

## Решение

### 1. Добавить bot.init() в GrammyBotWorker

В файле `src/lib/services/grammy/GrammyBotWorker.ts` в методе `initialize()` после создания бота нужно добавить:

```typescript
// Создаем новый экземпляр бота с правильным токеном
this.bot = new Bot<ExtendedContext>(botToken);

logger.info('🚀 Initializing grammY bot...', undefined, 'Grammy');

// ВАЖНО: Инициализируем бот для получения информации о нем
await this.bot.init();
logger.info('✅ Bot info loaded', undefined, 'Grammy');
```

### 2. Проверить настройки в базе данных

Приветственное сообщение находится в настройке `preview_msg`:
```
Strattera Bot — ваш удобный магазин витаминов, БАДов и товаров для здоровья из Турции и Европы.

Чтобы оформить заказ, нажмите кнопку "Каталог" или перейдите по ссылке https://t.me/strattera_bot?startapp. Это самый быстрый и удобный способ выбрать нужные товары.
```

### 3. Кнопки в приветственном сообщении

Согласно `KeyboardUtils.createWelcomeKeyboard()`:
- 🛒 Каталог - WebApp кнопка
- 👥 Наша группа - ссылка на https://t.me/+2rTVT8IxtFozNDY0
- 💬 Поддержка - ссылка на https://t.me/strattera_help

### 4. Проверка webhook endpoints

- @strattera_test_bot → /api/telegram/grammy-simple/webhook
- @telesklad_bot → /api/telegram/telesklad-webhook

Оба используют GrammyBotWorker но с разными токенами.

## Тестирование

После добавления `bot.init()`:

1. Перезапустить сервер
2. Написать любое сообщение в @strattera_test_bot
3. Должно прийти приветственное сообщение с кнопками

## Статус
⏳ Требуется добавить `bot.init()` в код
