#!/bin/bash

# Тестирование системы закупок Telegram
# Использование: ./scripts/test-telegram-system.sh

BOT_TOKEN="8159006212:AAH1nTH2RaKQLv9bVgPvg4VQm4aeiOEEUQc"
BASE_URL="http://localhost:3000"  # Измените на ваш домен
SUPPLIER_ID="7828956680"
ADMIN_ID="125861752"
GROUP_ID="-4729817036"

echo "🧪 Тестирование системы закупок Telegram"
echo "=========================================="
echo ""

# Функция для проверки ответа
check_response() {
    local response="$1"
    local description="$2"
    local expected="$3"
    
    if echo "$response" | grep -q "$expected"; then
        echo "✅ $description"
        return 0
    else
        echo "❌ $description"
        echo "   Ответ: $response"
        return 1
    fi
}

# 1. Проверка бота
echo "1️⃣ Проверка Telegram бота..."
BOT_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe")
check_response "$BOT_INFO" "Бот отвечает" '"ok":true'

BOT_USERNAME=$(echo "$BOT_INFO" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
echo "   Имя бота: @$BOT_USERNAME"
echo ""

# 2. Проверка webhook
echo "2️⃣ Проверка webhook..."
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo")
check_response "$WEBHOOK_INFO" "Webhook настроен" '"url":'

WEBHOOK_URL=$(echo "$WEBHOOK_INFO" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
echo "   URL webhook: $WEBHOOK_URL"
echo ""

# 3. Проверка API endpoints
echo "3️⃣ Проверка API endpoints..."

# Webhook endpoint
WEBHOOK_TEST=$(curl -s "$BASE_URL/api/telegram/webhook")
check_response "$WEBHOOK_TEST" "Webhook endpoint доступен" '"ok":true'

# Purchases API
PURCHASES_TEST=$(curl -s "$BASE_URL/api/purchases")
if echo "$PURCHASES_TEST" | grep -q "purchases\|error"; then
    echo "✅ Purchases API доступен"
else
    echo "❌ Purchases API недоступен"
fi
echo ""

# 4. Проверка WebApp
echo "4️⃣ Проверка WebApp..."
WEBAPP_TEST=$(curl -s "$BASE_URL/telegram-webapp/purchase-editor.html")
if echo "$WEBAPP_TEST" | grep -q "<!DOCTYPE html"; then
    echo "✅ WebApp доступен"
else
    echo "❌ WebApp недоступен"
fi
echo ""

# 5. Тест отправки сообщения
echo "5️⃣ Тест отправки сообщения..."
TEST_MESSAGE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
    -H "Content-Type: application/json" \
    -d "{
        \"chat_id\": \"$ADMIN_ID\",
        \"text\": \"🧪 Тест системы закупок\\n\\nВремя: $(date)\\n\\nСистема работает корректно!\",
        \"parse_mode\": \"HTML\"
    }")

if check_response "$TEST_MESSAGE" "Отправка тестового сообщения" '"ok":true'; then
    MESSAGE_ID=$(echo "$TEST_MESSAGE" | grep -o '"message_id":[^,]*' | cut -d':' -f2 | tr -d '"')
    echo "   ID сообщения: $MESSAGE_ID"
else
    echo "❌ Не удалось отправить тестовое сообщение"
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
echo "   - Поставщик: $SUPPLIER_ID"
echo "   - Администратор: $ADMIN_ID"
echo "   - Группа: $GROUP_ID" 