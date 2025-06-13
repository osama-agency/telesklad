#!/bin/bash

# 🧪 Скрипт для локального тестирования деплоя
# Позволяет проверить деплой без GitHub Actions

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Тестирование деплоя локально...${NC}"

# Проверка переменных окружения
if [ -z "$VPS_HOST" ]; then
    echo -e "${YELLOW}⚠️  VPS_HOST не установлен. Используем значение по умолчанию.${NC}"
    VPS_HOST="82.202.131.251"
fi

if [ -z "$VPS_USERNAME" ]; then
    echo -e "${YELLOW}⚠️  VPS_USERNAME не установлен. Используем 'deploy'.${NC}"
    VPS_USERNAME="deploy"
fi

# Проверка SSH ключа
SSH_KEY_PATH="$HOME/.ssh/telesite_deploy"
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo -e "${RED}❌ SSH ключ не найден: $SSH_KEY_PATH${NC}"
    echo "Создайте ключ командой:"
    echo "ssh-keygen -t rsa -b 4096 -f $SSH_KEY_PATH"
    exit 1
fi

echo -e "${GREEN}📋 Параметры деплоя:${NC}"
echo "   Host: $VPS_HOST"
echo "   User: $VPS_USERNAME"
echo "   Key: $SSH_KEY_PATH"
echo ""

# Проверка подключения
echo -e "${GREEN}🔌 Проверка SSH подключения...${NC}"
if ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=5 "$VPS_USERNAME@$VPS_HOST" "echo '✅ SSH подключение успешно!'" 2>/dev/null; then
    echo -e "${GREEN}✅ SSH подключение работает${NC}"
else
    echo -e "${RED}❌ Не удалось подключиться по SSH${NC}"
    exit 1
fi

# Симуляция деплоя
echo -e "${GREEN}🚀 Запуск тестового деплоя...${NC}"

ssh -i "$SSH_KEY_PATH" "$VPS_USERNAME@$VPS_HOST" << 'ENDSSH'
set -e

echo "🚀 Starting test deployment..."

# Переходим в папку проекта
cd /opt/telesite || { echo "❌ Директория /opt/telesite не найдена"; exit 1; }

# Проверка git
echo "🔍 Проверка git репозитория..."
if [ -d .git ]; then
    echo "✅ Git репозиторий найден"
    git status
else
    echo "❌ Git репозиторий не найден"
    exit 1
fi

# Проверка Docker
echo "🐳 Проверка Docker..."
docker --version || { echo "❌ Docker не установлен"; exit 1; }
docker-compose --version || { echo "❌ Docker Compose не установлен"; exit 1; }

# Проверка файлов
echo "📁 Проверка необходимых файлов..."
[ -f "docker-compose.yml" ] || { echo "❌ docker-compose.yml не найден"; exit 1; }
[ -f "docker-compose.ssl.yml" ] || { echo "❌ docker-compose.ssl.yml не найден"; exit 1; }
[ -f "Dockerfile" ] || { echo "❌ Dockerfile не найден"; exit 1; }
[ -f ".env" ] || echo "⚠️  .env файл не найден - используются значения по умолчанию"

# Проверка памяти
echo "💾 Проверка памяти..."
free -h
df -h /

# Проверка контейнеров
echo "🐳 Текущие контейнеры:"
docker-compose -f docker-compose.ssl.yml ps || true

echo "✅ Тестовая проверка завершена успешно!"
ENDSSH

echo ""
echo -e "${GREEN}✅ Локальный тест деплоя завершен!${NC}"
echo ""
echo -e "${YELLOW}📋 Следующие шаги:${NC}"
echo "1. Добавьте секреты в GitHub репозиторий"
echo "2. Сделайте коммит и push в main ветку"
echo "3. GitHub Actions автоматически запустит деплой"
echo ""
echo -e "${GREEN}💡 Совет:${NC} Для ручного деплоя используйте:"
echo "   npm run vps:deploy"
