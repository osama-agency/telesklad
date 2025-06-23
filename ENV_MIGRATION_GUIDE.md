# 🔄 Руководство по миграции переменных окружения

## 📋 Обзор изменений

Проведен полный анализ проекта и актуализация переменных окружения с учетом использования ngrok для единого окружения разработки и продакшена.

## 📁 Созданные файлы

### 1. `.env.unified` - Рекомендуемый файл
Оптимизированный .env для работы с ngrok, объединяющий локальную разработку и продакшен.

### 2. `.env.production-ready` - Полная конфигурация
Содержит все возможные переменные с детальными комментариями.

### 3. `.env.complete` - Шаблон
Полный шаблон со всеми найденными в проекте переменными.

## 🔧 Ключевые изменения в коде

### 1. Обновлены fallback URL
- `notification-executor.service.ts`: изменены fallback URL с `telesklad.ru` на `strattera.ngrok.app`
- `telegram/webapp-bot/info/route.ts`: обновлен localhost на ngrok домен

### 2. Унификация URL переменных
- `NEXTAUTH_URL` = `https://strattera.ngrok.app`
- `WEBAPP_URL` = `https://strattera.ngrok.app/webapp`
- Единые URL для всех уведомлений

## 🚀 Инструкция по использованию

### Шаг 1: Замените текущий .env
```bash
# Создайте резервную копию
cp .env .env.backup-$(date +%Y%m%d)

# Используйте новый унифицированный файл
cp .env.unified .env
```

### Шаг 2: Запуск проекта
```bash
# 1. Остановите все процессы Next.js
pkill -f "next dev"

# 2. Запустите Next.js ОБЯЗАТЕЛЬНО на порту 3000
PORT=3000 npm run dev

# 3. В отдельном терминале запустите ngrok
ngrok http --domain=strattera.ngrok.app 3000

# 4. Настройте webhook бота
npm run telegram:webhook:setup
```

### Шаг 3: Проверка работы
- WebApp: https://strattera.ngrok.app/webapp
- API: https://strattera.ngrok.app/api/webapp/profile
- Webhook: https://strattera.ngrok.app/api/telegram/webhook

## 📊 Анализ переменных окружения

### ✅ Обязательные переменные
- `DATABASE_URL` - PostgreSQL подключение
- `NEXTAUTH_URL` - URL приложения
- `NEXTAUTH_SECRET` - ключ шифрования
- `TELEGRAM_BOT_TOKEN` - токен бота
- `WEBAPP_URL` - URL для уведомлений

### 🔧 Сервисы
- `S3_*` - хранилище файлов (Beget)
- `OPENAI_API_KEY` - AI функции
- `DADATA_*` - российские адреса
- `ADMIN_EMAILS` - администраторы

### 🤖 Telegram настройки
- Используется тестовый бот `@strattera_test_bot`
- Webhook URL автоматически настраивается на ngrok
- Все ID участников настроены

## ⚠️ Важные моменты

### 1. Порт 3000 критически важен
Ngrok домен `strattera.ngrok.app` настроен именно на порт 3000. Использование других портов сломает интеграцию.

### 2. NODE_ENV=development
Оставлен development режим для активации отладочных функций и использования тестового бота.

### 3. Общая база данных
База данных общая для dev и prod - будьте осторожны с изменениями!

### 4. Webhook vs Polling
Система настроена на webhook режим через ngrok, polling отключен.

## 🔍 Места в коде с изменениями

### Обновленные файлы:
1. `src/lib/services/notification-executor.service.ts`
   - Изменены fallback URL в уведомлениях
   - Теперь используется `strattera.ngrok.app` вместо `telesklad.ru`

2. `src/app/api/telegram/webapp-bot/info/route.ts`
   - Обновлен fallback URL с localhost на ngrok

### Логика выбора токенов:
- `src/lib/services/telegram-token.service.ts` автоматически выбирает тестовый бот в development режиме
- Поддерживается fallback к переменным окружения

## 📝 Команды для управления

```bash
# Переключение между ботами
npm run telegram:switch:test    # тестовый бот
npm run telegram:switch:prod    # продакшен бот

# Управление webhook
npm run telegram:webhook:setup  # настроить
npm run telegram:webhook:info   # информация
npm run telegram:webhook:delete # удалить

# Проверка переменных
cat .env | grep -E "^[A-Z]" | cut -d= -f1 | sort
```

## 🎯 Результат

Теперь у вас единая конфигурация, которая:
- ✅ Работает с ngrok для внешнего доступа
- ✅ Использует тестовый бот для безопасности
- ✅ Имеет правильные URL во всех уведомлениях
- ✅ Поддерживает все функции проекта
- ✅ Легко переключается между dev и prod режимами