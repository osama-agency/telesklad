#!/bin/bash

# 🧹 Скрипт полной очистки VPS
echo "🧹 Starting VPS cleanup..."

# Переходим в папку проекта
cd /opt/telesite || exit 1

# Останавливаем все контейнеры
echo "⏹️ Stopping all containers..."
docker-compose -f docker-compose.ssl.yml down --volumes --remove-orphans || true
docker-compose -f docker-compose.letsencrypt.yml down --volumes --remove-orphans || true
docker-compose -f docker-compose.http.yml down --volumes --remove-orphans || true

# Очищаем Git репозиторий
echo "🔄 Cleaning Git repository..."
git stash || true
git clean -fd || true
git reset --hard HEAD || true
git pull origin main

# Полная очистка Docker
echo "🗑️ Deep cleaning Docker..."
docker system prune -af --volumes || true
docker builder prune -af || true
docker volume prune -f || true
docker network prune -f || true

# Удаляем все образы (кроме базовых)
echo "🖼️ Removing all images except base ones..."
docker images --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}" | grep -v "node\|postgres\|nginx" | awk '{print $2}' | xargs -r docker rmi -f || true

# Очищаем логи Docker
echo "📝 Cleaning Docker logs..."
sudo truncate -s 0 /var/lib/docker/containers/*/*-json.log || true

# Очищаем системные логи
echo "📋 Cleaning system logs..."
sudo journalctl --vacuum-time=7d || true
sudo journalctl --vacuum-size=100M || true

# Очищаем временные файлы
echo "🗂️ Cleaning temporary files..."
sudo rm -rf /tmp/* || true
sudo rm -rf /var/tmp/* || true

# Очищаем кэш пакетов
echo "📦 Cleaning package cache..."
sudo apt-get clean || true
sudo apt-get autoremove -y || true

# Показываем освобожденное место
echo "💾 Disk usage after cleanup:"
df -h /

echo "✅ VPS cleanup completed!"
