# 🚀 Быстрый деплой на VPS

## ⚡ Краткие команды

### 1. Первоначальная настройка SSH

```bash
# 1. Подключаемся к серверу с паролем (первый раз)
ssh root@82.202.131.251
# Пароль: I%8HdBzGlGpx

# 2. Создаем пользователя deploy
adduser deploy
usermod -aG sudo deploy

# 3. Настраиваем SSH ключи (на ЛОКАЛЬНОЙ машине)
ssh-keygen -t ed25519 -C "your_email@example.com"
ssh-copy-id deploy@82.202.131.251

# 4. Тестируем подключение
ssh deploy@82.202.131.251
```

### 2. Быстрый деплой

```bash
# Полный деплой (из корня проекта)
npm run vps:deploy

# Или
./scripts/deploy-to-vps.sh
```

### 3. Управление

```bash
# Проверить статус
npm run vps:status

# Посмотреть логи
npm run vps:logs

# Подключиться к серверу
npm run vps:shell

# Настройка VPS (первый раз)
npm run vps:setup
```

## 🔧 На сервере

```bash
# Подключение
ssh deploy@82.202.131.251

# Переход в проект
cd /opt/telesite

# Основные команды
docker-compose ps        # Статус
docker-compose logs -f   # Логи
docker-compose restart app  # Перезапуск
docker-compose down && docker-compose up -d  # Полный перезапуск
```

## 📍 Доступ к приложению

- **HTTP**: http://82.202.131.251
- **HTTPS**: https://82.202.131.251 (самоподписанный сертификат)
- **API**: http://82.202.131.251/api/health

## 🔒 Важные файлы на сервере

```bash
/opt/telesite/.env           # Переменные окружения (ОБЯЗАТЕЛЬНО настроить!)
/opt/telesite/ssl/           # SSL сертификаты
/opt/telesite/docker-compose.yml  # Конфигурация Docker
```

## ⚠️ После первого деплоя

1. **Обязательно** отредактируйте `.env` файл на сервере:
```bash
ssh deploy@82.202.131.251
cd /opt/telesite
nano .env

# Смените пароли:
POSTGRES_PASSWORD=your_secure_password
NEXTAUTH_SECRET=your_secret_key
DATABASE_URL=postgresql://telesite_user:your_secure_password@postgres:5432/telesite?schema=public
```

2. Перезапустите приложение:
```bash
docker-compose down && docker-compose up -d
```

## 🆘 Troubleshooting

### Если приложение не запускается:
```bash
ssh deploy@82.202.131.251
cd /opt/telesite
docker-compose logs app     # Смотрим логи
docker-compose ps           # Проверяем статус
```

### Если база данных не работает:
```bash
docker-compose logs postgres
docker-compose exec postgres psql -U telesite_user -d telesite
```

### Если нужно пересобрать:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
``` 
