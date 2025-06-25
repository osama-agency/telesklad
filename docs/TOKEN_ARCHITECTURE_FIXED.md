# Архитектура токенов ботов - ИСПРАВЛЕНО

## ✅ Что исправлено

Удалены дублирующие токены из .env файла. Теперь используется **единый источник истины** - база данных.

## 🎯 Текущая архитектура

### База данных (settings) - Единственный источник
- `client_bot_token` - токен @strattera_test_bot (7754514670:...)
- `admin_bot_token` - токен @telesklad_bot (7612206140:...)

### Логика загрузки токенов
```typescript
// GrammyBotWorker.ts строка 75
const botToken = token || await SettingsService.get('client_bot_token', process.env.WEBAPP_TELEGRAM_BOT_TOKEN);
```

**Теперь:**
1. Сначала ищет в БД (`client_bot_token`)
2. Если в БД нет - fallback на .env (но .env пуст)
3. Если нет нигде - ошибка инициализации

## 🔧 Преимущества нового подхода

1. **Единый источник истины** - все токены в БД
2. **Удобное управление** - можно менять токены через админку
3. **Безопасность** - токены не в файлах проекта
4. **Гибкость** - разные токены для dev/prod в одной БД

## 📋 Проверка статуса

Из логов видно что система работает:
```
✅ Welcome message sent { userId: 125861752 }
✅ Bot settings loaded via SettingsService
✅ GrammyBotWorker initialized successfully
```

## 🎥 Следующий шаг - добавление видео

Теперь можно добавлять видео в приветственное сообщение:

1. Отправьте видео в @strattera_test_bot (как админ 125861752)
2. Бот должен ответить с File ID
3. Сохраните File ID: `npx tsx scripts/update-video-id.ts "FILE_ID"`

## 🔍 Мониторинг

Логи показывают успешную обработку:
- Webhook активен: https://strattera.ngrok.app/api/telegram/grammy-simple/webhook
- Сообщения обрабатываются за 400-900ms
- Ошибок нет

