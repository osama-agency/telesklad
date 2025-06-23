# Анализ переменных окружения (.env)

## ✅ НЕОБХОДИМЫЕ переменные

### База данных
- `DATABASE_URL` - **ОБЯЗАТЕЛЬНО** - строка подключения к PostgreSQL

### NextAuth (аутентификация)
- `NEXTAUTH_URL` - **ОБЯЗАТЕЛЬНО** - URL приложения (http://localhost:3000 для dev)
- `NEXTAUTH_SECRET` или `SECRET` - **ОБЯЗАТЕЛЬНО** - секретный ключ для JWT

### Telegram боты (берутся из БД, но можно задать как fallback)
- `TELEGRAM_BOT_TOKEN` - токен основного бота (fallback если нет в БД)
- `TELEGRAM_WEBAPP_BOT_TOKEN` - токен webapp бота (fallback если нет в БД)
- `TELEGRAM_WEBHOOK_SECRET` - секрет для проверки webhook (опционально)

### Администраторы
- `ADMIN_EMAILS` - email администраторов через запятую (по умолчанию: go@osama.agency)

## ⚠️ ОПЦИОНАЛЬНЫЕ переменные

### S3 хранилище (для аватаров)
- `S3_ENDPOINT` - endpoint S3 (по умолчанию: https://s3.ru1.storage.beget.cloud)
- `S3_BUCKET` - имя бакета (по умолчанию: 2c11548b454d-eldar-agency)
- `S3_REGION` - регион (по умолчанию: ru-1)
- `S3_ACCESS_KEY` - ключ доступа
- `S3_SECRET_KEY` - секретный ключ

### OAuth провайдеры (если нужна авторизация через соцсети)
- `GITHUB_CLIENT_ID` и `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`

### Email (если нужна отправка писем)
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`

### AI сервисы
- `OPENAI_API_KEY` - для AI функций

### DaData (для автозаполнения адресов)
- `DADATA_TOKEN` или `DADATA_API_KEY`

### Algolia (поиск)
- `NEXT_PUBLIC_ALGOLIA_PROJECT_ID`
- `NEXT_PUBLIC_ALGOLIA_API_KEY`
- `NEXT_PUBLIC_ALGOLIA_INDEX`

## ❌ НЕ НУЖНЫЕ переменные (берутся из БД)

Эти переменные хранятся в таблице `settings` и НЕ должны быть в .env:

- `TELEGRAM_ADMIN_CHAT_ID` - берется из БД (admin_chat_id)
- `TELEGRAM_COURIER_CHAT_ID` - берется из БД (courier_tg_id)
- `TELEGRAM_GROUP_CHAT_ID` - берется из БД или захардкожено (-4729817036)
- `TELEGRAM_BOT_USERNAME` - берется из БД (tg_main_bot)
- `TELEGRAM_GROUP_URL` - берется из БД (tg_group)
- `TELEGRAM_SUPPORT_URL` - берется из БД (tg_support)
- `TELEGRAM_ADMIN_ID` - не используется
- `TELEGRAM_COURIER_ID` - берется из БД (courier_tg_id)
- `WEBAPP_URL` - захардкожено как https://telesklad.ru
- `WEBAPP_BOT_USERNAME` - берется из БД
- `WEBAPP_ADMIN_CHAT_ID` - берется из БД
- `WEBAPP_COURIER_CHAT_ID` - берется из БД
- `WEBAPP_GROUP_CHAT_ID` - берется из БД
- `BANK_CARD_DETAILS` - берется из БД

## 🔧 УСТАРЕВШИЕ переменные (от Cloudflare R2)

Эти переменные были для старого хранилища и больше не используются:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

## 📝 Минимальный .env для разработки

```env
# База данных
DATABASE_URL=postgresql://admin:admin@89.169.38.127:5433/webapp_production

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Администраторы
ADMIN_EMAILS=go@osama.agency

# Опционально: S3 для аватаров
S3_ACCESS_KEY=your-s3-key
S3_SECRET_KEY=your-s3-secret
```

## 📝 Рекомендуемый .env для продакшена

```env
# База данных
DATABASE_URL=postgresql://user:password@host:port/database

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=strong-random-secret-key

# Администраторы
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Telegram (опционально, как fallback)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBAPP_BOT_TOKEN=your-webapp-bot-token
TELEGRAM_WEBHOOK_SECRET=webhook-secret

# S3 хранилище
S3_ENDPOINT=https://s3.endpoint.com
S3_BUCKET=your-bucket
S3_REGION=your-region
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret

# AI (если используется)
OPENAI_API_KEY=your-openai-key

# DaData (если используется)
DADATA_TOKEN=your-dadata-token
```

## 💡 Важные замечания

1. **Telegram токены** - предпочтительно хранить в БД (таблица settings), .env используется только как fallback
2. **NODE_ENV** - автоматически устанавливается Next.js (development/production)
3. **Все ID чатов и настройки бота** - должны быть в БД, не в .env
4. **Секреты и пароли** - никогда не коммитьте в git

## 🗑️ Что можно удалить из вашего .env

Если у вас есть эти переменные в .env, их можно безопасно удалить:

- Все `TELEGRAM_*_CHAT_ID` переменные
- Все `WEBAPP_*` переменные (кроме токенов)
- `BANK_CARD_DETAILS`
- Все `R2_*` переменные
- Любые ID чатов и username ботов 