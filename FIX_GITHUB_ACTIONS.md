# 🚨 Быстрое исправление GitHub Actions

## Проблема
GitHub Actions автодеплой провалился из-за отсутствия настроенных секретов.

## Решение

### Вариант 1: Автоматическая настройка (рекомендуется)

1. Установите GitHub CLI (если еще не установлен):
   ```bash
   # macOS
   brew install gh
   
   # Ubuntu/Debian
   sudo apt install gh
   ```

2. Авторизуйтесь в GitHub:
   ```bash
   gh auth login
   ```

3. Запустите скрипт настройки:
   ```bash
   npm run github:setup
   ```

4. Следуйте инструкциям скрипта

### Вариант 2: Ручная настройка

1. Перейдите в настройки репозитория на GitHub:
   https://github.com/osama-agency/telesklad/settings/secrets/actions

2. Добавьте следующие секреты:

   **VPS_SSH_PRIVATE_KEY**
   ```
   Содержимое файла ~/.ssh/telesite_deploy
   ```

   **VPS_HOST**
   ```
   82.202.131.251
   ```

   **VPS_USER**
   ```
   deploy
   ```

   **PROJECT_DIR**
   ```
   /opt/telesite
   ```

   **TELEGRAM_BOT_TOKEN** (опционально)
   ```
   Ваш токен Telegram бота
   ```

### Вариант 3: Быстрая команда для macOS/Linux

```bash
# Установка GitHub CLI и настройка секретов одной командой
brew install gh && gh auth login && npm run github:setup
```

## Проверка

После настройки секретов:

1. Создайте тестовый коммит:
   ```bash
   echo "test" >> test.txt && git add . && git commit -m "test: GitHub Actions" && git push
   ```

2. Проверьте статус в GitHub Actions:
   https://github.com/osama-agency/telesklad/actions

## Альтернативные методы деплоя

Пока настраиваете GitHub Actions, можете использовать:

```bash
# Быстрый деплой (30 сек)
npm run vps:deploy:build

# Стандартный деплой (3-5 мин)
npm run vps:deploy:production

# Ручной деплой через SSH
npm run deploy:manual
``` 
