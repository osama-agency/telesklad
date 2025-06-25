# 🔄 Детальный план миграции TelegramBotWorker на grammY

## 📊 Анализ необходимых изменений

### 1. Замена импортов и типов

**Было:**
```typescript
import TelegramBot from 'node-telegram-bot-api';
private bot: TelegramBot | null = null;
```

**Станет:**
```typescript
import { Bot, Context, InlineKeyboard } from 'grammy';
private bot: Bot<Context> | null = null;
```

### 2. Замена типов параметров

| node-telegram-bot-api | grammY |
|----------------------|--------|
| TelegramBot.Message | Context (ctx.message) |
| TelegramBot.CallbackQuery | Context (ctx.callbackQuery) |
| TelegramBot.InlineKeyboardMarkup | InlineKeyboard |
| TelegramBot.InlineKeyboardButton | Встроено в InlineKeyboard |

### 3. Замена методов API

| Было | Станет |
|------|--------|
| `bot.sendMessage(chatId, text, options)` | `bot.api.sendMessage(chatId, text, options)` |
| `bot.deleteMessage(chatId, msgId)` | `bot.api.deleteMessage(chatId, msgId)` |
| `bot.answerCallbackQuery(id, options)` | `ctx.answerCallbackQuery(options)` |
| `bot.editMessageText(text, options)` | `ctx.editMessageText(text, options)` |
| `bot.setWebHook(url, options)` | `bot.api.setWebhook(url, options)` |
| `bot.getWebHookInfo()` | `bot.api.getWebhookInfo()` |
| `bot.deleteWebHook()` | `bot.api.deleteWebhook()` |

### 4. Изменение обработки webhook

**Было:**
```typescript
async processWebhookUpdate(update: any): Promise<void> {
  if (update.callback_query) {
    await this.handleCallback(update.callback_query);
  } else if (update.message) {
    await this.handleMessage(update.message);
  }
}
```

**Станет:**
```typescript
// Настройка обработчиков при инициализации
private setupHandlers() {
  this.bot.on('callback_query', (ctx) => this.handleCallback(ctx));
  this.bot.on('message', (ctx) => this.handleMessage(ctx));
}

// Обработка webhook через middleware
webhookHandler() {
  return webhookCallback(this.bot, 'express');
}
```

### 5. Изменение сигнатур методов

**handleMessage:**
```typescript
// Было
private async handleMessage(msg: TelegramBot.Message): Promise<void> {
  const chatId = msg.chat.id;
  const text = msg.text;
}

// Станет
private async handleMessage(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  const text = ctx.message?.text;
}
```

**handleCallback:**
```typescript
// Было
private async handleCallback(query: TelegramBot.CallbackQuery): Promise<void> {
  const data = query.data;
  const message = query.message;
}

// Станет
private async handleCallback(ctx: Context): Promise<void> {
  const data = ctx.callbackQuery?.data;
  const message = ctx.callbackQuery?.message;
}
```

### 6. Создание клавиатур

**Было:**
```typescript
const markup: TelegramBot.InlineKeyboardMarkup = {
  inline_keyboard: [[
    { text: 'Button', callback_data: 'test' }
  ]]
};
```

**Станет:**
```typescript
const keyboard = new InlineKeyboard()
  .text('Button', 'test');
```

## 🚀 План миграции по шагам

### Шаг 1: Создание нового класса TelegramBotWorkerGrammy

1. Скопировать TelegramBotWorker.ts в TelegramBotWorkerGrammy.ts
2. Заменить импорты
3. Изменить типы
4. НЕ трогать бизнес-логику

### Шаг 2: Адаптация методов API

1. Заменить все вызовы bot.* на bot.api.*
2. Изменить обработку webhook
3. Адаптировать создание клавиатур

### Шаг 3: Тестирование каждого метода

1. /start команда
2. Обработка сообщений
3. Callback кнопки (i_paid, approve_payment)
4. Отправка уведомлений

### Шаг 4: Переключение на новую версию

1. Изменить импорт в других файлах
2. Протестировать в dev окружении
3. Удалить старую версию

## ⚠️ Критические моменты

1. **Сохранить всю бизнес-логику** - меняем только API вызовы
2. **Redis интеграция** должна остаться без изменений
3. **ReportService** не должен быть затронут
4. **Prisma запросы** остаются теми же

## ✅ Преимущества после миграции

1. Устранение всех 5 уязвимостей
2. Улучшенная типизация
3. Более чистый код
4. Готовность к будущим обновлениям API

---
*План создан для безопасной миграции без потери функциональности*
