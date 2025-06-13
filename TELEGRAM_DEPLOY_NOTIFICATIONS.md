# 🚀 Telegram Deploy Notifications 2025

Современная система уведомлений деплоя в Telegram по лучшим практикам 2025 года.

## 📱 Обзор системы

Автоматические уведомления отправляются в Telegram при каждом этапе деплоя:
- **Начало деплоя** - с информацией о коммите и авторе
- **Прогресс деплоя** - по каждому этапу (backup, build, deploy, etc.)
- **Завершение деплоя** - с результатом и системной информацией
- **Health checks** - состояние сервисов после деплоя

## ⚙️ Конфигурация

### Telegram Bot
```bash
TELEGRAM_BOT_TOKEN=8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M
TELEGRAM_CHAT_ID=-4729817036
```

### GitHub Secrets
Добавьте секреты в GitHub Actions:
```
TELEGRAM_BOT_TOKEN - токен Telegram бота
TELEGRAM_CHAT_ID - ID чата для уведомлений
```

## 🔧 Компоненты системы

### 1. Скрипт уведомлений (`scripts/deploy-notifications.sh`)
- ✅ Retry логика с таймаутами
- ✅ Структурированные сообщения в Markdown
- ✅ Автоматическое получение Git информации
- ✅ Мониторинг системных ресурсов
- ✅ Эмодзи статусы для быстрого понимания

### 2. Интеграция с VPS деплоем (`scripts/vps-production-deploy.sh`)
- ✅ Уведомления о начале/завершении
- ✅ Прогресс по каждому этапу
- ✅ Обработка ошибок с детальной информацией
- ✅ Расчет времени выполнения

### 3. GitHub Actions интеграция (`.github/workflows/deploy.yml`)
- ✅ Уведомления о старте деплоя
- ✅ Передача Git метаданных на VPS
- ✅ Финальные уведомления с результатами
- ✅ Разные типы уведомлений (success/warning/error)

## 📊 Типы уведомлений

### 🚀 Старт деплоя
```
🚀 DEPLOYMENT STARTED

🏷️ Project: Telesklad
🌍 Environment: production
🖥️ Server: dsgrating.ru
🔄 Trigger: GitHub Actions

🌿 Branch: main
🔗 Commit: abc123
👤 Author: username

⏰ Started: 2025-01-13 15:30:00 UTC
```

### ⚡ Прогресс деплоя
```
⚡ DEPLOYMENT PROGRESS

🏷️ Project: Telesklad
📋 Stage: Building
📊 Status: progress

⏰ Time: 2025-01-13 15:31:15 UTC
```

### 🎉 Успешное завершение
```
🎉 DEPLOYMENT COMPLETED SUCCESSFULLY

🏷️ Project: Telesklad
🌍 Environment: production
🖥️ Server: dsgrating.ru

🌿 Branch: main
🔗 Commit: abc123
👤 Author: username

⏱️ Duration: 2m 30s
⏰ Completed: 2025-01-13 15:32:30 UTC

💻 CPU: 15.2%
🧠 Memory: 45.8%
💽 Disk: 67%

🔗 URL: https://dsgrating.ru
📊 Health: https://dsgrating.ru/api/health
```

### ❌ Ошибка деплоя
```
❌ DEPLOYMENT FAILED

🏷️ Project: Telesklad
🖥️ Server: dsgrating.ru

⏰ Failed at: 2025-01-13 15:31:45 UTC

📝 Details:
```
Failed to start services
```

🔧 Action required: Check logs and fix issues
```

## 🏥 Health Check уведомления

```
🟢 HEALTH CHECK: HEALTHY

🏷️ Project: Telesklad
🖥️ Server: dsgrating.ru
⏰ Time: 2025-01-13 15:35:00 UTC

📊 Checks:
```
✅ Website: OK (200ms)
✅ Database: OK (50ms)  
✅ API: OK (150ms)
✅ Docker: 2/2 containers running
```

🔗 URL: https://dsgrating.ru
```

## 🚀 Использование

### Автоматические уведомления

#### GitHub Actions деплой
Уведомления отправляются автоматически при:
```bash
git push origin main  # Автоматический деплой
```

#### Ручной VPS деплой
```bash
npm run vps:deploy:production  # С уведомлениями
```

### Ручные уведомления

#### Тестовое уведомление
```bash
npm run notify:test
# Или
./scripts/deploy-notifications.sh test
```

