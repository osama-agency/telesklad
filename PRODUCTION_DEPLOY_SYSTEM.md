# 🚀 Production Deploy System 2025

## 📋 Обзор новой архитектуры

Система деплоя обновлена согласно **лучшим практикам 2025 года**:

- **✅ Nginx на хосте** - стабильная работа, автоматические SSL сертификаты от Let's Encrypt
- **✅ Docker для приложения** - только app + postgres в контейнерах
- **✅ Упрощенный деплой** - без проблем с SSL в Docker
- **✅ Автоматические backup'ы** - восстановление при ошибках

---

## 🏗️ Архитектура

```
Internet → Nginx (Host) → Docker App → PostgreSQL (Container)
                ↓
            SSL Termination
            Static Files
            Load Balancing
```

### Компоненты:

1. **Host Nginx** (`/etc/nginx/sites-available/dsgrating.ru`)
   - SSL сертификаты от Let's Encrypt
   - Проксирование запросов к Docker приложению
   - Обслуживание статических файлов
   - Gzip сжатие, безопасность заголовки

2. **Docker Services** (`docker-compose.production.yml`)
   - **app**: Next.js приложение (порт 3000)
   - **postgres**: База данных PostgreSQL

---

## 🛠️ Команды деплоя

### Основные команды:

```bash
# Деплой в продакшен
npm run vps:deploy:production

# Проверка статуса
npm run vps:deploy:production status

# Просмотр логов
npm run vps:deploy:production logs

# Перезапуск сервисов
npm run vps:deploy:production restart
```

### Старые команды (legacy):

```bash
# Старый деплой с nginx в Docker (не рекомендуется)
npm run vps:deploy

# Статус старой системы
npm run vps:status
```

---

## 📦 Процесс деплоя

1. **Локальная сборка** - `npm run build:next`
2. **Загрузка файлов** - rsync на VPS
3. **Создание backup'а** - автоматическое сохранение
4. **Остановка сервисов** - graceful shutdown
5. **Обновление контейнеров** - новая версия
6. **Health check** - проверка работоспособности
7. **Cleanup** - удаление старых backup'ов

---

## 🔧 Настройка VPS

### Требования:
- Ubuntu 20.04+
- Docker & Docker Compose
- Nginx
- Certbot для SSL
- SSH доступ

### Настройка nginx:
```bash
# Конфигурация в /etc/nginx/sites-available/dsgrating.ru
# Автоматические SSL сертификаты
sudo certbot --nginx -d dsgrating.ru
```

---

## 📊 Мониторинг

### Health checks:
- **Internal**: `http://localhost:3000/api/health`
- **External**: `https://dsgrating.ru/api/health`

### Логи:
```bash
# Docker логи
npm run vps:deploy:production logs

# Nginx логи
ssh deploy@82.202.131.251 "sudo tail -f /var/log/nginx/access.log"
```

---

## 🔄 Rollback

В случае проблем:

```bash
# Просмотр backup'ов
ssh deploy@82.202.131.251 "ls -la /opt/telesite/backups/"

# Ручной rollback
ssh deploy@82.202.131.251 "cd /opt/telesite && tar -xzf backups/backup-YYYYMMDD-HHMMSS.tar.gz"
```

---

## 🎯 Преимущества новой системы

### ✅ Стабильность:
- Nginx не падает при обновлениях приложения
- Автоматическое обновление SSL сертификатов
- Graceful restart без downtime

### ✅ Производительность:
- Nginx кеширует статические файлы
- Gzip сжатие на уровне веб-сервера
- Оптимизированная проксификация

### ✅ Безопасность:
- SSL терминация на уровне nginx
- Безопасные заголовки (HSTS, CSP)
- Скрытие внутренних портов

### ✅ Удобство:
- Простые команды деплоя
- Автоматические backup'ы
- Подробные логи и мониторинг

---

## 📚 Файлы системы

- `docker-compose.production.yml` - Docker конфигурация
- `scripts/deploy-production.sh` - Локальный скрипт деплоя
- `scripts/vps-production-deploy.sh` - VPS скрипт деплоя
- `/etc/nginx/sites-available/dsgrating.ru` - Nginx конфигурация
- `/opt/telesite/backups/` - Директория backup'ов

---

## 🚨 Troubleshooting

### Проблема: Nginx не стартует
```bash
sudo nginx -t  # Проверка конфигурации
sudo systemctl status nginx  # Статус сервиса
```

### Проблема: Docker контейнеры не запускаются
```bash
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs
```

### Проблема: SSL сертификат истек
```bash
sudo certbot renew --dry-run  # Тест обновления
sudo certbot renew  # Обновление
```

---

*Система обновлена: Декабрь 2025* 
