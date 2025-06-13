#!/bin/bash

# 🚀 Скрипт подготовки VPS для автодеплоя
# Запускать от имени root или с sudo

set -e

echo "🔧 Настройка VPS для автодеплоя..."

# Создание пользователя deploy (если не существует)
if ! id "deploy" &>/dev/null; then
    echo "👤 Создание пользователя deploy..."
    useradd -m -s /bin/bash deploy
    usermod -aG docker,sudo deploy
    echo "deploy ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/deploy
else
    echo "✅ Пользователь deploy уже существует"
fi

# Настройка SSH для пользователя deploy
echo "🔐 Настройка SSH..."
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

# Создание директории проекта
echo "📁 Создание директории проекта..."
mkdir -p /opt/telesite
chown deploy:deploy /opt/telesite

# Клонирование репозитория (если еще не клонирован)
if [ ! -d "/opt/telesite/.git" ]; then
    echo "📥 Клонирование репозитория..."
    cd /opt/telesite
    sudo -u deploy git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
    echo "⚠️  Не забудьте изменить URL репозитория!"
else
    echo "✅ Репозиторий уже клонирован"
fi

# Настройка swap (если памяти меньше 2GB)
TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
if [ $TOTAL_MEM -lt 2000 ]; then
    echo "💾 Настройка swap файла..."
    if [ ! -f /swapfile ]; then
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo "/swapfile none swap sw 0 0" >> /etc/fstab
    else
        echo "✅ Swap уже настроен"
    fi
fi

# Установка Docker (если не установлен)
if ! command -v docker &> /dev/null; then
    echo "🐳 Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "✅ Docker уже установлен"
fi

# Установка Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Установка Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.37.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose уже установлен"
fi

# Настройка файрвола
echo "🔥 Настройка файрвола..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 3011/tcp
ufw --force enable

# Создание .env файла (если не существует)
if [ ! -f "/opt/telesite/.env" ]; then
    echo "📝 Создание .env файла..."
    cat > /opt/telesite/.env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://postgres:your_password@postgres:5432/telesite
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://dsgrating.ru
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
EOF
    chown deploy:deploy /opt/telesite/.env
    echo "⚠️  Не забудьте обновить переменные окружения в .env!"
fi

echo "✅ VPS готов к автодеплою!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Добавьте публичный SSH ключ GitHub Actions в /home/deploy/.ssh/authorized_keys"
echo "2. Обновите переменные окружения в /opt/telesite/.env"
echo "3. Настройте SSL сертификаты (certbot)"
echo "4. Добавьте секреты в GitHub репозиторий"
echo ""
echo "🔑 Для добавления SSH ключа выполните:"
echo "echo 'ВАШ_ПУБЛИЧНЫЙ_КЛЮЧ' >> /home/deploy/.ssh/authorized_keys"
