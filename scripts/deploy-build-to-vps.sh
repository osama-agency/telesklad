#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Конфигурация
VPS_HOST="82.202.131.251"
VPS_USER="deploy"
VPS_PATH="/opt/telesite"
SSH_KEY="$HOME/.ssh/telesite_deploy"

echo -e "${GREEN}🚀 Deploying pre-built application to VPS...${NC}"

# Проверяем наличие .next директории
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Error: .next directory not found. Please run 'npm run build:next' first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Creating deployment archive...${NC}"
# Создаем архив с необходимыми файлами
tar --exclude='node_modules' \
    --exclude='backend/node_modules' \
    --exclude='*.log' \
    --exclude='.git' \
    -czf deploy.tar.gz \
    .next \
    public \
    package.json \
    package-lock.json \
    next.config.ts \
    middleware.ts \
    src \
    backend \
    start-production.js \
    docker-compose.ssl.yml \
    Dockerfile.simple \
    nginx-ssl.conf \
    .env.local 2>/dev/null || true

echo -e "${YELLOW}📤 Uploading to VPS...${NC}"
scp -i "$SSH_KEY" deploy.tar.gz "$VPS_USER@$VPS_HOST:/tmp/"

echo -e "${YELLOW}🔧 Extracting and setting up on VPS...${NC}"
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" << 'EOF'
    set -e

    # Останавливаем текущие контейнеры
    echo "Stopping current containers..."
    cd /opt/telesite
    docker-compose -f docker-compose.ssl.yml down || true

    # Создаем резервную копию
    echo "Creating backup..."
    sudo cp -r /opt/telesite /opt/telesite.backup.$(date +%Y%m%d_%H%M%S) || true

    # Извлекаем новые файлы
    echo "Extracting new files..."
    cd /opt
    sudo tar -xzf /tmp/deploy.tar.gz -C telesite/

    # Устанавливаем права
    sudo chown -R deploy:deploy /opt/telesite

    # Удаляем временный архив
    rm /tmp/deploy.tar.gz

    echo "✅ Files deployed successfully"
EOF

echo -e "${YELLOW}🐳 Starting Docker containers...${NC}"
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" << 'EOF'
    cd /opt/telesite

    # Запускаем контейнеры
    docker-compose -f docker-compose.ssl.yml up -d --build

    # Ждем запуска
    echo "Waiting for services to start..."
    sleep 10

    # Проверяем статус
    docker-compose -f docker-compose.ssl.yml ps
EOF

# Удаляем локальный архив
rm -f deploy.tar.gz

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Check your site at: https://dsgrating.ru${NC}"

# Проверяем доступность сайта
echo -e "${YELLOW}🔍 Checking site availability...${NC}"
sleep 5
if curl -s -o /dev/null -w "%{http_code}" https://dsgrating.ru | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Site is accessible!${NC}"
else
    echo -e "${RED}⚠️  Site might not be accessible yet. Please check manually.${NC}"
    echo -e "${YELLOW}You can check logs with: npm run vps:logs${NC}"
fi
