# 🚀 Деплой Telesklad на Railway

## 📋 Предварительные требования

1. **GitHub репозиторий**: https://github.com/osama-agency/telesklad
2. **Railway аккаунт**: Зарегистрированный через GitHub
3. **PostgreSQL база данных**: Будет создана автоматически в Railway

## 🚄 Шаги деплоя

### 1. Создание проекта в Railway

1. Войдите на [railway.app](https://railway.app)
2. Нажмите **"New Project"**
3. Выберите **"Deploy from GitHub repo"**
4. Выберите репозиторий `osama-agency/telesklad`

### 2. Настройка PostgreSQL

1. В проекте Railway нажмите **"+ New"**
2. Выберите **"Database"** → **"PostgreSQL"**
3. Дождитесь создания базы данных
4. Скопируйте **DATABASE_URL** из настроек базы

### 3. Настройка переменных окружения

В разделе **Variables** добавьте:

```bash
# Основные настройки
NODE_ENV=production
PORT=3011

# База данных (скопируйте из PostgreSQL сервиса)
DATABASE_URL=postgresql://postgres:password@hostname:port/database

# Внешние API
STRATTERA_API_URL=https://strattera.tgapp.online/api/v1/orders
STRATTERA_API_TOKEN=8cM9wVBrY3p56k4L1VBpIBwOsw

# JWT
JWT_SECRET=your_super_secure_production_jwt_secret_here
JWT_EXPIRE=24h

# Администратор
ADMIN_EMAIL=go@osama.agency
ADMIN_PASSWORD=sfera13

# Telegram Bot (опционально)
TELEGRAM_BOT_TOKEN=8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M
TELEGRAM_CHAT_ID=-4729817036

# Прочее
CORS_ORIGIN=https://your-frontend-domain.railway.app
LOG_LEVEL=info
HEALTH_CHECK_ENABLED=true
PRISMA_ENGINES_CHECKSUM_IGNORE=true
```

### 4. Конфигурация сборки

Railway автоматически использует `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 5. Деплой

1. Railway автоматически начнет деплой после настройки
2. Процесс займет 3-5 минут
3. Статус можно отслеживать в разделе **"Deployments"**

## ✅ Проверка деплоя

После успешного деплоя:

1. **Откройте приложение**: Railway предоставит публичный URL
2. **Проверьте API**: `https://your-app.railway.app/api/health`
3. **Проверьте базу данных**: Должны быть созданы таблицы через Prisma

## 🔧 Структура проекта

```
telesklad/
├── backend/              # TypeScript API сервер
│   ├── src/             # Исходный код
│   ├── dist/            # Скомпилированный код
│   ├── prisma/          # База данных схема
│   └── package.json     # Backend зависимости
├── src/                 # Next.js фронтенд
├── railway.json         # Конфигурация Railway
└── package.json         # Главный package.json
```

## 🏗️ Архитектура системы

- **Backend**: TypeScript + Express + Prisma + PostgreSQL (порт 3011)
- **Database**: PostgreSQL с автомиграциями
- **External APIs**: Strattera API, ЦБ РФ курсы валют
- **Telegram**: Bot API для уведомлений о закупках

## 📊 Основные функции

✅ **Система закупок**: Создание, управление статусами, себестоимость
✅ **Telegram интеграция**: Уведомления, WebApp для смены статусов  
✅ **Аналитика товаров**: Остатки, продажи, рекомендации к закупке
✅ **Синхронизация данных**: Автоматическая синхронизация с Strattera API
✅ **Управление расходами**: Логистика, реклама, прочие расходы
✅ **Валютные курсы**: Автообновление от ЦБ РФ с буфером защиты

## 🚨 Важные моменты

1. **PostgreSQL**: Обязательно настройте переменную `DATABASE_URL`
2. **Migrations**: Prisma автоматически применит миграции при деплое
3. **CORS**: Настройте `CORS_ORIGIN` для фронтенда
4. **JWT_SECRET**: Используйте надежный секрет в production
5. **Telegram**: Настройте webhook URL в Telegram Bot API

## 🔗 Полезные ссылки

- [Railway Docs](https://docs.railway.app/)
- [Prisma Railway Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)
- [GitHub Repository](https://github.com/osama-agency/telesklad)

## 🆘 Troubleshooting

**Проблема**: Build fails
**Решение**: Проверьте что `railway.json` корректный и `buildCommand` указывает на правильную папку

**Проблема**: Database connection error  
**Решение**: Убедитесь что `DATABASE_URL` скопирован правильно из PostgreSQL сервиса

**Проблема**: TypeScript compilation errors
**Решение**: Проверьте что все зависимости установлены в `backend/package.json` 
