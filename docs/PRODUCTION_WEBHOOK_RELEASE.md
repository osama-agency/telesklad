# Освобождение продакшн бота для Rails приложения

## Проблема

При разработке Next.js приложения webhook продакшн бота @strattera_bot был "захвачен" локальным приложением, что нарушило работу производственного Rails сервера.

## Решение

Создан специальный скрипт `scripts/remove-production-webhook.js` для освобождения продакшн бота.

## Использование

### Быстрое освобождение бота
```bash
npm run telegram:production:release
```

### Проверка статуса ботов
```bash
npm run telegram:status
```

## Что делает скрипт

1. **Находит токен продакшн бота** из базы данных (переменная `tg_token`)
2. **Проверяет информацию о боте** через Telegram API
3. **Проверяет текущий webhook** - если установлен и указывает на разработку
4. **Удаляет webhook** с флагом `drop_pending_updates: true`
5. **Освобождает бота** для работы с Rails приложением

## Архитектура ботов

### Продакшн бот (@strattera_bot)
- **Токен**: `tg_token` в базе данных (7097447176:...)
- **Назначение**: Работает с Rails приложением на сервере
- **Webhook**: Должен быть установлен Rails приложением
- **Клиенты**: Реальные пользователи в продакшене

### Тестовый бот (@strattera_test_bot)  
- **Токен**: `webapp_telegram_bot_token` в базе данных (7754514670:...)
- **Назначение**: Только для разработки Next.js приложения
- **Webhook**: `https://strattera.ngrok.app/api/telegram/webapp-webhook`
- **Клиенты**: Разработчики и тестирование

## Проверка после освобождения

1. **Убедитесь, что webhook удален**:
   ```bash
   npm run telegram:production:release
   ```

2. **Проверьте статус ботов**:
   ```bash
   npm run telegram:status
   ```

3. **Запустите Rails сервер** и установите его webhook

4. **Проверьте работу продакшн бота** с Rails

## Важные замечания

⚠️ **Никогда не устанавливайте webhook продакшн бота на локальную разработку!**

✅ **Используйте только тестовый бот для разработки**

✅ **Продакшн бот должен работать только с Rails сервером**

## Команды для работы с ботами

| Команда | Описание |
|---------|----------|
| `npm run telegram:production:release` | Освободить продакшн бота для Rails |
| `npm run telegram:status` | Проверить статус всех ботов |
| `npm run telegram:switch:test` | Переключиться на тестовый бот |
| `npm run telegram:webhook:setup` | Настроить webhook тестового бота |
| `npm run telegram:webhook:delete` | Удалить webhook тестового бота |

## Troubleshooting

### Продакшн бот не отвечает
1. Проверьте, что webhook удален: `npm run telegram:production:release`
2. Убедитесь, что Rails сервер запущен
3. Проверьте, что Rails установил свой webhook

### Сообщения приходят в Next.js вместо Rails
1. Запустите: `npm run telegram:production:release`
2. Перезапустите Rails сервер
3. Проверьте базу данных на синхронизацию

### Тестовый бот не работает
1. Убедитесь, что ngrok запущен: `ngrok http --domain=strattera.ngrok.app 3000`
2. Настройте webhook: `npm run telegram:webhook:setup`
3. Проверьте порт 3000: `PORT=3000 npm run dev`

## Связанные файлы

- `scripts/remove-production-webhook.js` - основной скрипт
- `scripts/check-telegram-bots.ts` - проверка статуса ботов
- `src/lib/services/telegram-token.service.ts` - управление токенами
- `docs/TWO_BOTS_CONFIGURATION.md` - полная документация ботов 