# Добавление видео в приветственное сообщение

## Проблема
При отправке видео админом бот не показывает File ID видео, а вместо этого отправляет обычное приветственное сообщение.

## Причина
1. Обработчик видео сообщений `message:video` не срабатывает правильно
2. Видео попадает в общий обработчик `message`, который отправляет приветственное сообщение
3. Настройка `first_video_id` не загружается в методе `loadSettings()`

## Решение

### 1. Исправить общий обработчик сообщений в GrammyBotWorker.ts

В методе `setupMessages()` обновить общий обработчик (строка ~333):

```typescript
// Обработка остальных типов сообщений
this.bot.on('message', async (ctx) => {
  // Добавим более детальное логирование
  const messageType = ctx.message?.video ? 'video' : 
                     ctx.message?.photo ? 'photo' : 
                     ctx.message?.document ? 'document' :
                     ctx.message?.voice ? 'voice' :
                     ctx.message?.audio ? 'audio' :
                     ctx.message?.sticker ? 'sticker' : 'unknown';
                     
  logger.info('📨 Message received', { 
    type: messageType,
    hasVideo: !!ctx.message?.video,
    videoFileId: ctx.message?.video?.file_id,
    userId: ctx.from?.id,
    isAdmin: this.isAdmin(ctx.from?.id)
  }, 'Grammy');
  
  // Если это видео от админа, обрабатываем специально
  if (ctx.message?.video && this.isAdmin(ctx.from?.id)) {
    await this.handleVideoMessage(ctx);
  } else if (ctx.message?.photo && this.isAdmin(ctx.from?.id)) {
    await this.handlePhotoMessage(ctx);
  } else {
    await this.sendWelcomeMessage(ctx);
  }
});
```

### 2. Добавить загрузку first_video_id в loadSettings()

В методе `loadSettings()` (строка ~150) добавить:

```typescript
this.settings = {
  // ... existing settings ...
  first_video_id: settings.first_video_id, // Добавить эту строку
  // ... rest of settings ...
};
```

### 3. Убедиться что SettingsService загружает first_video_id

В файле `src/lib/services/SettingsService.ts` в методе `getBotSettings()` должна быть строка:

```typescript
first_video_id: await this.get('first_video_id'),
```

## Как использовать

1. Внести указанные изменения в код
2. Перезапустить сервер
3. Отправить видео в бот как админ (ID: 125861752)
4. Бот ответит с File ID видео:
   ```
   📹 Видео получено!
   
   🆔 File ID: `BAACAgIAAxkBAAIBZWcLxR...`
   📏 Размер: 1920x1080
   ⏱ Длительность: 30 сек
   ```
5. Скопировать File ID
6. Обновить настройку в базе данных:
   ```bash
   npx tsx scripts/update-video-id.ts "BAACAgIAAxkBAAIBZWcLxR..."
   ```

## Проверка

После обновления настройки, при отправке любого сообщения боту, он должен отправлять видео с приветственным текстом вместо просто текста.

# ADD VIDEO TO WELCOME MESSAGE - COMPLETE IMPLEMENTATION

## Задача
Добавить видео в приветственное сообщение Telegram бота и обновить кнопки для соответствия тексту.

## Выполненные действия

### 1. Исправление распознавания админа
- **Проблема**: `admin_chat_id` был установлен как ID группы (-1002291288806) вместо личного ID админа
- **Решение**: Обновлен `admin_chat_id` на `125861752` (личный ID админа)
- **Результат**: Админ теперь правильно распознается как `isAdmin: true`

### 2. Исправление метода isAdmin()
- **Проблема**: Метод использовал несуществующее поле `admin_ids`
- **Решение**: Изменен метод для использования `admin_chat_id`
```typescript
// ДО
private isAdmin(userId?: number): boolean {
  if (!userId) return false;
  const adminIds = this.settings.admin_ids?.split(',').map(id => id.trim()) || ['125861752'];
  return adminIds.includes(userId.toString());
}

// ПОСЛЕ
private isAdmin(userId?: number): boolean {
  if (!userId) return false;
  const adminChatId = this.settings.admin_chat_id || '125861752';
  return userId.toString() === adminChatId;
}
```

### 3. Получение и сохранение Video ID
- **File ID получен**: `BAACAgIAAxkBAAIBhGhcEQABGPrLRuy1bX2kSTyY1JDtzgACG3oAAhhu4EpAB3fepdaJ7jYE`
- **Сохранен в настройки**: `first_video_id` в таблице `settings`
- **Результат**: Видео теперь отправляется в приветственных сообщениях

