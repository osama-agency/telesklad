# 🚀 Быстрая настройка автодеплоя

## 1️⃣ Добавьте секреты в GitHub

Перейдите в репозиторий → `Settings` → `Secrets and variables` → `Actions`

Добавьте:
- `VPS_HOST`: **82.202.131.251**
- `VPS_USERNAME`: **deploy**
- `VPS_PORT`: **22**
- `VPS_SSH_KEY`: (содержимое `~/.ssh/telesite_deploy`)

Получить SSH ключ:
```bash
cat ~/.ssh/telesite_deploy
```

## 2️⃣ Проверьте локально

```bash
# Тест подключения и настроек
npm run deploy:test
```

## 3️⃣ Запустите автодеплой

```bash
git add .
git commit -m "feat: автодеплой настроен"
git push origin main
```

**Готово!** 🎉 Теперь каждый push в main автоматически деплоит на VPS.

## 📱 Дополнительные команды

```bash
# Ручной деплой
npm run deploy:manual

# Логи с VPS
npm run vps:logs

# SSH на VPS
npm run vps:shell

# Статус контейнеров
npm run vps:status
```

## ⚠️ Проблемы?

1. **SIGKILL при сборке** → Используйте workflow "Simple Deploy" в GitHub Actions
2. **Permission denied** → Проверьте SSH ключ: `ssh-add ~/.ssh/telesite_deploy`
3. **Подробная документация** → См. `GITHUB_ACTIONS_DEPLOY_SETUP.md` 
