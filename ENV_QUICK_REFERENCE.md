# 🚀 Краткая справка по переменным окружения

## 📋 Обязательные переменные

| Переменная | Описание | Текущее значение |
|------------|----------|------------------|
| `DATABASE_URL` | PostgreSQL подключение | ✅ Настроено (удаленная БД) |
| `NEXTAUTH_URL` | URL приложения | ✅ https://strattera.ngrok.app |
| `NEXTAUTH_SECRET` | Ключ шифрования | ⚠️ Замените в продакшене! |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | ✅ Тестовый бот настроен |

## 🤖 Telegram настройки

### Боты
- **Основной бот**: `@strattera_test_bot` (для разработки)
- **ID админа**: 125861752
- **ID курьера**: 7828956680
- **ID группы закупок**: -4729817036

### Команды для управления
```bash
# Переключиться на тестовый бот
npm run telegram:switch:test

# Переключиться на продакшен бот
npm run telegram:switch:prod

# Настроить webhook
npm run telegram:webhook:setup

# Информация о webhook
npm run telegram:webhook:info
```

## ☁️ S3 хранилище (Beget)

- **Эндпоинт**: https://s3.ru1.storage.beget.cloud
- **Бакет**: 2c11548b454d-eldar-agency
- **Статус**: ✅ Настроено и работает

## 🔧 Внешние сервисы

| Сервис | Статус | Назначение |
|--------|--------|------------|
| OpenAI | ✅ Активен | AI функции, аналитика |
| DaData | ✅ Активен | Работа с адресами РФ |
| Redis | ⚠️ Опционально | Очереди, кэш |

## 🚨 Важные заметки

1. **Для продакшена обязательно**:
   - Сгенерируйте новый `NEXTAUTH_SECRET`
   - Настройте `TELEGRAM_WEBHOOK_URL`
   - Используйте продакшен токен бота

2. **Безопасность**:
   - Никогда не коммитьте `.env` файл
   - Используйте `.env.local` для локальных переопределений
   - Храните продакшен ключи в безопасном месте

3. **Порядок загрузки переменных**:
   ```
   .env.local > .env.development > .env
   ```

## 📝 Полезные команды

```bash
# Проверить текущие переменные
cat .env | grep -E "^[A-Z]" | cut -d= -f1 | sort

# Создать резервную копию
cp .env .env.backup-$(date +%Y%m%d)

# Запустить приложение
npm run dev

# Запустить с ngrok
ngrok http --domain=strattera.ngrok.app 3000
```