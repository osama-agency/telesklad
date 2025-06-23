# Конфигурация двух Telegram ботов

## Обзор

В проекте используются два Telegram бота:
1. **Основной бот** (@strattera_bot) - работает на продакшен Rails сервере
2. **Тестовый бот** (@strattera_test_bot) - для разработки на Next.js

## Архитектура

```mermaid
graph TB
    A[Telegram Users] --> B[@strattera_bot]
    A --> C[@strattera_test_bot]
    
    B --> D[Rails Server<br/>Production]
    C --> E[Next.js Server<br/>Development]
    
    D --> F[(PostgreSQL<br/>Production DB)]
    E --> F
    
    G[WebApp Production] --> D
    H[WebApp Development] --> E
```

## Токены в базе данных

В таблице `settings` хранятся два токена:
- `tg_token` - токен основного бота (7097447176:...)
- `webapp_telegram_bot_token` - токен тестового бота (7754514670:...)

## Автоматическое определение токена

`TelegramTokenService` автоматически выбирает нужный токен:
- В режиме разработки (`NODE_ENV=development`) - использует тестовый бот
- В продакшене - использует основной бот

## Команды управления

### Переключение на тестовый бот (для разработки)
```bash
npm run telegram:switch:test
```

### Переключение на продакшен бот
```bash
npm run telegram:switch:prod
```

### Настройка webhook для тестового бота
```bash
# 1. Запустить ngrok
ngrok http --domain=strattera.ngrok.app 3000

# 2. Настроить webhook
npm run telegram:webhook:setup
```

### Удаление webhook
```bash
npm run telegram:webhook:delete
```

### Проверка статуса webhook
```bash
npm run telegram:webhook:info
```

## Режимы работы

### 1. Разработка (Next.js + тестовый бот)

```bash
# Убедитесь что используется тестовый бот
npm run telegram:switch:test

# Запустить сервер
pkill -f "next dev" && PORT=3000 npm run dev

# Опция 1: Polling (рекомендуется для локальной разработки)
# Бот автоматически запустится в режиме polling

# Опция 2: Webhook через ngrok
ngrok http --domain=strattera.ngrok.app 3000
npm run telegram:webhook:setup
```

### 2. Продакшен (Rails + основной бот)

Основной бот должен продолжать работать на Rails сервере без изменений.

```bash
# Убедитесь что webhook удален с Next.js
npm run telegram:switch:prod
```

## Тестирование

### WebApp через тестовый бот
1. Откройте @strattera_test_bot в Telegram
2. Нажмите кнопку меню или отправьте команду
3. WebApp откроется по адресу https://strattera.ngrok.app/webapp

### Уведомления
При создании заказа через WebApp:
- В dev режиме - уведомление придет в @strattera_test_bot
- В prod режиме - уведомление придет в @strattera_bot

## Важные замечания

1. **Не смешивайте боты** - основной бот должен работать только с Rails
2. **Порт 3000** - Next.js всегда должен запускаться на порту 3000
3. **База данных** - оба бота используют одну базу данных
4. **Webhook** - только один webhook может быть активен для каждого бота

## Troubleshooting

### Ошибка "Port 3000 is in use"
```bash
pkill -f "next dev" && PORT=3000 npm run dev
```

### Бот не отвечает
1. Проверьте какой токен используется:
   ```bash
   npm run telegram:webhook:info
   ```
2. Убедитесь что webhook настроен правильно
3. Проверьте логи сервера

### Конфликт webhook
Если основной бот перестал работать:
```bash
npm run telegram:switch:prod
```
Это удалит webhook с Next.js и основной бот сможет работать на Rails. 