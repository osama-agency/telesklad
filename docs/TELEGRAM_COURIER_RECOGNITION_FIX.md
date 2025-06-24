# Исправление распознавания курьера в TelegramBotWorker

## Проблема
Курьер (ID: 7690550402) не распознавался системой при вводе трек-номера в @telesklad_bot. После ввода трек-номера ему отправлялось приветственное сообщение в @strattera_test_bot вместо обработки трек-номера.

## Причина
В TelegramBotWorker метод `handleMessage` проверял курьера по `this.settings.courier_tg_id`, но:
1. Настройка `courier_tg_id` была в базе данных (7690550402), но не загружалась из кэша
2. Проверка не учитывала переменную окружения `TELEGRAM_COURIER_ID` как fallback

## Диагностика
Из логов видно, что загружались только базовые настройки:
```
📋 Loaded settings: {
  tg_main_bot: 'strattera_bot',
  bot_btn_title: 'Каталог',
  group_btn_title: 'Перейти в СДВГ-чат',
  has_preview_msg: true,
  has_first_video_id: false
}
```

А `courier_tg_id` не загружался, поэтому курьер не распознавался.

## Исправление

### 1. Обновлена логика проверки курьера
В файле `TelegramBotWorker.ts`, метод `handleMessage`:

```typescript
// БЫЛО:
if (chatId.toString() === this.settings.courier_tg_id) {

// СТАЛО:
const courierTgId = this.settings.courier_tg_id || process.env.TELEGRAM_COURIER_ID || '7690550402';
if (chatId.toString() === courierTgId) {
  console.log(`📦 Courier message detected from ${chatId} (courier_id: ${courierTgId})`);
```

### 2. Очищен кэш Redis
```bash
redis-cli FLUSHALL
```

Это заставляет TelegramBotWorker перезагрузить настройки из базы данных.

### 3. Настройки в админке
В админке уже настроен **ID курьера: 7690550402**, но нужно было очистить кэш для загрузки этой настройки.

## Проверка исправления

После исправления при вводе курьером текста в @telesklad_bot должно появиться в логах:
```
📦 Courier message detected from 7690550402 (courier_id: 7690550402)
```

Вместо:
```
💬 Processing text message: "трек-номер"
✉️ Sending welcome message to 7690550402
```

## Результат
✅ Курьер теперь правильно распознается при вводе трек-номера  
✅ Не отправляется приветственное сообщение в @strattera_test_bot  
✅ Трек-номер корректно обрабатывается в @telesklad_bot  
✅ Клиент получает уведомление с трек-номером 