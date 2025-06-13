# GitHub Secrets для автоматического деплоя

## 🔐 Полный список секретов для настройки в GitHub

### 1. VPS подключение:
- **Name**: `VPS_HOST`  
  **Secret**: `82.202.131.251`

- **Name**: `VPS_USERNAME`  
  **Secret**: `deploy`

- **Name**: `VPS_PORT`  
  **Secret**: `22`

- **Name**: `VPS_SSH_KEY`  
  **Secret**: (содержимое приватного SSH ключа из `~/.ssh/telesite_deploy`)

### 2. База данных (ВАЖНО: пароли должны совпадать!):
- **Name**: `POSTGRES_PASSWORD`  
  **Secret**: `TeleS1te_2025_SecurePass!`

- **Name**: `DATABASE_URL`  
  **Secret**: `postgresql://telesite_user:TeleS1te_2025_SecurePass!@postgres:5432/telesite?schema=public`

### 3. Telegram (множественные получатели):
- **Name**: `TELEGRAM_BOT_TOKEN`  
  **Secret**: `8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M`

- **Name**: `TELEGRAM_RECIPIENTS`  
  **Secret**: `125861752,795960178`

### 4. Приложение:
- **Name**: `NEXTAUTH_SECRET`  
  **Secret**: `9u7lZjpjZUmX4CZARxgEgns04CYpdq7NEA8UZDQUGHg=`

- **Name**: `NEXTAUTH_URL`  
  **Secret**: `https://dsgrating.ru`

- **Name**: `BACKEND_URL`  
  **Secret**: `http://localhost:3011`

### 5. Опционально (для уведомлений о деплое):
- **Name**: `TELEGRAM_DEPLOY_CHAT_ID`  
  **Secret**: `125861752`

## 📍 Где найти пароли в проекте:

### Локальная разработка:
- **Файл**: `backend/.env`
- **DATABASE_URL**: `postgresql://myshopuser:MyStrongPass123@localhost:5432/myshop?schema=public`

### VPS Production:
- **Файлы**: `docker-compose.ssl.yml`, `docker.env`
- **POSTGRES_PASSWORD**: `TeleS1te_2025_SecurePass!`
- **DATABASE_URL**: `postgresql://telesite_user:TeleS1te_2025_SecurePass!@postgres:5432/telesite?schema=public`

## ⚠️ Важные моменты:

1. **Пароли должны совпадать** в `POSTGRES_PASSWORD` и `DATABASE_URL`
2. **Локальная база** использует другие учетные данные (`myshop` база)
3. **VPS база** использует `telesite` базу с пользователем `telesite_user`
4. **TELEGRAM_RECIPIENTS** содержит оба ID через запятую: `125861752,795960178`

## 🚀 Как добавить секреты в GitHub:

1. Перейдите в репозиторий на GitHub
2. Settings → Secrets and variables → Actions
3. Нажмите "New repository secret"
4. Добавьте каждый секрет из списка выше

После добавления всех секретов автоматический деплой будет работать при push в main ветку. 
