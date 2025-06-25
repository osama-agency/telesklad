# ADMIN RECOGNITION FIX

## Проблема
При отправке видео в @strattera_test_bot админ с ID `125861752` получал приветственное сообщение вместо File ID, хотя видео корректно обрабатывалось.

## Причина
В базе данных настройка `admin_chat_id` была установлена как `-1002291288806` (ID группы) вместо личного ID админа `125861752`.

## Исправление

### 1. Обновление admin_chat_id в базе данных
```sql
UPDATE settings 
SET value = '125861752', updated_at = NOW() 
WHERE variable = 'admin_chat_id';
```

### 2. Исправление метода isAdmin() в коде
В файле `src/lib/services/grammy/GrammyBotWorker.ts`:
```typescript
// ДО (неправильно - использовал admin_ids)
private isAdmin(userId?: number): boolean {
  if (!userId) return false;
  const adminIds = this.settings.admin_ids?.split(',').map(id => id.trim()) || ['125861752'];
  return adminIds.includes(userId.toString());
}

// ПОСЛЕ (правильно - используем admin_chat_id)
private isAdmin(userId?: number): boolean {
  if (!userId) return false;
  const adminChatId = this.settings.admin_chat_id || '125861752';
  return userId.toString() === adminChatId;
}
```

### 3. Удаление устаревшего поля admin_ids
Убрана строка `admin_ids: settings.admin_chat_id` из `loadSettings()`.

### 4. Очистка кэша настроек
```typescript
await SettingsService.clearCache();
```

### 5. Перезапуск сервера
```bash
pkill -f "next dev" && sleep 2 && PORT=3000 npm run dev
```

## Результат
- ✅ Админ теперь правильно распознается как `isAdmin: true`
- ✅ При отправке видео админ получает File ID для сохранения
- ✅ Обычные пользователи продолжают получать приветственные сообщения

## Техническая информация
- **Файл**: `src/lib/services/grammy/GrammyBotWorker.ts`
- **Метод**: `isAdmin()` проверяет `userId` против `admin_chat_id` из настроек
- **Настройка**: `admin_chat_id` теперь содержит `125861752`

## Логи до исправления
```
isAdmin: false
videoFileId: 'BAACAgIAAxkBAAIBdGhcDxaSVAKdfDsjfUK11t24qvjsAAL8eQACGG7gSggkRZVc-saNNgQ'
```

## Логи после исправления
Фактический результат:
```
isAdmin: true
videoFileId: 'BAACAgIAAxkBAAIBhGhcEQABGPrLRuy1bX2kSTyY1JDtzgACG3oAAhhu4EpAB3fepdaJ7jYE'
```

## Сохранение Video ID
```bash
# Video ID сохранен в настройки:
first_video_id = 'BAACAgIAAxkBAAIBhGhcEQABGPrLRuy1bX2kSTyY1JDtzgACG3oAAhhu4EpAB3fepdaJ7jYE'
```

---
**Дата исправления**: 25 июня 2025  
**Статус**: ✅ Полностью исправлено и протестировано 