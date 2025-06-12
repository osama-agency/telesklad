# 🚀 Railway Deployment Guide - Telesklad

## Обзор проекта
**Telesklad** - это Next.js приложение с PostgreSQL базой данных и backend API для управления складом и заказами.

## 📋 Пререквизиты

1. ✅ Аккаунт на [Railway.app](https://railway.app)
2. ✅ GitHub репозиторий подключен к Railway
3. ✅ Локальная разработка работает (backend:3011, frontend:3001)

## 🏗️ Архитектура деплоя

```
Railway Project
├── 🗄️ PostgreSQL Database (Service)
├── 🚀 Main App (Next.js + Backend API)
└── 🌐 Domain/SSL (автоматически)
```

## 📊 Шаг 1: Создание проекта на Railway

### 1.1. Новый проект
1. Перейти на [Railway.app](https://railway.app)
2. Нажать **"New Project"**
3. Выбрать **"Deploy from GitHub repo"**
4. Выбрать репозиторий `osama-agency/telesklad`

### 1.2. Добавление PostgreSQL
1. В проекте нажать **"+ New"**
2. Выбрать **"Database" → "PostgreSQL"**
3. Railway автоматически создаст базу данных
4. Скопировать **DATABASE_URL** из Variables секции PostgreSQL сервиса

## 🔧 Шаг 2: Настройка переменных окружения

В главном сервисе приложения добавить следующие переменные в **Variables**:

### 2.1. Основные переменные
```env
NODE_ENV=production
```

### 2.2. База данных
```env
DATABASE_URL=postgresql://postgres:password@hostname:port/database
```
> ⚠️ **ВАЖНО**: Заменить на реальный DATABASE_URL из PostgreSQL сервиса

### 2.3. Prisma конфигурация (критично для Railway)
```env
PRISMA_QUERY_ENGINE_LIBRARY=/app/backend/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node
PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x
OPENSSL_CONF=/etc/ssl/
PRISMA_ENGINES_CHECKSUM_IGNORE=true
```

### 2.4. API конфигурация
```env
STRATTERA_API_URL=https://strattera.tgapp.online/api/v1/orders
STRATTERA_API_TOKEN=8cM9wVBrY3p56k4L1VBpIBwOsw
JWT_SECRET=telesklad_super_secure_jwt_production_key_2025
JWT_EXPIRE=24h
```

### 2.5. Telegram интеграция
```env
TELEGRAM_BOT_TOKEN=8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M
TELEGRAM_CHAT_ID=-4729817036
```

### 2.6. Безопасность
```env
CORS_ORIGIN=*
API_PREFIX=/api
LOG_LEVEL=info
HEALTH_CHECK_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2.7. NextAuth (если используется)
```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-railway-app.up.railway.app
```

## 🐳 Шаг 3: Проверка конфигурации

### 3.1. Dockerfile проверка
Убедиться что `Dockerfile` содержит:
```dockerfile
# Установка OpenSSL для Prisma
RUN apk add --no-cache openssl

# Генерация Prisma клиентов с правильными бинарными целями
RUN npx prisma generate
RUN cd backend && npx prisma generate
```

### 3.2. railway.toml проверка
```toml
[build]
builder = "dockerfile"
dockerfilePath = "./Dockerfile"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
```

### 3.3. start-production.js проверка
Файл должен содержать:
- Генерацию Prisma клиента
- Применение миграций
- Запуск на порту из `process.env.PORT`

## 🚀 Шаг 4: Деплой

### 4.1. Автоматический деплой
1. После коммита в `main` ветку, Railway автоматически начнет сборку
2. Следить за логами в Railway Dashboard
3. Сборка займет ~5-10 минут

### 4.2. Мониторинг сборки
В Railway Dashboard проверить:
- ✅ **Build Logs**: успешная сборка Docker образа
- ✅ **Deploy Logs**: успешный запуск приложения
- ✅ **Health Check**: `/api/health` возвращает 200

## 🔍 Шаг 5: Тестирование

### 5.1. Health Check
```bash
curl https://your-app.up.railway.app/api/health
# Ожидаемый ответ: {"status":"OK","timestamp":"..."}
```

### 5.2. API тестирование
```bash
# Проверка заказов
curl https://your-app.up.railway.app/api/orders

# Проверка продуктов  
curl https://your-app.up.railway.app/api/products
```

### 5.3. Фронтенд проверка
1. Открыть https://your-app.up.railway.app
2. Проверить что страницы загружаются
3. Проверить что данные отображаются корректно

## 🐛 Troubleshooting

### ❌ Prisma ошибки
```
Error: The package '@esbuild/linux-x64' could not be found
```
**Решение**: Проверить переменные окружения Prisma (шаг 2.3)

### ❌ Database connection
```
Error: Can't reach database server
```
**Решение**: 
1. Проверить DATABASE_URL
2. Убедиться что PostgreSQL сервис запущен
3. Проверить что миграции применились

### ❌ Port issues
```
Error: Port 3000 already in use
```
**Решение**: Railway автоматически присваивает порт через `process.env.PORT`

## 🔄 Шаг 6: Настройка домена (опционально)

1. В Railway Dashboard перейти в **Settings**
2. Добавить **Custom Domain**
3. Настроить DNS записи
4. SSL сертификат настроится автоматически

## 📊 Мониторинг и логи

### Просмотр логов
```bash
railway logs
# или в Railway Dashboard → Deployments → View Logs
```

### Метрики
Railway автоматически показывает:
- CPU/Memory usage
- Request latency
- Error rates
- Database connections

## ✅ Контрольный чек-лист

- [ ] PostgreSQL сервис создан и работает
- [ ] Все переменные окружения настроены
- [ ] DATABASE_URL указывает на Railway PostgreSQL
- [ ] Prisma переменные настроены правильно
- [ ] Health check проходит успешно
- [ ] API endpoints отвечают
- [ ] Фронтенд загружается
- [ ] Миграции применились
- [ ] Логи не показывают критичных ошибок

## 🚨 Важные заметки

1. **База данных**: Используется общая PostgreSQL для обеих частей приложения
2. **Миграции**: Применяются автоматически при старте через `start-production.js`
3. **Порт**: Railway автоматически назначает порт, не хардкодить 3000
4. **Prisma**: Критично настроить binary targets для Linux окружения
5. **Health Check**: Обязательно работающий `/api/health` endpoint

---

**Время деплоя**: ~10-15 минут  
**Автомасштабирование**: Включено по умолчанию  
**SSL**: Автоматически с railway.app доменом 
