#!/bin/bash

# Скрипт для генерации самоподписанных SSL сертификатов
# Используйте только для тестирования! В production используйте Let's Encrypt

set -e

SSL_DIR="./ssl"
CERT_FILE="$SSL_DIR/selfsigned.crt"
KEY_FILE="$SSL_DIR/selfsigned.key"
DOMAIN="${1:-localhost}"

echo "🔐 Generating SSL certificates for domain: $DOMAIN"

# Создаем директорию для SSL
mkdir -p "$SSL_DIR"

# Генерируем приватный ключ
echo "🔑 Generating private key..."
openssl genrsa -out "$KEY_FILE" 2048

# Генерируем самоподписанный сертификат
echo "📜 Generating self-signed certificate..."
openssl req -new -x509 -key "$KEY_FILE" -out "$CERT_FILE" -days 365 \
    -subj "/C=RU/ST=Moscow/L=Moscow/O=Telesite/OU=IT/CN=$DOMAIN"

# Устанавливаем правильные права доступа
chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"

echo "✅ SSL certificates generated successfully:"
echo "   Certificate: $CERT_FILE"
echo "   Private Key: $KEY_FILE"
echo ""
echo "⚠️  WARNING: These are self-signed certificates!"
echo "   For production, use Let's Encrypt or purchase SSL certificates."
echo ""
echo "🚀 To generate Let's Encrypt certificates, run:"
echo "   ./scripts/setup-letsencrypt.sh yourdomain.com"
