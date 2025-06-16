#!/bin/bash

echo "🔄 Переключение на удаленную базу данных..."

# Создаем резервную копию текущего .env файла
if [ -f .env ]; then
    cp .env .env.local.backup
    echo "✅ Создана резервная копия локальных настроек: .env.local.backup"
fi

# Создаем новый .env файл с подключением к удаленной базе
cat > .env << EOF
# Remote Database Configuration
DATABASE_URL="postgresql://admin:admin@89.169.38.127:5433/webapp_production"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-key-here"

# Telegram Bot Configuration (если есть)
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""

# Exchange Rate API
EXCHANGE_RATE_API_KEY=""
EOF

echo "✅ Создан новый .env файл с подключением к удаленной базе"

# Генерируем Prisma клиент
echo "🔧 Генерация Prisma клиента..."
npx prisma generate

echo "✅ Готово! Теперь приложение подключено к удаленной базе данных"
echo ""
echo "📌 Для возврата к локальной базе используйте:"
echo "   cp .env.local.backup .env && npx prisma generate" 