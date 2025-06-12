#!/bin/bash

echo "🔍 Диагностика VPS - $(date)"
echo "=================================="

# SSH подключение
echo "📡 Проверка SSH подключения..."
if ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "echo 'SSH OK'" >/dev/null 2>&1; then
    echo "✅ SSH подключение работает"
else
    echo "❌ SSH подключение не работает"
    exit 1
fi

# Статус Docker
echo ""
echo "🐳 Статус Docker контейнеров..."
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "cd /opt/telesite && docker-compose ps"

# Статус сервисов
echo ""
echo "🌐 Проверка доступности сайта..."
if curl -s http://82.202.131.251 >/dev/null; then
    echo "✅ Сайт доступен по HTTP"
else
    echo "❌ Сайт недоступен по HTTP"
fi

if curl -k -s https://82.202.131.251 >/dev/null; then
    echo "✅ Сайт доступен по HTTPS (самоподписанный сертификат)"
else
    echo "❌ Сайт недоступен по HTTPS"
fi

# Health check
echo ""
echo "🏥 Health Check..."
if curl -s http://82.202.131.251/api/health >/dev/null; then
    echo "✅ API Health работает"
else
    echo "❌ API Health не работает"
fi

# Логи (последние 5 строк)
echo ""
echo "📋 Последние логи приложения..."
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "cd /opt/telesite && docker-compose logs --tail=5 app" 2>/dev/null || echo "Логи приложения недоступны"

echo ""
echo "=================================="
echo "Проверка завершена - $(date)"
