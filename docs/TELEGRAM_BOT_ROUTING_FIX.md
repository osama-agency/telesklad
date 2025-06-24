# Исправление маршрутизации Telegram ботов

## Обзор проблемы

Система использует три бота с разными ролями:

1. **@strattera_bot** (основной бот для клиентов)
   - Работает на Rails сервере
   - Не обрабатывается в этом приложении

2. **@strattera_test_bot** (тестовый бот для разработки)
   - ID: 7754514670
   - Webhook: `/api/telegram/webapp-webhook`
   - Используется для разработки и тестирования новых функций
   - Обрабатывает все клиентские запросы в режиме разработки

3. **@telesklad_bot** (бот для админов/закупок)
   - ID: 7612206140
   - Webhook: `/api/telegram/telesklad-webhook`
   - Обрабатывает уведомления для админов и закупщиков
   - Отправляет сообщения в группу закупок

## Реализованные изменения

1. **Разделение вебхуков**:
   - Каждый бот теперь имеет свой уникальный endpoint
   - Добавлена проверка Bot ID для предотвращения путаницы
   - Используется единый `TelegramBotWorker` с разными токенами

2. **Управление токенами**:
   - Обновлен `TelegramTokenService` для работы с разными ботами
   - Добавлено кэширование токенов
   - Реализована валидация токенов

3. **Скрипты управления**:
   - Обновлен `scripts/manage-webhooks.js`
   - Добавлены команды для каждого бота
   - Улучшена обработка ошибок

## Конфигурация вебхуков

```bash
# Тестовый бот (@strattera_test_bot)
node scripts/manage-webhooks.js setup test

# Бот для закупок (@telesklad_bot)
node scripts/manage-webhooks.js setup telesklad
```

## Переменные окружения

```env
# Основной бот на Rails (@strattera_bot)
RAILS_BOT_TOKEN=...

# Тестовый бот (@strattera_test_bot)
WEBAPP_TELEGRAM_BOT_TOKEN=...

# Бот для закупок (@telesklad_bot)
TELESKLAD_BOT_TOKEN=...

# URL для вебхуков
NEXT_PUBLIC_APP_URL=https://strattera-admin.vercel.app
```

## Проверка конфигурации

```bash
# Проверить статус вебхуков
node scripts/manage-webhooks.js info test
node scripts/manage-webhooks.js info telesklad
```

## Обработка ошибок

1. **Неверный Bot ID**:
   - Запрос будет отклонен с кодом 403
   - В логах появится предупреждение

2. **Отсутствующий токен**:
   - Бот не будет инициализирован
   - В логах появится ошибка

3. **Ошибка Redis**:
   - Система продолжит работу без кэширования
   - Данные будут читаться напрямую из БД

## Проблема

В проекте NEXTADMIN используются два Telegram бота:
- **Основной бот** `@telesklad_bot` (ID: 7612206140) - для проверки оплаты админом
- **Тестовый бот** `@strattera_test_bot` (ID: 7754514670) - для разработки WebApp

**Проблема:** Когда админ нажимал "Оплата пришла" в основном боте, callback обрабатывался тестовым ботом, что вызывало ошибки:
- `ETELEGRAM: 400 Bad Request: query is too old and response timeout expired`
- Сообщение не редактировалось правильно
- Клиент не получал уведомление о подтверждении оплаты

## Решение

### 1. Разделение webhook endpoints

Созданы отдельные webhook endpoints для каждого бота:
- **Основной бот** `@telesklad_bot` → `/api/telegram/telesklad-webhook`
- **Тестовый бот** `@strattera_test_bot` → `/api/telegram/webapp-webhook`

### 2. Определение источника callback'а

В `TelegramBotWorker.handleApprovePayment()` добавлена логика определения бота:

```typescript
// Определяем, от какого бота пришел callback
const messageBotId = query.message.from?.id;
const isMainBot = messageBotId === 7612206140; // @telesklad_bot
```

### 2. Правильная обработка answerCallbackQuery

```typescript
if (isMainBot) {
  // Отвечаем через основной бот
  const MAIN_BOT_TOKEN = '7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4';
  const answerUrl = `https://api.telegram.org/bot${MAIN_BOT_TOKEN}/answerCallbackQuery`;
  
  await fetch(answerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: query.id,
      text: 'Подтверждаем оплату...',
      show_alert: false
    })
  });
} else if (this.bot) {
  // Отвечаем через тестовый бот
  await this.bot.answerCallbackQuery(query.id, { 
    text: 'Подтверждаем оплату...',
    show_alert: false 
  });
}
```

### 3. Правильное редактирование сообщений

```typescript
if (isMainBot) {
  // Редактируем через основной бот
  const editResponse = await fetch(editUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      text: finalMessage,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [] }
    })
  });
} else if (this.bot) {
  // Редактируем через тестовый бот
  await this.bot.editMessageText(finalMessage, {
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: [] }
  });
}
```

## Логика работы

### Сценарий "Я оплатил" (клиент)
1. Клиент нажимает "Я оплатил" в тестовом боте
2. Заказ меняет статус с `0` (unpaid) на `1` (paid)
3. `ReportService.onPaid()` отправляет уведомление админу через основной бот
4. Клиент получает сообщение об ожидании проверки

### Сценарий "Оплата пришла" (админ)
1. Админ нажимает "Оплата пришла" в основном боте
2. `TelegramBotWorker.handleApprovePayment()` определяет источник как основной бот
3. Заказ меняет статус с `1` (paid) на `2` (processing)
4. Сообщение админа редактируется через основной бот
5. `ReportService.onProcessing()` отправляет клиенту уведомление:

```
❤️ Благодарим вас за покупку!

