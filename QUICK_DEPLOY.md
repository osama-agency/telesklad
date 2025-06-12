# ⚡ Quick Deploy to Railway

## 🚀 3-минутный деплой

### 1. Создать проект
1. [Railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Выбрать `osama-agency/telesklad`

### 2. Добавить PostgreSQL
1. **+ New** → **Database** → **PostgreSQL** 
2. Скопировать `DATABASE_URL` из Variables

### 3. Настроить переменные в главном сервисе
**Обязательные:**
```env
NODE_ENV=production
DATABASE_URL=<скопированный_из_PostgreSQL_сервиса>
PRISMA_QUERY_ENGINE_LIBRARY=/app/backend/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node
PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x
OPENSSL_CONF=/etc/ssl/
```

**API токены:**
```env
STRATTERA_API_URL=https://strattera.tgapp.online/api/v1/orders
STRATTERA_API_TOKEN=8cM9wVBrY3p56k4L1VBpIBwOsw
JWT_SECRET=telesklad_super_secure_jwt_production_key_2025
TELEGRAM_BOT_TOKEN=8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M
TELEGRAM_CHAT_ID=-4729817036
```

### 4. Деплой
1. Код уже в `main` ветке → автоматический деплой
2. Ждать ~5-10 минут
3. Проверить Health Check: `https://your-app.up.railway.app/api/health`

## ✅ Готово!
- **Фронтенд**: https://your-app.up.railway.app
- **API**: https://your-app.up.railway.app/api
- **Health**: https://your-app.up.railway.app/api/health

---
📖 **Подробная инструкция**: [RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md) 
