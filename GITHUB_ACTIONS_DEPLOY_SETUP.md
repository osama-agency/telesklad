# 🚀 Настройка автодеплоя через GitHub Actions

## 📋 Что нужно сделать

### 1. Добавьте секреты в GitHub

Перейдите в настройки репозитория:
`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Добавьте следующие секреты:

#### Обязательные секреты:
- **VPS_HOST**: `82.202.131.251`
- **VPS_USERNAME**: `deploy`
- **VPS_PORT**: `22`
- **VPS_SSH_KEY**: Ваш приватный SSH ключ (содержимое файла `~/.ssh/telesite_deploy`)

#### Опциональные (для уведомлений в Telegram):
- **TELEGRAM_BOT_TOKEN**: Токен вашего бота
- **TELEGRAM_CHAT_ID**: ID чата для уведомлений (например: `-4729817036`)

### 2. Получите SSH ключ

```bash
# Если у вас уже есть ключ
cat ~/.ssh/telesite_deploy

# Если нужно создать новый
ssh-keygen -t rsa -b 4096 -f ~/.ssh/telesite_deploy -C "github-actions"
```

### 3. Добавьте публичный ключ на VPS

```bash
# Скопируйте публичный ключ
cat ~/.ssh/telesite_deploy.pub

# Подключитесь к VPS и добавьте ключ
ssh deploy@82.202.131.251
echo "ВАШ_ПУБЛИЧНЫЙ_КЛЮЧ" >> ~/.ssh/authorized_keys
```

## 🔧 Как работает автодеплой

### Основной workflow (`deploy.yml`):
- Запускается автоматически при `push` в ветку `main`
- Подключается к VPS по SSH
- Выполняет `git pull`
- Пересобирает Docker контейнеры
- Запускает приложение
- Отправляет уведомление в Telegram

### Упрощенный workflow (`deploy-simple.yml`):
- Запускается только вручную
- Оптимизирован для VPS с малой памятью
- Использует `Dockerfile.simple`
- Можно пропустить сборку образов

## 📱 Использование

### Автоматический деплой:
```bash
git add .
git commit -m "feat: новая функция"
git push origin main
# Деплой запустится автоматически!
```

### Ручной деплой:
1. Перейдите в `Actions` → `Simple Deploy (Low Memory VPS)`
2. Нажмите `Run workflow`
3. Выберите опции и запустите

## 🛠 Требования на VPS

Убедитесь, что на VPS установлено:
```bash
# Проверка
docker --version          # Docker version 28.2.2
docker-compose --version  # Docker Compose version v2.37.1
git --version            # git version 2.34.1
node --version           # v18.x или выше
npm --version            # 10.x или выше

# Проверка прав пользователя deploy
groups deploy  # Должен быть в группах: docker, sudo
```

## 🔍 Отладка

### Проверка логов GitHub Actions:
1. Перейдите в `Actions`
2. Выберите workflow run
3. Кликните на job для просмотра логов

### Проверка на VPS:
```bash
# Статус контейнеров
docker-compose -f docker-compose.ssl.yml ps

# Логи приложения
docker-compose -f docker-compose.ssl.yml logs -f app

# Логи backend
docker-compose -f docker-compose.ssl.yml logs -f app | grep backend
```

## ⚠️ Важные моменты

1. **Память VPS**: Если меньше 2GB RAM, используйте `deploy-simple.yml`
2. **Первый деплой**: Убедитесь, что репозиторий уже клонирован в `/opt/telesite`
3. **SSL сертификаты**: Должны быть настроены в `/etc/letsencrypt`
4. **Права доступа**: Пользователь `deploy` должен иметь sudo права без пароля

## 🚨 Решение проблем

### "Permission denied" при SSH:
```bash
# На VPS
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### "Out of memory" при сборке:
```bash
# Используйте deploy-simple.yml или увеличьте swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Docker build зависает:
```bash
# Очистите кеш Docker
docker system prune -a
docker builder prune
```

## 📞 Поддержка

При проблемах проверьте:
1. Логи GitHub Actions
2. Логи на VPS: `journalctl -u docker -f`
3. Статус приложения: `curl https://dsgrating.ru` 
