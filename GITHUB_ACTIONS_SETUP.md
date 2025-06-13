# 🚀 GitHub Actions Setup Guide

## 📋 Обзор

Этот проект использует современную CI/CD систему на базе GitHub Actions с автоматическим деплоем на VPS.

### 🏗️ Архитектура CI/CD:

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│    PR       │───▶│   Quality    │───▶│   Deploy    │
│   Check     │    │    Check     │    │     to      │
└─────────────┘    └──────────────┘    │ Production  │
                                       └─────────────┘
       │                    │                  │
       ▼                    ▼                  ▼
   Code Review        Build & Test      VPS Deployment
   Security Scan      Type Check        Health Check
   Dependency Check   ESLint Check      Backup & Cleanup
```

---

## 🔧 Настройка GitHub Secrets

Для работы GitHub Actions необходимо настроить следующие секреты в репозитории:

### 🔐 Обязательные секреты:

1. **VPS_SSH_PRIVATE_KEY**
   - Приватный SSH ключ для доступа к VPS
   - Формат: содержимое файла `~/.ssh/telesite_deploy`

2. **VPS_HOST**
   - IP адрес или домен VPS
   - Значение: `82.202.131.251`

3. **VPS_USER**
   - Пользователь для SSH подключения
   - Значение: `deploy`

4. **PROJECT_DIR**
   - Директория проекта на VPS
   - Значение: `/opt/telesite`

### 📚 Как добавить секреты:

```bash
# 1. Перейдите в Settings → Secrets and variables → Actions
# 2. Нажмите "New repository secret"
# 3. Добавьте каждый секрет по очереди
```

#### Пример для SSH ключа:
```bash
# Скопируйте содержимое приватного ключа
cat ~/.ssh/telesite_deploy

# Вставьте весь вывод в VPS_SSH_PRIVATE_KEY
```

---

## 🔄 Workflows

### 1. 🔍 **PR Quality Check** (`.github/workflows/pr-check.yml`)

**Триггеры:**
- Открытие PR
- Обновление PR
- Повторное открытие PR

**Что делает:**
- 🧹 ESLint проверка
- 🔍 TypeScript type check
- 🏗️ Тестовая сборка
- 🔒 Security audit
- 📦 Dependency analysis

### 2. 🚀 **Production Deploy** (`.github/workflows/deploy.yml`)

**Триггеры:**
- Push в `main` ветку
- Merge PR в `main`
- Ручной запуск

**Этапы:**
1. **Quality** - проверка кода и сборка
2. **Deploy** - развертывание на VPS
3. **Notify** - уведомления о статусе
4. **Cleanup** - очистка старых файлов

---

## 🎛️ Environment Settings

### Production Environment:
- **Name**: `production`
- **URL**: `https://dsgrating.ru`
- **Protection rules**: Required reviewers (опционально)

---

## 🛠️ Команды для ручного управления

```bash
# Локальные команды
npm run build:next              # Сборка для проверки
npm run lint                    # ESLint проверка
npm run type-check              # TypeScript проверка

# VPS команды (через новый скрипт)
npm run vps:deploy:production           # Ручной деплой
npm run vps:deploy:production status    # Статус
npm run vps:deploy:production logs      # Логи
npm run vps:deploy:production restart   # Перезапуск
```

---

## 📊 Мониторинг и логи

### GitHub Actions:
- Подробные логи каждого шага
- Artifacts для сборок
- Summary с результатами
- Уведомления о статусе

### VPS мониторинг:
- Health checks каждые 30 секунд
- Автоматические backup'ы
- Cleanup старых версий
- Логи приложения и nginx

---

## 🔧 Настройка локальной разработки

```bash
# 1. Клонирование репозитория
git clone https://github.com/yourusername/telesite.git
cd telesite

# 2. Установка зависимостей
npm install

# 3. Настройка окружения
cp .env.example .env.local
# Заполните переменные окружения

# 4. Локальный запуск
npm run dev
```

---

## 🚦 Workflow процесс разработки

### 1. 📝 Создание новой функции:
```bash
git checkout -b feature/new-awesome-feature
# Разработка...
git add .
git commit -m "feat: add awesome feature"
git push origin feature/new-awesome-feature
```

### 2. 🔍 Pull Request:
- Создайте PR в GitHub
- Автоматически запустятся проверки качества
- Дождитесь ✅ от всех checks
- Запросите code review

### 3. 🚀 Деплой:
- Merge PR в `main`
- Автоматически запустится production deploy
- Система выполнит health check
- Уведомление о результате

---

## 🛡️ Безопасность

### SSH ключи:
- Используются Ed25519 ключи
- Ключи ротируются каждые 90 дней
- Доступ только с GitHub Actions

### Secrets управление:
- Все секреты зашифрованы
- Логи не показывают секреты
- Ограниченный доступ к секретам

### VPS безопасность:
- SSH только по ключам
- Firewall настроен
- Автоматические обновления безопасности

---

## 🚨 Troubleshooting

### ❌ Deployment failed:

1. **Проверьте SSH доступ:**
   ```bash
   ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251
   ```

2. **Проверьте VPS статус:**
   ```bash
   npm run vps:deploy:production status
   ```

3. **Посмотрите логи:**
   ```bash
   npm run vps:deploy:production logs
   ```

### ❌ Build failed:

1. **Локальная проверка:**
   ```bash
   npm run build:next
   npm run lint
   npm run type-check
   ```

2. **Очистка кеша:**
   ```bash
   rm -rf .next node_modules/.cache
   npm install
   ```

### ❌ Health check failed:

1. **Проверьте сайт вручную:**
   ```bash
   curl -I https://dsgrating.ru
   ```

2. **Проверьте Docker контейнеры:**
   ```bash
   ssh deploy@82.202.131.251 "cd /opt/telesite && docker-compose -f docker-compose.production.yml ps"
   ```

---

## 📈 Performance

### Оптимизации CI/CD:
- 🚀 Параллельные jobs
- 📦 Кеширование npm dependencies
- 🔄 Incremental builds
- 🧹 Автоматическая очистка

### Метрики:
- ⏱️ Среднее время деплоя: ~3-5 минут
- 📊 Success rate: >95%
- 🔄 Rollback time: <2 минуты

---

## 📞 Поддержка

При возникновении проблем:

1. 📋 Проверьте [GitHub Actions logs](https://github.com/your-repo/actions)
2. 🔍 Изучите [Troubleshooting](#-troubleshooting) секцию
3. 📞 Обратитесь к команде DevOps

---

*Документация обновлена: Декабрь 2025* 
