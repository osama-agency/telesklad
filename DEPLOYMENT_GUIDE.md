# 🚀 Руководство по деплою Telesklad

## 📋 Обзор

Проект Telesklad поддерживает несколько способов деплоя на production сервер (dsgrating.ru), оптимизированных для разных сценариев.

## 🎯 Типы деплоя

### 1. ⚡ HOT DEPLOY (30 секунд)
**Команда:** `npm run vps:deploy:build`
- Только синхронизация кода без Docker rebuild
- Идеально для мелких изменений в коде
- Самый быстрый способ

### 2. 🚀 FAST DEPLOY (1-2 минуты)
**GitHub Actions:** Simple Deploy с `skip_build: true`
**Команда:** `npm run deploy:manual`
- Обновление кода + перезапуск контейнеров
- Без пересборки Docker образов

### 3. ⚡ QUICK DEPLOY (2-3 минуты)
**Команда:** `npm run deploy:pro`
- Git pull + restart контейнеров
- Подходит для изменений без новых зависимостей

### 4. 📦 STANDARD DEPLOY (3-5 минут)
**Команда:** `npm run vps:deploy:production`
- Полная production сборка
- Обновление зависимостей
- Рекомендуется для большинства случаев

### 5. 🔧 FULL DEPLOY (5+ минут)
**Команда:** `npm run vps:deploy`
- Полная пересборка всех Docker образов
- Используется при изменении конфигурации Docker

## 🤖 Автоматический деплой

### GitHub Actions Workflows

1. **🚀 Simple Auto Deploy** (`simple-deploy.yml`)
   - Запускается автоматически при push в main
   - Быстрый и надежный
   - Поддерживает skip_build опцию

2. **⚡ Fast Deploy** (`fast-deploy.yml`)
   - Ручной запуск через GitHub Actions
   - Опция пропуска сборки Next.js
   - Использует rsync для быстрой синхронизации

3. **📦 Deploy to Production** (`deploy.yml`)
   - Полный production деплой
   - Включает проверку качества кода
   - Резервное копирование и очистка

## 🛠️ Настройка

### Необходимые GitHub Secrets:
- `VPS_SSH_PRIVATE_KEY` - SSH ключ для доступа к VPS
- `VPS_HOST` - IP адрес VPS (82.202.131.251)
- `VPS_USER` - Пользователь VPS (deploy)
- `PROJECT_DIR` - Директория проекта (/opt/telesite)
- `TELEGRAM_BOT_TOKEN` - Токен бота для уведомлений
- `TELEGRAM_CHAT_ID` - ID чата для уведомлений (125861752)

### Первоначальная настройка:
```bash
# Настройка GitHub Actions
npm run github:setup

# Настройка VPS
npm run vps:setup
```

## 📱 Telegram уведомления

Все деплои отправляют уведомления в Telegram:
- 🚀 Начало деплоя
- 📊 Прогресс выполнения
- ✅ Успешное завершение
- ❌ Ошибки и проблемы

## 🔍 Мониторинг

- **Здоровье сайта:** https://dsgrating.ru/api/health
- **Логи деплоя:** GitHub Actions или `npm run vps:logs`
- **Статус сервисов:** `npm run vps:status`

## ⚠️ Решение проблем

### Ошибка "prisma: not found"
- Убедитесь, что prisma в dependencies (не devDependencies)
- Проверьте postinstall скрипт: `npx prisma generate`

### Медленный деплой
- Используйте HOT DEPLOY для мелких изменений
- Включите skip_build опцию если не меняли frontend

### Docker out of memory
- Запустите очистку: `npm run vps:cleanup:deep`
- Проверьте swap память на VPS

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `npm run vps:logs`
2. Проверьте статус: `npm run vps:status`
3. Обратитесь в Telegram чат с ID ошибки из уведомления 
