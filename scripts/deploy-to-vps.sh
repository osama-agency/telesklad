#!/bin/bash

# Скрипт для автоматического деплоя на VPS
set -e

# Конфигурация
VPS_HOST="82.202.131.251"
VPS_USER="deploy"  # Используем безопасного пользователя
SSH_KEY="~/.ssh/telesite_deploy"
PROJECT_DIR="/opt/telesite"
REPO_URL="https://github.com/osama-agency/telesklad.git"  # Замените на ваш репозиторий

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Эмодзи
ROCKET="🚀"
CHECK="✅"
CROSS="❌"
WARNING="⚠️"
INFO="ℹ️"

log() {
    echo -e "${BLUE}${INFO} $1${NC}"
}

success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

error() {
    echo -e "${RED}${CROSS} $1${NC}"
}

# Функция проверки SSH подключения
check_ssh() {
    log "Проверяем SSH подключение к VPS..."

    if ssh -i $SSH_KEY -o ConnectTimeout=10 -o BatchMode=yes $VPS_USER@$VPS_HOST exit 2>/dev/null; then
        success "SSH подключение работает"
    else
        error "SSH подключение не работает!"
        echo ""
        echo "Возможные причины:"
        echo "1. SSH ключи не настроены"
        echo "2. Пользователь 'deploy' не создан на сервере"
        echo "3. Сервер недоступен"
        echo ""
        echo "Для первоначальной настройки выполните:"
        echo "1. ssh root@$VPS_HOST"
        echo "2. Следуйте инструкциям в VPS_SETUP_GUIDE.md"
        exit 1
    fi
}

# Функция для первоначальной настройки VPS
setup_vps() {
    log "Настраиваем VPS для первого деплоя..."

    ssh -i $SSH_KEY $VPS_USER@$VPS_HOST << 'EOF'
        # Обновляем систему
        sudo apt update && sudo apt upgrade -y

        # Устанавливаем необходимые пакеты
        sudo apt install -y git curl wget htop nano

        # Проверяем Docker
        if ! command -v docker &> /dev/null; then
            echo "Installing Docker..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker $USER
            rm get-docker.sh
        fi

        # Проверяем Docker Compose
        if ! command -v docker-compose &> /dev/null; then
            echo "Installing Docker Compose..."
            sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            sudo chmod +x /usr/local/bin/docker-compose
        fi

        # Создаем рабочую директорию
        sudo mkdir -p /opt/telesite
        sudo chown deploy:deploy /opt/telesite

        echo "VPS setup completed!"
EOF

    success "VPS настроен"
}

# Функция для отправки файлов на VPS
upload_files() {
    log "Отправляем файлы на VPS..."

    # Создаем архив проекта
    tar -czf telesite.tar.gz \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='backend/dist' \
        --exclude='backend/node_modules' \
        .

    # Отправляем архив
    scp -i $SSH_KEY telesite.tar.gz $VPS_USER@$VPS_HOST:$PROJECT_DIR/

    # Очищаем локальный архив
    rm telesite.tar.gz

    success "Файлы отправлены"
}

# Функция для деплоя на VPS
deploy() {
    log "Запускаем деплой на VPS..."

    ssh -i $SSH_KEY $VPS_USER@$VPS_HOST << EOF
        cd $PROJECT_DIR

        # Останавливаем существующие контейнеры
        if [ -f docker-compose.yml ]; then
            docker-compose down 2>/dev/null || true
        fi

        # Распаковываем новые файлы
        tar -xzf telesite.tar.gz
        rm telesite.tar.gz

        # Делаем скрипты исполняемыми
        chmod +x scripts/*.sh docker-entrypoint.sh

        # Генерируем SSL сертификаты если их нет
        if [ ! -f ssl/selfsigned.crt ]; then
            # SSL certificates are handled by host nginx now
        fi

        # Настраиваем .env если его нет
        if [ ! -f .env ]; then
            cp docker.env .env
            echo "⚠️  ВАЖНО: Отредактируйте .env файл с правильными паролями!"
        fi

        # Собираем и запускаем
        docker-compose build --no-cache
        docker-compose up -d

        echo "Deployment completed!"
EOF

    success "Деплой завершен"
}

# Функция для проверки статуса
check_status() {
    log "Проверяем статус приложения..."

    ssh -i $SSH_KEY $VPS_USER@$VPS_HOST << 'EOF'
        cd /opt/telesite

        echo "📊 Статус контейнеров:"
        docker-compose ps
        echo ""

        echo "🔍 Проверяем health check..."
        sleep 5

        for i in {1..12}; do
            if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
                echo "✅ Приложение отвечает!"
                curl -s http://localhost:3000/api/health | head -3
                break
            fi

            if [ $i -eq 12 ]; then
                echo "❌ Приложение не отвечает"
                echo "Логи:"
                docker-compose logs --tail=10 app
            else
                echo "⏳ Ожидание... ($i/12)"
                sleep 5
            fi
        done
EOF
}

# Функция для показа информации
show_info() {
    echo ""
    echo -e "${GREEN}${ROCKET} Деплой на VPS завершен!${NC}"
    echo ""
    echo "📍 Доступ к приложению:"
    echo "   - HTTP: http://$VPS_HOST"
    echo "   - HTTPS: https://$VPS_HOST (самоподписанный)"
    echo "   - Прямой доступ: http://$VPS_HOST:3000"
    echo ""
    echo "🔧 Управление на сервере:"
    echo "   ssh $VPS_USER@$VPS_HOST"
    echo "   cd $PROJECT_DIR"
    echo "   docker-compose logs -f"
    echo ""
}

# Основная функция
main() {
    echo -e "${BLUE}${ROCKET} Начинаем деплой Telesite на VPS${NC}"
    echo ""

    check_ssh
    upload_files
    deploy
    check_status
    show_info
}

# Обработка аргументов
case "${1:-}" in
    "setup")
        check_ssh
        setup_vps
        ;;
    "upload")
        check_ssh
        upload_files
        ;;
    "status")
        check_ssh
        check_status
        ;;
    "logs")
        ssh -i $SSH_KEY $VPS_USER@$VPS_HOST "cd $PROJECT_DIR && docker-compose logs -f"
        ;;
    "shell")
        ssh -i $SSH_KEY $VPS_USER@$VPS_HOST
        ;;
    *)
        main
        ;;
esac
