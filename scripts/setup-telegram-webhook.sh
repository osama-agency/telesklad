#!/bin/bash

# Настройка Telegram webhook для закупок
# Использование: ./scripts/setup-telegram-webhook.sh

BOT_TOKEN="8159006212:AAH1nTH2RaKQLv9bVgPvg4VQm4aeiOEEUQc"
WEBHOOK_URL="https://ваш-домен.com/api/telegram/webhook"

echo "🤖 Настройка Telegram webhook для закупок..."
echo "Bot Token: ${BOT_TOKEN:0:20}..."
echo "Webhook URL: $WEBHOOK_URL"
echo ""

# Функция для проверки ответа API
check_response() {
    local response="$1"
    local description="$2"
    
    if echo "$response" | grep -q '"ok":true'; then
        echo "✅ $description - успешно"
        return 0
    else
        echo "❌ $description - ошибка"
        echo "Ответ: $response"
        return 1
    fi
}

# 1. Проверяем текущий статус webhook
echo "📡 Проверяем текущий webhook..."
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo")
check_response "$WEBHOOK_INFO" "Получение информации о webhook"

echo "Текущий webhook:"
echo "$WEBHOOK_INFO" | jq '.' 2>/dev/null || echo "$WEBHOOK_INFO"
echo ""

# 2. Удаляем старый webhook (если есть)
echo "🗑️ Удаляем старый webhook..."
DELETE_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/deleteWebhook")
check_response "$DELETE_RESPONSE" "Удаление старого webhook"
echo ""

# 3. Устанавливаем новый webhook
echo "🔗 Устанавливаем новый webhook..."
SET_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{
        \"url\": \"$WEBHOOK_URL\",
        \"allowed_updates\": [\"message\", \"callback_query\"],
        \"drop_pending_updates\": true
    }")

if check_response "$SET_RESPONSE" "Установка нового webhook"; then
    echo ""
    echo "🎉 Webhook успешно настроен!"
else
    echo ""
    echo "❌ Не удалось настроить webhook"
    exit 1
fi

# 4. Проверяем установленный webhook
echo ""
echo "🔍 Проверяем установленный webhook..."
FINAL_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo")
echo "$FINAL_INFO" | jq '.' 2>/dev/null || echo "$FINAL_INFO"

# 5. Тестируем webhook endpoint
echo ""
echo "🧪 Тестируем webhook endpoint..."
TEST_RESPONSE=$(curl -s -X GET "$WEBHOOK_URL")
if echo "$TEST_RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook endpoint отвечает корректно"
else
    echo "⚠️ Webhook endpoint может быть недоступен"
    echo "Ответ: $TEST_RESPONSE"
fi

echo ""
echo "📋 Настройка завершена!"
echo ""
echo "🔧 Следующие шаги:"
echo "1. Убедитесь, что ваш сервер доступен по адресу: $WEBHOOK_URL"
echo "2. Проверьте переменные окружения:"
echo "   - TELEGRAM_BOT_TOKEN=$BOT_TOKEN"
echo "   - NEXTAUTH_URL должен содержать правильный домен"
echo "3. Протестируйте отправку закупки поставщику"
echo ""
echo "👥 Участники системы:"
echo "   - Поставщик: 7828956680"
echo "   - Администратор: 125861752"
echo "   - Группа: -4729817036" 