#### Уведомление о старте
```bash
npm run notify:start
# Или
./scripts/deploy-notifications.sh start manual
```

#### Уведомление о завершении
```bash
npm run notify:complete
# Или
./scripts/deploy-notifications.sh complete success "2m 30s"
```

#### Health check
```bash
npm run notify:health
# Или
./scripts/deploy-notifications.sh health healthy "All services operational"
```

## 📋 Доступные команды

### Основные функции
```bash
# Уведомления деплоя
./scripts/deploy-notifications.sh start [trigger]
./scripts/deploy-notifications.sh progress <stage> [status] [details]
./scripts/deploy-notifications.sh complete <status> <duration> [details]

# Health check
./scripts/deploy-notifications.sh health <status> <checks>

# Тестирование
./scripts/deploy-notifications.sh test
```

### Статусы
- **start**: 🚀 Начало деплоя
- **progress**: ⚡ Прогресс выполнения  
- **success**: ✅ Успешное завершение
- **warning**: ⚠️ Завершение с предупреждениями
- **error**: ❌ Ошибка
- **info**: ℹ️ Информационное сообщение

### Триггеры
- **github_actions**: Автоматический через GitHub
- **manual**: Ручной запуск
- **vps_manual**: Ручной запуск на VPS
- **scheduled**: По расписанию

## 🔧 Примеры использования

### В скриптах деплоя
```bash
#!/bin/bash
source "./scripts/deploy-notifications.sh"

# Старт
notify_deployment_start "manual"

# Прогресс
notify_deployment_progress "Building" "progress"
notify_deployment_progress "Testing" "success" "All tests passed"

# Завершение
notify_deployment_complete "success" "3m 45s" "All services running"
```

### В GitHub Actions
```yaml
- name: Send notification
  run: |
    curl -s -X POST "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage" \
      -d "chat_id=${{ secrets.TELEGRAM_CHAT_ID }}" \
      -d "parse_mode=Markdown" \
      -d "text=🚀 **DEPLOYMENT STARTED**..."
```

## 🎯 Лучшие практики 2025

### ✅ Что реализовано
- **Retry логика** - 3 попытки с таймаутом
- **Структурированные сообщения** - Markdown форматирование
- **Эмодзи статусы** - быстрое визуальное понимание
- **Git интеграция** - автоматическая информация о коммитах
- **Системный мониторинг** - CPU, Memory, Disk usage
- **Error handling** - graceful fallback при недоступности Telegram
- **Duration tracking** - точное время выполнения
- **Health checks** - статус сервисов после деплоя

### 🔐 Безопасность
- Токены в переменных окружения
- Таймауты для предотвращения зависания
- Graceful fallback при ошибках
- Валидация входных данных

### 📊 Мониторинг
- Системные метрики в уведомлениях
- Ссылки на логи и health checks
- Информация о времени выполнения
- Статус всех компонентов

## 🚨 Troubleshooting

### Уведомления не приходят
```bash
# Проверить токен и chat_id
./scripts/deploy-notifications.sh test

# Проверить переменные окружения
echo $TELEGRAM_BOT_TOKEN
echo $TELEGRAM_CHAT_ID

# Проверить права бота в чате
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getChat?chat_id=$TELEGRAM_CHAT_ID"
```

### Ошибки в сообщениях
```bash
# Проверить API Telegram
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"

# Проверить статус бота
./scripts/deploy-notifications.sh test
```

### Проблемы с форматированием
- Экранируйте специальные символы в Markdown
- Используйте backticks для кода: \`code\`
- Проверяйте длину сообщений (лимит 4096 символов)

## 📈 Аналитика

Система автоматически отслеживает:
- ⏱️ Время деплоя
- 🎯 Успешность деплоев  
- 📊 Системные метрики
- 🔄 Частота деплоев
- ❌ Типы ошибок

Данные включаются в уведомления для анализа производительности и оптимизации процесса деплоя.

## 🔗 Связанные файлы

- `scripts/deploy-notifications.sh` - основной скрипт уведомлений
- `scripts/vps-production-deploy.sh` - VPS деплой с интеграцией
- `.github/workflows/deploy.yml` - GitHub Actions с уведомлениями
- `package.json` - npm команды для ручных уведомлений

---

**Система готова к использованию!** 🎉

Тестируйте с помощью: `npm run notify:test` 