🚚 Заказ №24486 находится у курьера и готовится к отправке.

Как только посылка будет отправлена, мы незамедлительно вышлем вам трек-номер для отслеживания.

Процесс отправки занимает от 5 до 48 часов.

Будем признательны за ваше терпение!
```

## Технические детали

### Токены ботов
- **Основной бот:** `7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4`
- **Тестовый бот:** Получается через `TelegramTokenService.getTelegramBotToken()`

### Webhook настройки
Оба бота используют один webhook endpoint: `https://strattera.ngrok.app/api/telegram/webhook`

### Статусы заказов
- `0` - unpaid (не оплачен)
- `1` - paid (оплачен, ожидает проверки)
- `2` - processing (подтвержден, у курьера)
- `3` - shipped (отправлен с трек-номером)

## Результат

✅ Callback'и от основного бота обрабатываются правильно
✅ Сообщения редактируются через правильный бот
✅ Клиент получает корректные уведомления
✅ Ошибки "query is too old" устранены
✅ Полная совместимость с существующей логикой

## Тестирование

1. Создать заказ через WebApp
2. Нажать "Я оплатил" в тестовом боте
3. Проверить уведомление админу в основном боте
4. Нажать "Оплата пришла" в основном боте
5. Проверить редактирование сообщения админа
6. Проверить уведомление клиенту о подтверждении

Дата: 24 января 2025
Статус: Реализовано

# Исправление маршрутизации между Telegram ботами

## Проблема
Курьер получал задание в @telesklad_bot, но при нажатии "Привязать трек-номер" запрос трек-номера отправлялся в @strattera_test_bot. Это создавало путаницу и нарушало логику работы.

## Причина
TelegramBotWorker - это singleton, который инициализируется с разными ботами в разных webhook'ах:
- `/api/telegram/telesklad-webhook` → @telesklad_bot
- `/api/telegram/webapp-webhook` → @strattera_test_bot

При обработке callback'ов методы `handleSubmitTracking` и `handleTrackBack` использовали `this.bot`, который мог быть инициализирован с неправильным ботом.

## Исправление

### 1. Определение источника callback'а
В методах `handleSubmitTracking`, `handleTrackBack` и `handleApprovePayment` добавлена логика определения бота по `message.from.id`:

```typescript
const messageBotId = query.message.from?.id;
const isMainBot = messageBotId === 7612206140; // @telesklad_bot
```

### 2. Условная маршрутизация
```typescript
if (isMainBot) {
  // Используем прямые API вызовы к @telesklad_bot
  const MAIN_BOT_TOKEN = '7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4';
  await fetch(`https://api.telegram.org/bot${MAIN_BOT_TOKEN}/sendMessage`, ...);
} else {
  // Используем this.bot для @strattera_test_bot
  await this.bot.sendMessage(...);
}
```

### 3. Исправленные методы
- `handleSubmitTracking()` - запрос трек-номера
- `handleTrackBack()` - возврат к деталям заказа  
- `handleApprovePayment()` - подтверждение оплаты (уже был исправлен ранее)

## Результат

Теперь при нажатии "Привязать трек-номер" в @telesklad_bot:
1. ✅ Запрос трек-номера отправляется в @telesklad_bot
2. ✅ Курьер вводит трек-номер в том же боте
3. ✅ Клиент получает уведомление с трек-номером
4. ✅ Вся коммуникация происходит в правильных ботах

## Архитектура ботов

### @telesklad_bot (7612206140)
- Админские уведомления
- Уведомления курьеру
- Обработка трек-номеров
- Подтверждение оплаты

### @strattera_test_bot (7754514670)  
- Клиентские уведомления в development
- WebApp интеграция
- Приветственные сообщения

## Команды для тестирования

```bash
# Отправить тестовое задание курьеру
curl -X POST "https://api.telegram.org/bot7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "7690550402",
    "text": "👀 Нужно отправить заказ №12345",
    "reply_markup": {
      "inline_keyboard": [[{
        "text": "Привязать трек-номер", 
        "callback_data": "submit_tracking"
      }]]
    }
  }'
```

## Логи для проверки

При правильной работе в логах должно быть:
```
🤖 Submit tracking callback from bot ID: 7612206140, isMainBot: true
✅ Tracking request sent via main bot
```

А НЕ:
```
🤖 Submit tracking callback from bot ID: 7612206140, isMainBot: true
✅ Tracking request sent via test bot
``` 