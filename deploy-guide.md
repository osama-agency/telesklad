# Руководство по деплою NEXTADMIN

## 🚀 Варианты деплоя

### Вариант 1: Деплой на Beget (рекомендуется)
Поскольку база данных уже на Beget, это оптимальный вариант.

### Вариант 2: Деплой на VPS с SSH туннелем к Beget
Если хотите использовать другой сервер.

### Вариант 3: Деплой на Vercel/Netlify
Для этого нужна внешне доступная база данных.

## 📋 Подготовка к деплою

### 1. Создание production .env файла

```bash
# .env.production
DATABASE_URL="postgresql://eldarweb:fFBFZ9rVxE%26J@localhost:5432/eldarweb"
NEXTAUTH_SECRET="сгенерируйте-секретный-ключ-здесь"
NEXTAUTH_URL="https://ваш-домен.com"
WEBAPP_URL="https://ваш-домен.com/webapp"
NODE_ENV="production"
PORT=3000

# Telegram Bot
TELEGRAM_BOT_TOKEN="ваш-токен-бота"
WEBAPP_TELEGRAM_BOT_TOKEN="ваш-токен-webapp-бота"

# Публичные переменные
NEXT_PUBLIC_WEBAPP_URL="https://ваш-домен.com/webapp"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="ваш_бот"
```

### 2. Оптимизация для production

```bash
# Установка зависимостей production
npm ci --production

# Сборка проекта
npm run build

# Проверка сборки
npm run start
```

## 🖥️ Деплой на Beget

### 1. Подготовка на Beget

```bash
# Подключитесь по SSH к Beget
ssh ваш_логин@suhemaprole.beget.app

# Установите Node.js если не установлен
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установите PM2 для управления процессами
npm install -g pm2
```

### 2. Загрузка проекта

```bash
# Создайте директорию для проекта
mkdir -p ~/nextadmin
cd ~/nextadmin

# Клонируйте репозиторий или загрузите файлы
git clone ваш-репозиторий .
# или используйте rsync/scp для загрузки файлов
```

### 3. Настройка проекта

```bash
# Установите зависимости
npm ci

# Создайте .env файл
nano .env
# Вставьте production настройки

# Примените миграции к базе данных
npx prisma migrate deploy

# Сгенерируйте Prisma Client
npx prisma generate

# Соберите проект
npm run build
```

### 4. Настройка PM2

Создайте файл `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'nextadmin',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

### 5. Запуск приложения

```bash
# Запустите через PM2
pm2 start ecosystem.config.js

# Сохраните конфигурацию PM2
pm2 save
pm2 startup
```

### 6. Настройка Nginx

```nginx
server {
    listen 80;
    server_name ваш-домен.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 7. SSL сертификат

```bash
# Установите Certbot
sudo apt-get install certbot python3-certbot-nginx

# Получите SSL сертификат
sudo certbot --nginx -d ваш-домен.com
```

## 📦 Импорт данных

### 1. Загрузите дамп на сервер

```bash
# С локальной машины
scp database_backup.sql ваш_логин@suhemaprole.beget.app:~/
```

### 2. Импортируйте в базу данных

```bash
# На сервере Beget
psql -U eldarweb -d eldarweb < ~/database_backup.sql
```

## 🔧 Настройка Telegram Webhook

```bash
# После деплоя настройте webhook
npm run telegram:webhook:setup
```

## 📊 Мониторинг

```bash
# Просмотр логов
pm2 logs nextadmin

# Мониторинг процесса
pm2 monit

# Статус приложения
pm2 status
```

## 🐛 Устранение проблем

### Проверка подключения к БД
```bash
npx prisma db pull
```

### Проверка портов
```bash
sudo netstat -tlnp | grep 3000
```

### Перезапуск приложения
```bash
pm2 restart nextadmin
```

## 🔄 Обновление приложения

```bash
# Получите обновления
git pull

# Установите новые зависимости
npm ci

# Пересоберите проект
npm run build

# Примените миграции
npx prisma migrate deploy

# Перезапустите
pm2 restart nextadmin
```

## 🎯 Чеклист перед деплоем

- [ ] Обновлен .env.production
- [ ] Сгенерирован NEXTAUTH_SECRET
- [ ] Настроен домен
- [ ] База данных доступна
- [ ] Удалены console.log из production
- [ ] Оптимизированы изображения
- [ ] Настроен SSL
- [ ] Настроен Telegram webhook
- [ ] Настроен мониторинг
- [ ] Создан backup базы данных 