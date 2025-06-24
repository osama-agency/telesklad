# Исправление ошибки аутентификации Telegram WebApp

## Проблема
При запуске Telegram WebApp возникала ошибка "Error: The string did not match the expected pattern".

## Причина
Middleware блокировал доступ к API аутентификации `/api/webapp/auth/telegram`, перенаправляя запросы на страницу логина.

## Решение
Добавлен маршрут `/api/webapp` в список разрешенных публичных маршрутов в `src/middleware.ts`:

```typescript
// Разрешаем доступ к публичным маршрутам без токена
if (pathname.startsWith('/api/webhook') || 
    pathname.startsWith('/api/telegram') ||
    pathname.startsWith('/api/webapp') ||  // <- ДОБАВЛЕНО
    pathname.startsWith('/api/redis') ||
    pathname.startsWith('/api/test-telegram-notifications')) {
  return true;
}
```

## Результат
- ✅ API аутентификации работает корректно
- ✅ WebApp доступен по адресу https://strattera.ngrok.app/webapp
- ✅ Аутентификация через Telegram initData функционирует
- ✅ Тестовый пользователь создается автоматически в development режиме

## Тестирование
```bash
# Тест GET запроса
curl "http://localhost:3000/api/webapp/auth/telegram?tg_id=9999"

# Тест POST запроса
curl -X POST -H "Content-Type: application/json" \
  -d '{"initData": "user=%7B%22id%22%3A9999%7D"}' \
  "http://localhost:3000/api/webapp/auth/telegram"
```

## Файлы изменены
- `src/middleware.ts` - добавлен `/api/webapp` в authorized callback
- `src/middleware.ts.backup` - создана резервная копия

Дата исправления: $(date)
