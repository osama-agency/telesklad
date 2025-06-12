#!/bin/bash

# Скрипт для деплоя Telesite на VPS через Docker
set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Функция для проверки зависимостей
check_dependencies() {
    log "Проверяем зависимости..."

    if ! command -v docker &> /dev/null; then
        error "Docker не установлен! Установите Docker и попробуйте снова."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose не установлен! Установите Docker Compose и попробуйте снова."
        exit 1
    fi

    success "Все зависимости установлены"
}

# Функция для создания SSL сертификатов
setup_ssl() {
    log "Настройка SSL сертификатов..."

    if [ ! -f "./ssl/selfsigned.crt" ]; then
        log "Генерируем самоподписанные SSL сертификаты..."
        chmod +x scripts/generate-ssl.sh
        ./scripts/generate-ssl.sh
    else
        success "SSL сертификаты уже существуют"
    fi
}

# Функция для настройки переменных окружения
setup_env() {
    log "Настройка переменных окружения..."

    if [ ! -f ".env" ]; then
        log "Создаем .env файл из шаблона..."
        cp docker.env .env
        warning "Отредактируйте .env файл перед запуском!"
        echo ""
        echo "Основные переменные для изменения:"
        echo "- POSTGRES_PASSWORD: смените пароль базы данных"
        echo "- NEXTAUTH_SECRET: установите секретный ключ"
        echo "- NEXTAUTH_URL: укажите ваш домен"
        echo ""
        read -p "Нажмите Enter после редактирования .env файла..."
    else
        success ".env файл существует"
    fi
}

# Функция для сборки образов
build_images() {
    log "Собираем Docker образы..."

    docker-compose build --no-cache

    success "Образы собраны успешно"
}

# Функция для запуска приложения
start_application() {
    log "Запускаем приложение..."

    # Останавливаем существующие контейнеры
    docker-compose down 2>/dev/null || true

    # Запускаем приложение
    docker-compose up -d

    success "Приложение запущено"
}

# Функция для проверки здоровья
health_check() {
    log "Проверяем состояние приложения..."

    # Ждем запуска
    sleep 10

    # Проверяем статус контейнеров
    if docker-compose ps | grep -q "Up"; then
        success "Контейнеры запущены"
    else
        error "Некоторые контейнеры не запустились"
        docker-compose logs --tail=20
        exit 1
    fi

    # Проверяем health check
    for i in {1..30}; do
        if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
            success "Приложение отвечает на health check"
            break
        fi

        if [ $i -eq 30 ]; then
            error "Приложение не отвечает на health check"
            docker-compose logs app --tail=20
            exit 1
        fi

        log "Ожидание запуска приложения... ($i/30)"
        sleep 2
    done
}

# Функция для показа информации после деплоя
show_info() {
    echo ""
    echo -e "${GREEN}${ROCKET} Деплой завершен успешно!${NC}"
    echo ""
    echo "📍 Доступные URL:"
    echo "   - HTTP: http://localhost"
    echo "   - HTTPS: https://localhost (самоподписанный сертификат)"
    echo "   - Приложение: http://localhost:3000"
    echo "   - Health Check: http://localhost:3000/api/health"
    echo ""
    echo "🗄️ База данных:"
    echo "   - PostgreSQL: localhost:5432"
    echo "   - Пользователь: $(grep POSTGRES_USER .env | cut -d'=' -f2)"
    echo "   - База: $(grep POSTGRES_DB .env | cut -d'=' -f2)"
    echo ""
    echo "🔧 Управление:"
    echo "   - Остановить: docker-compose down"
    echo "   - Логи: docker-compose logs -f"
    echo "   - Статус: docker-compose ps"
    echo "   - Restart: docker-compose restart"
    echo ""
}

# Основная функция
main() {
    echo -e "${BLUE}${ROCKET} Начинаем деплой Telesite на VPS${NC}"
    echo ""

    check_dependencies
    setup_ssl
    setup_env
    build_images
    start_application
    health_check
    show_info
}

# Обработка аргументов командной строки
case "${1:-}" in
    "build")
        build_images
        ;;
    "start")
        start_application
        ;;
    "stop")
        docker-compose down
        ;;
    "restart")
        docker-compose restart
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        docker-compose ps
        ;;
    "health")
        curl -s http://localhost:3000/api/health | jq . || echo "Health check failed"
        ;;
    *)
        main
        ;;
esac