### 4. Обновление текста приветственного сообщения
Обновлен текст в настройке `preview_msg`:
```
👋 Добро пожаловать в Strattera Bot!
Ваш удобный магазин витаминов, БАДов и товаров для здоровья из Турции и Европы.

🛍 Чтобы оформить заказ, нажмите кнопку «Каталог» или перейдите по ссылке:
👉 Открыть каталог

⚠️ Пожалуйста, не отправляйте заявки в этом чате.
Для оформления используйте каталог — так быстрее и удобнее.

❓ Остались вопросы? Нажмите кнопку «Задать вопрос»
```

### 5. Обновление кнопок клавиатуры
В файле `src/lib/services/grammy/utils/keyboard-utils.ts`:
- **Изменена кнопка каталога**: с "🛒 Каталог" на "👉 Открыть каталог"
- **Изменена кнопка поддержки**: с "💬 Поддержка" на "❓ Задать вопрос"

```typescript
static createWelcomeKeyboard(webappUrl?: string): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  
  // Основная кнопка для WebApp
  const appUrl = webappUrl || process.env.WEBAPP_URL || 'https://strattera.ngrok.app/webapp';
  keyboard.webApp('👉 Открыть каталог', appUrl);
  
  // Вторая строка с дополнительными кнопками
  keyboard.row();
  keyboard.url('❓ Задать вопрос', 'https://t.me/strattera_help');
  keyboard.url('👥 Наша группа', 'https://t.me/+2rTVT8IxtFozNDY0');
  
  return keyboard;
}
```

## Текущий результат

### ✅ Что работает:
1. **Админ распознается правильно**: `isAdmin: true` в логах
2. **Video ID получается**: При отправке видео админ получает File ID
3. **Видео в приветствии**: Новые пользователи получают видео с приветственным текстом
4. **Кнопки соответствуют тексту**: 
   - "👉 Открыть каталог" → открывает WebApp
   - "❓ Задать вопрос" → переходит в поддержку
   - "👥 Наша группа" → переходит в группу

### 🎯 Логи успешной работы:
```
2025-06-25T15:08:49.371Z [INFO] [Grammy] 📹 Video message received {
  userId: 125861752,
  isAdmin: true,  ← ✅ Админ распознается
  videoFileId: 'BAACAgIAAxkBAAIBhGhcEQABGPrLRuy1bX2kSTyY1JDtzgACG3oAAhhu4EpAB3fepdaJ7jYE',
  videoSize: '1920x1080'
}

2025-06-25T15:12:18.402Z [INFO] [Grammy] ✅ Welcome video sent { userId: 125861752 }
```

### 📋 Настройки в базе данных:
- `admin_chat_id`: `125861752`
- `first_video_id`: `BAACAgIAAxkBAAIBhGhcEQABGPrLRuy1bX2kSTyY1JDtzgACG3oAAhhu4EpAB3fepdaJ7jYE`
- `preview_msg`: Обновлен с форматированным текстом

## Техническая архитектура

### Обработка видео (для админов):
1. Видео сообщение → `handleVideoMessage()`
2. Проверка `isAdmin()` → `true`
3. Отправка File ID админу
4. Логирование в консоль

### Приветственное сообщение (для пользователей):
1. Любое сообщение → `sendWelcomeMessage()`
2. Попытка отправить видео (`first_video_id`)
3. Fallback на текст при ошибке
4. Добавление клавиатуры с WebApp кнопкой

### WebApp интеграция:
- Кнопка "👉 Открыть каталог" использует `keyboard.webApp()`
- URL: `https://strattera.ngrok.app/webapp`
- Открывается внутри Telegram как Web App

### 6. Исправление кнопки "Я оплатил"
- **Проблема**: Callback приходил как `'i_paid'` без ID заказа, но Grammy ожидал `'i_paid_${orderId}'`
- **Решение**: Обновлен `ReportService.formClientMarkup()` для передачи ID заказа
- **Результат**: Кнопка "Я оплатил" теперь работает без долгой загрузки

```typescript
// Исправлено в ReportService.ts
let callbackData = options.markup;
if (options.markup === 'i_paid' && orderId) {
  callbackData = `i_paid_${orderId}`;  // ← Добавлен ID заказа
}
```

### 7. Обновление текста приветствия (финальная версия)
Убрана лишняя ссылка из текста:
```
🛍 Чтобы оформить заказ, нажмите кнопку «Каталог».
```
(Убрано: "или перейдите по ссылке: 👉 Открыть каталог")

---
**Дата завершения**: 25 июня 2025  
**Статус**: ✅ Полностью реализовано и протестировано  
**Следующие шаги**: Тестирование на реальных пользователях

## Связанные документы
- [I_PAID_CALLBACK_FIX.md](./I_PAID_CALLBACK_FIX.md) - Детальное исправление кнопки "Я оплатил"

