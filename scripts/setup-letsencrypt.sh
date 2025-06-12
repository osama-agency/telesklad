#!/bin/bash

# Проверка аргументов
if [ -z "$1" ]; then
    echo "Использование: $0 <domain-name> [email]"
    echo "Пример: $0 example.com admin@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}
VPS_IP="82.202.131.251"
SSH_KEY="~/.ssh/telesite_deploy"

echo "🔐 Настройка Let's Encrypt для домена: $DOMAIN"
echo "📧 Email: $EMAIL"
echo "🖥️ VPS: $VPS_IP"
echo ""

# Проверка DNS
echo "🔍 Проверка DNS записи..."
DNS_IP=$(dig +short $DOMAIN)
if [ "$DNS_IP" != "$VPS_IP" ]; then
    echo "❌ DNS запись не указывает на VPS!"
    echo "   Домен $DOMAIN разрешается в: $DNS_IP"
    echo "   Ожидается: $VPS_IP"
    echo ""
    echo "📝 Настройте DNS запись типа A:"
    echo "   $DOMAIN -> $VPS_IP"
    exit 1
fi
echo "✅ DNS настроен правильно"

# Установка certbot на VPS
echo ""
echo "📦 Установка Certbot на VPS..."
ssh -i $SSH_KEY deploy@$VPS_IP "sudo apt-get update && sudo apt-get install -y certbot"

# Создание временной конфигурации для получения сертификата
echo ""
echo "🔧 Создание временной конфигурации..."
ssh -i $SSH_KEY deploy@$VPS_IP "cd /opt/telesite && cat > nginx-certbot.conf << 'EOF'
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 404;
    }
}
EOF"

# Запуск временного nginx для получения сертификата
echo ""
echo "🚀 Запуск временного Nginx..."
ssh -i $SSH_KEY deploy@$VPS_IP "cd /opt/telesite && \
    docker run -d --name nginx-certbot \
    -p 80:80 \
    -v ./nginx-certbot.conf:/etc/nginx/conf.d/default.conf:ro \
    -v certbot-www:/var/www/certbot \
    nginx:alpine"

# Получение сертификата
echo ""
echo "📜 Получение SSL сертификата..."
ssh -i $SSH_KEY deploy@$VPS_IP "sudo certbot certonly \
    --webroot \
    --webroot-path=/var/lib/docker/volumes/telesite_certbot-www/_data \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN"

# Остановка временного nginx
echo ""
echo "🛑 Остановка временного Nginx..."
ssh -i $SSH_KEY deploy@$VPS_IP "docker stop nginx-certbot && docker rm nginx-certbot"

# Копирование сертификатов
echo ""
echo "📋 Копирование сертификатов..."
ssh -i $SSH_KEY deploy@$VPS_IP "cd /opt/telesite && \
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem && \
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem && \
    sudo chown deploy:deploy ssl/*.pem"

# Обновление nginx конфигурации
echo ""
echo "🔄 Обновление Nginx конфигурации..."
ssh -i $SSH_KEY deploy@$VPS_IP "cd /opt/telesite && \
    sed -i 's/server_name 82.202.131.251;/server_name $DOMAIN;/g' nginx-ssl.conf"

# Обновление NEXTAUTH_URL
echo ""
echo "🔧 Обновление NEXTAUTH_URL..."
ssh -i $SSH_KEY deploy@$VPS_IP "cd /opt/telesite && \
    sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://$DOMAIN|' .env"

# Перезапуск с новой конфигурацией
echo ""
echo "🔄 Перезапуск приложения с новыми сертификатами..."
ssh -i $SSH_KEY deploy@$VPS_IP "cd /opt/telesite && \
    docker-compose -f docker-compose.ssl.yml down && \
    docker-compose -f docker-compose.ssl.yml up -d"

# Настройка автоматического обновления
echo ""
echo "⏰ Настройка автоматического обновления сертификата..."
ssh -i $SSH_KEY deploy@$VPS_IP "sudo crontab -l | { cat; echo '0 0 * * 0 certbot renew --webroot --webroot-path=/var/lib/docker/volumes/telesite_certbot-www/_data --post-hook \"cd /opt/telesite && docker-compose -f docker-compose.ssl.yml restart nginx\"'; } | sudo crontab -"

echo ""
echo "✅ Настройка Let's Encrypt завершена!"
echo ""
echo "🌐 Ваш сайт доступен по адресу: https://$DOMAIN"
echo "🔒 SSL сертификат будет автоматически обновляться"
echo ""
echo "📝 Примечание: Если вы используете Cloudflare, установите SSL режим на 'Full (strict)'"
