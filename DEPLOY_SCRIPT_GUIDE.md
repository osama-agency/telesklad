# 🚀 Профессиональный скрипт автодеплоя

## 📋 **Описание**

Скрипт `deploy.sh` — это профессиональное решение для автоматического деплоя приложения на production сервер. Создан по стандартам DevOps 2025 года с полной обработкой ошибок и уведомлениями.

## ✨ **Функционал**

### 🔧 **Основные возможности:**
- ✅ Полная очистка и обновление из Git репозитория
- ✅ Автоматическая установка production зависимостей
- ✅ Docker Compose деплой с приоритетом Let's Encrypt
- ✅ PM2 рестарт при наличии ecosystem.config.js
- ✅ Health check после деплоя
- ✅ Telegram уведомления о статусе деплоя
- ✅ Профессиональное логирование в `/var/log/deploy.log`
- ✅ Обработка ошибок с автоматическим rollback

### 🛡️ **Безопасность:**
- `set -euo pipefail` — остановка при любой ошибке
- Secure IFS для предотвращения injection
- Timeout для всех сетевых операций
- Graceful shutdown контейнеров

## 🚀 **Использование**

### **1. Автоматический деплой через GitHub Actions**
```bash
# Деплой запускается автоматически при push в main
git push origin main
```

### **2. Ручной деплой с локальной машины**
```bash
# Быстрый деплой (использует текущий код на сервере)
npm run deploy:manual

# Полный деплой (обновляет код с GitHub)
npm run deploy:pro
```

### **3. Прямой запуск на сервере**
```bash
# SSH на сервер
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251

# Запуск скрипта
cd /opt/telesite
./deploy.sh
```

## ⚙️ **Конфигурация**

### **Переменные окружения:**
```bash
# Обязательные для Telegram уведомлений
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Автоматически определяются скриптом
PROJECT_DIR="/opt/telesite"
BRANCH="main"
LOG_FILE="/var/log/deploy.log"
```

### **Поддерживаемые файлы:**
- `package.json` → `npm ci --omit=dev`
- `docker-compose.yml` → Docker Compose деплой
- `docker-compose.letsencrypt.yml` → Приоритетный SSL деплой
- `ecosystem.config.js` → PM2 рестарт

## 📊 **Логирование**

### **Файл логов:** `/var/log/deploy.log`
```bash
# Просмотр логов в реальном времени
tail -f /var/log/deploy.log

# Последние 50 строк
tail -50 /var/log/deploy.log

# Поиск ошибок
grep "ERROR" /var/log/deploy.log
```

### **Формат логов:**
```
[2025-06-13 03:45:12] 🚀 Starting deployment process...
[2025-06-13 03:45:13] 📁 Navigating to project directory: /opt/telesite
[2025-06-13 03:45:14] ✅ SUCCESS: Dependencies installed successfully
[2025-06-13 03:45:45] ✅ SUCCESS: Deployment completed successfully in 33s
```

## 🔄 **Процесс деплоя**

### **Этапы выполнения:**
1. **Проверка окружения** — валидация директории и Git репозитория
2. **Очистка** — `git stash`, `git clean -fd`, `git reset --hard`
3. **Обновление** — `git pull origin main --ff-only`
4. **Зависимости** — `npm ci --omit=dev` (если есть package.json)
5. **Docker** — остановка, сборка, запуск контейнеров
6. **PM2** — рестарт процессов (если есть ecosystem.config.js)
7. **Health Check** — проверка доступности сервисов
8. **Уведомления** — отправка статуса в Telegram

## 🚨 **Обработка ошибок**

### **Автоматические действия при ошибке:**
- Логирование точной строки с ошибкой
- Отправка уведомления в Telegram
- Остановка выполнения скрипта
- Сохранение состояния для анализа

### **Типичные ошибки и решения:**

#### **Git ошибки:**
```bash
# Проблема: merge conflicts
# Решение: скрипт делает git reset --hard

# Проблема: нет доступа к репозиторию
# Решение: проверить SSH ключи
```

#### **Docker ошибки:**
```bash
# Проблема: нехватка памяти
# Решение: скрипт делает docker system prune

# Проблема: порты заняты
# Решение: graceful shutdown с timeout
```

#### **NPM ошибки:**
```bash
# Проблема: package-lock.json conflicts
# Решение: npm ci пересоздает node_modules
```

## 📱 **Telegram уведомления**

### **Типы уведомлений:**
- 🚀 **Старт деплоя** — начало процесса
- ✅ **Успешный деплой** — завершение с временем выполнения
- ❌ **Ошибка деплоя** — номер строки с ошибкой

### **Формат сообщений:**
```
✅ Deploy dsgrating.ru: Deploy completed successfully in 45s
Commit: a1b2c3d - feat: добавлен новый функционал
```

## 🔧 **Кастомизация**

### **Изменение конфигурации:**
```bash
# Редактирование скрипта
nano /opt/telesite/deploy.sh

# Изменение директории проекта
PROJECT_DIR="/your/custom/path"

# Изменение ветки
BRANCH="production"

# Кастомный файл логов
LOG_FILE="/custom/path/deploy.log"
```

### **Добавление custom команд:**
```bash
# В функции main() добавить:
# Custom deployment steps
if [[ -f "custom-deploy.sh" ]]; then
    log "🔧 Running custom deployment steps..."
    bash custom-deploy.sh
fi
```

## 📈 **Мониторинг**

### **Проверка статуса деплоя:**
```bash
# Статус контейнеров
docker compose ps

# Логи приложения
docker compose logs -f app

# Системные ресурсы
htop
df -h
```

### **Health Check endpoints:**
- `http://localhost:3000` — Frontend
- `http://localhost:3011/health` — Backend API
- `https://dsgrating.ru` — Production URL

## 🎯 **Best Practices**

### **Рекомендации:**
1. **Тестируйте** изменения локально перед push
2. **Мониторьте** логи после каждого деплоя
3. **Проверяйте** health check endpoints
4. **Делайте backup** перед критическими изменениями
5. **Используйте** feature branches для больших изменений

### **Команды для мониторинга:**
```bash
# Проверка статуса после деплоя
npm run vps:status

# Просмотр логов
npm run vps:logs

# Очистка при проблемах
npm run vps:cleanup
```

## 🆘 **Troubleshooting**

### **Если деплой завис:**
```bash
# Подключение к серверу
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251

# Проверка процессов
ps aux | grep deploy

# Принудительная остановка
pkill -f deploy.sh

# Ручная очистка Docker
docker system prune -af --volumes
```

### **Если сайт не отвечает:**
```bash
# Проверка контейнеров
docker compose ps

# Перезапуск сервисов
docker compose restart

# Проверка логов
docker compose logs --tail=50
```

---

## 📞 **Поддержка**

При возникновении проблем:
1. Проверьте логи: `tail -f /var/log/deploy.log`
2. Проверьте статус контейнеров: `docker compose ps`
3. Проверьте Telegram уведомления
4. Обратитесь к документации по troubleshooting 
