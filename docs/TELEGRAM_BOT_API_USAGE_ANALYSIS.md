# 📊 Анализ использования node-telegram-bot-api в проекте NEXTADMIN

## 🔍 Обзор использования

### 1. TelegramBotWorker.ts (основной файл - 1276 строк)

**Используемые методы API:**
- `new TelegramBot(token, { polling: false })` - инициализация
- `bot.setWebHook(url, options)` - установка webhook
- `bot.getWebHookInfo()` - получение информации о webhook
- `bot.deleteWebHook()` - удаление webhook
- `bot.sendMessage(chatId, text, options)` - отправка сообщений
- `bot.deleteMessage(chatId, messageId)` - удаление сообщений
- `bot.answerCallbackQuery(callbackQueryId, options)` - ответ на callback
- `bot.editMessageText(text, options)` - редактирование сообщений
- `bot.sendVideo(chatId, videoId)` - отправка видео
- `bot.sendPhoto(chatId, photoId)` - отправка фото

**Используемые типы:**
- `TelegramBot.CallbackQuery` - тип для callback запросов
- `TelegramBot.Message` - тип для сообщений
- `TelegramBot.InlineKeyboardMarkup` - тип для клавиатуры
- `TelegramBot.InlineKeyboardButton` - тип для кнопок

**Основные функции:**
- Обработка webhook обновлений
- Обработка команд (/start, /admin, /test)
- Обработка callback кнопок (i_paid, approve_payment, submit_tracking)
- Работа с состояниями через Redis
- Отправка уведомлений через ReportService

### 2. SupportTelegramBotService.ts (простой файл - 28 строк)

**Используемые методы API:**
- `new TelegramBot(token, { polling: false })` - инициализация
- `bot.sendMessage(chatId, text)` - отправка сообщений

**Функции:**
- Отправка сообщений курьеру
- Отправка сообщений в группу закупщиков

## 📋 Детальный анализ методов

### Методы отправки сообщений:
1. `sendMessage` - используется для всех текстовых сообщений
2. `editMessageText` - редактирование после получения callback
3. `sendVideo` - отправка приветственного видео
4. `sendPhoto` - ответ на загруженные фото

### Обработка обновлений:
1. `processWebhookUpdate` - основной метод обработки
2. Разделение на `message` и `callback_query`
3. Использование Redis для хранения состояний

### Клавиатуры и кнопки:
1. Inline клавиатуры для заказов
2. Callback кнопки для действий
3. URL кнопки для внешних ссылок

## 🚨 Критические зависимости

1. **Типы данных** - нужно будет заменить все типы TelegramBot.*
2. **Webhook обработка** - главная функциональность
3. **Redis интеграция** - хранение состояний между запросами
4. **ReportService** - отправка уведомлений
5. **Prisma** - работа с базой данных

## ✅ Вывод

Проект использует базовые функции Telegram Bot API:
- Webhook режим (без polling)
- Отправка/редактирование сообщений
- Обработка callback кнопок
- Inline клавиатуры

Миграция возможна без потери функциональности, так как grammY поддерживает все эти возможности.
